"use server";
import { sendOTP, verifyOTP } from './emailActions';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { supabase } from '@/utils/supabase';

// Helper to map Supabase user row to frontend expected format
function mapUser(u: any) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.full_name,
    mobile: u.mobile_number,
    email: u.email_id,
    aadhar: u.aadhar_number,
    address: u.address,
    password: u.password_hash,
    type: u.role,
    warned: u.warned,
    warnedAt: u.warned_at,
    cardOverride: u.card_tier,
    kycVerified: u.kyc_verified || false,
  };
}

export async function markKycVerified(email: string) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ kyc_verified: true })
      .eq('email_id', email);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUsers() {
  try {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) throw error;
    
    // Auto-seed admin if not exists
    const adminEmail = 'db1610651@gmail.com';
    const hasAdmin = users.some((u: any) => u.email_id?.toLowerCase() === adminEmail.toLowerCase() && u.role === 'admin');
    
    if (!hasAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Arshad@1234", salt);
      await supabase.from('users').insert([{
        full_name: "Arshad (Admin)",
        email_id: adminEmail,
        mobile_number: "9999999999",
        role: "admin",
        password_hash: hashedPassword 
      }]);
    }
    
    return (users || []).map(mapUser);
  } catch (error) {
    console.error("Error reading users from Supabase:", error);
    return [];
  }
}

export async function saveUsers(users: any[]) {
  // Legacy function - No-op since we directly insert/update in Supabase now
  return true;
}

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const mobile = formData.get('mobile') as string;
    const email = formData.get('email') as string;
    const aadhar = formData.get('aadhar') as string;
    const address = formData.get('address') as string;
    const password = formData.get('password') as string;
    const type = formData.get('type') as 'worker' | 'job-giver' | 'part-time-worker' | 'part-time-job-giver';

    const dbRole = (type === 'part-time-worker') ? 'worker' : 
                   (type === 'part-time-job-giver') ? 'job-giver' : 
                   type;

    if (!email || !password || !name) {
      return { success: false, error: 'Name, Email, and Password are required.' };
    }

    if (mobile && (mobile.length !== 10 || !/^\d{10}$/.test(mobile))) {
      return { success: false, error: 'Mobile number must be exactly 10 digits.' };
    }

    if (aadhar && (aadhar.length !== 12 || !/^\d{12}$/.test(aadhar))) {
      return { success: false, error: 'Aadhar number must be exactly 12 digits.' };
    }

    // Check existing globally
    const { data: existingUsers } = await supabase
      .from('users')
      .select('*')
      .or(`email_id.eq.${email},mobile_number.eq.${mobile}${aadhar ? `,aadhar_number.eq.${aadhar}` : ''}`);

    if (existingUsers && existingUsers.length > 0) {
      const sameRoleUser = existingUsers.find((u: any) => u.role === dbRole);
      if (sameRoleUser) {
        return { success: false, error: `Credential Error: You already have an account with this Email/Mobile/Aadhar. You can log in directly using the login page with your existing password!` };
      } else {
        const firstMatch = existingUsers[0];
        const roleLabel = firstMatch.role === 'worker' ? 'Part-Time / Daily Worker' :
                          firstMatch.role === 'job-giver' ? 'Part-Time / Daily Job Giver' :
                          firstMatch.role;
        return { success: false, error: `Credential Error: These credentials (Email/Mobile/Aadhar) are already registered under a different role (${roleLabel}). Please use unique credentials for your new role.` };
      }
    }

    // Add new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { error } = await supabase.from('users').insert([{
      full_name: name,
      mobile_number: mobile,
      email_id: email,
      aadhar_number: aadhar || null,
      address: address,
      password_hash: hashedPassword,
      role: dbRole
    }]);

    if (error) {
       console.error("Supabase insert error:", error);
       if (error.code === '23505') {
         if (error.message?.includes('email_id')) {
           return { success: false, error: 'Credential Error: This Email is already registered. Please use a different email or log in.' };
         }
         if (error.message?.includes('mobile_number')) {
           return { success: false, error: 'Credential Error: This Mobile Number is already registered. Please use a different mobile number.' };
         }
         if (error.message?.includes('aadhar_number')) {
           return { success: false, error: 'Credential Error: This Aadhar Number is already registered. Please verify your details.' };
         }
         return { success: false, error: 'Credential Error: A user with these credentials already exists.' };
       }
       throw error;
    }

    // Send verification OTP using SMTP transporter
    const otpResult = await sendOTP(email);
    return { success: true, otpResult };
  } catch (error: any) {
    console.error("Error registering user in Supabase:", error);
    return { success: false, error: error.message };
  }
}

export async function loginUser(identifier: string, password: string, type: 'admin' | 'worker' | 'job-giver' | 'part-time-worker' | 'part-time-job-giver') {
  try {
    const dbRole = (type === 'part-time-worker') ? 'worker' : 
                   (type === 'part-time-job-giver') ? 'job-giver' : 
                   type;
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', dbRole)
      .or(`email_id.eq.${identifier},mobile_number.eq.${identifier}`);

    if (error || !users || users.length === 0) {
      return { success: false, error: 'Invalid Mobile Number/Email ID or user type.' };
    }

    const user = users[0];

    // Password check
    let isMatch = false;
    if (user.password_hash) {
      if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, user.password_hash);
      } else {
        isMatch = (user.password_hash === password); // Legacy
      }
    }

    if (!isMatch) {
      return { success: false, error: 'Incorrect password.' };
    }

    if (type === 'admin') {
      const cookieStore = await cookies();
      cookieStore.set('kaammadat_authenticated', 'true', { maxAge: 86400, path: '/' });
      cookieStore.set('kaammadat_user_type', type, { maxAge: 86400, path: '/' });
      cookieStore.set('kaammadat_user_email', user.email_id, { maxAge: 86400, path: '/' });
      
      return { 
        success: true, 
        user: { name: user.full_name, email: user.email_id, mobile: user.mobile_number, type: user.role } 
      };
    } else {
      const otpResult = await sendOTP(user.email_id);
      return {
        success: true,
        user: { name: user.full_name, email: user.email_id, mobile: user.mobile_number, type: user.role },
        otpResult
      };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function requestPasswordResetOTP(email: string, type: 'admin' | 'worker' | 'job-giver' | 'part-time-worker' | 'part-time-job-giver') {
  try {
    const dbRole = (type === 'part-time-worker') ? 'worker' : 
                   (type === 'part-time-job-giver') ? 'job-giver' : 
                   type;
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('email_id', email)
      .eq('role', dbRole);

    if (!users || users.length === 0) {
      return { success: false, error: 'No account found with this email for the selected role.' };
    }

    const otpResult = await sendOTP(email);
    return otpResult;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetPassword(email: string, enteredOtp: string, newPassword: string, type: 'admin' | 'worker' | 'job-giver' | 'part-time-worker' | 'part-time-job-giver') {
  try {
    const dbRole = (type === 'part-time-worker') ? 'worker' : 
                   (type === 'part-time-job-giver') ? 'job-giver' : 
                   type;
    const verifyResult = await verifyOTP(enteredOtp);
    if (!verifyResult.success) {
      return { success: false, error: verifyResult.error || 'Invalid OTP code.' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const { error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('email_id', email)
      .eq('role', dbRole);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── Admin Actions ──────────────────────────────────────────────────────────────

export async function adminGetAllUsers() {
  try {
    const { data: users, error } = await supabase.from('users').select('*').neq('role', 'admin');
    if (error) throw error;
    return (users || []).map(mapUser);
  } catch (error: any) {
    return [];
  }
}

export async function adminSearchUsers(query: string) {
  try {
    const q = query.trim().toLowerCase();
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .neq('role', 'admin')
      .or(`email_id.ilike.%${q}%,mobile_number.ilike.%${q}%,aadhar_number.ilike.%${q}%`);
      
    if (error) throw error;
    return (users || []).map(mapUser);
  } catch (error: any) {
    return [];
  }
}

export async function adminWarnUser(email: string) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ warned: true, warned_at: new Date().toISOString() })
      .eq('email_id', email);
    
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminRemoveUser(email: string) {
  try {
    const { error } = await supabase.from('users').delete().eq('email_id', email);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminSetCard(email: string, tier: string) {
  try {
    const { error } = await supabase.from('users').update({ card_tier: tier }).eq('email_id', email);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
