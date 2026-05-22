"use server";
import fs from 'fs';
import path from 'path';
import { sendOTP, verifyOTP } from './emailActions';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const usersFilePath = path.join(process.cwd(), 'users.json');

export async function getUsers() {
  try {
    let users: any[] = [];
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      users = JSON.parse(data);
    }
    
    // Auto-seed and guarantee that the real secure admin user exists in the container database
    const adminEmail = 'db1610651@gmail.com';
    const hasAdmin = users.some((u: any) => u.email.toLowerCase() === adminEmail.toLowerCase() && u.type === 'admin');
    if (!hasAdmin) {
      users.push({
        id: 999999,
        name: "Arshad (Admin)",
        email: adminEmail,
        password: "Arshad@1234",
        mobile: "9999999999",
        type: "admin"
      });
      try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
      } catch (writeErr) {
        console.warn("Expected read-only filesystem seed bypass:", writeErr);
      }
    }
    return users;
  } catch (error) {
    console.error("Error reading users:", error);
    return [];
  }
}

export async function saveUsers(users: any[]) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error("Error saving users:", error);
    return false;
  }
}

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const mobile = formData.get('mobile') as string;
    const email = formData.get('email') as string;
    const aadhar = formData.get('aadhar') as string;
    const address = formData.get('address') as string;
    const password = formData.get('password') as string;
    const type = formData.get('type') as 'worker' | 'job-giver';

    if (!email || !password || !name) {
      return { success: false, error: 'Name, Email, and Password are required.' };
    }

    if (mobile && (mobile.length !== 10 || !/^\d{10}$/.test(mobile))) {
      return { success: false, error: 'Mobile number must be exactly 10 digits.' };
    }

    if (aadhar && (aadhar.length !== 12 || !/^\d{12}$/.test(aadhar))) {
      return { success: false, error: 'Aadhar number must be exactly 12 digits.' };
    }

    const users = await getUsers();
    
    // 1. Email check
    const existingEmail = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) {
      return { success: false, error: `Credential Error: This Email ID (${email}) is already registered by another user.` };
    }

    // 2. Mobile check
    if (mobile) {
      const existingMobile = users.find((u: any) => u.mobile === mobile);
      if (existingMobile) {
        return { success: false, error: `Credential Error: This Mobile Number (${mobile}) is already registered by another user.` };
      }
    }

    // 3. Aadhar check
    if (aadhar) {
      const existingAadhar = users.find((u: any) => u.aadhar === aadhar);
      if (existingAadhar) {
        return { success: false, error: `Credential Error: This Aadhar Card Number (${aadhar}) is already registered by another user.` };
      }
    }

    // Add new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: Date.now(),
      name,
      mobile,
      email,
      aadhar,
      address,
      password: hashedPassword,
      type
    };

    users.push(newUser);
    await saveUsers(users);

    // Send verification OTP using SMTP transporter
    const otpResult = await sendOTP(email);
    return { success: true, otpResult };
  } catch (error: any) {
    console.error("Error registering user:", error);
    return { success: false, error: error.message };
  }
}

export async function loginUser(identifier: string, password: string, type: 'admin' | 'worker' | 'job-giver') {
  try {
    const users = await getUsers();
    const user = users.find(
      (u: any) => (u.email.toLowerCase() === identifier.toLowerCase() || u.mobile === identifier) && u.type === type
    );

    if (!user) {
      return { success: false, error: 'Invalid Mobile Number/Email ID or user type.' };
    }

    // Backwards compatibility for old unhashed passwords
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (user.password === password);
    }

    if (!isMatch) {
      return { success: false, error: 'Incorrect password.' };
    }

    if (type === 'admin') {
      // Admins bypass OTP and get logged in immediately
      const cookieStore = await cookies();
      cookieStore.set('kaammadat_authenticated', 'true', { maxAge: 86400, path: '/' });
      cookieStore.set('kaammadat_user_type', type, { maxAge: 86400, path: '/' });
      cookieStore.set('kaammadat_user_email', user.email, { maxAge: 86400, path: '/' });
      
      return { 
        success: true, 
        user: { 
          name: user.name, 
          email: user.email, 
          mobile: user.mobile, 
          type: user.type 
        } 
      };
    } else {
      // Workers and Job Givers get an OTP
      const otpResult = await sendOTP(user.email);
      return {
        success: true,
        user: {
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          type: user.type
        },
        otpResult
      };
    }
  } catch (error: any) {
    console.error("Error logging in user:", error);
    return { success: false, error: error.message };
  }
}

export async function requestPasswordResetOTP(email: string, type: 'admin' | 'worker' | 'job-giver') {
  try {
    const users = await getUsers();
    const user = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.type === type
    );

    if (!user) {
      return { success: false, error: 'No account found with this email for the selected role.' };
    }

    // Send OTP to reset password
    const otpResult = await sendOTP(email);
    return otpResult;
  } catch (error: any) {
    console.error("Error sending reset OTP:", error);
    return { success: false, error: error.message };
  }
}

export async function resetPassword(email: string, enteredOtp: string, newPassword: string, type: 'admin' | 'worker' | 'job-giver') {
  try {
    // Validate OTP using verifyOTP logic
    const verifyResult = await verifyOTP(enteredOtp);
    if (!verifyResult.success) {
      return { success: false, error: verifyResult.error || 'Invalid OTP code.' };
    }

    // Update password in database
    const users = await getUsers();
    const userIdx = users.findIndex(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.type === type
    );

    if (userIdx === -1) {
      return { success: false, error: 'User account not found.' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    users[userIdx].password = hashedPassword;
    await saveUsers(users);

    return { success: true };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return { success: false, error: error.message };
  }
}

// ── Admin Actions ──────────────────────────────────────────────────────────────

export async function adminGetAllUsers() {
  try {
    const users = await getUsers();
    return users.filter((u: any) => u.type !== 'admin');
  } catch (error: any) {
    console.error("Error fetching users for admin:", error);
    return [];
  }
}

export async function adminSearchUsers(query: string) {
  try {
    const users = await getUsers();
    const q = query.trim().toLowerCase();
    return users.filter((u: any) =>
      u.type !== 'admin' &&
      (
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.mobile && u.mobile.includes(q)) ||
        (u.aadhar && u.aadhar.includes(q))
      )
    );
  } catch (error: any) {
    console.error("Error searching users:", error);
    return [];
  }
}

export async function adminWarnUser(email: string) {
  try {
    const users = await getUsers();
    const idx = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return { success: false, error: 'User not found.' };
    users[idx].warned = true;
    users[idx].warnedAt = new Date().toISOString();
    await saveUsers(users);
    return { success: true };
  } catch (error: any) {
    console.error("Error warning user:", error);
    return { success: false, error: error.message };
  }
}

export async function adminRemoveUser(email: string) {
  try {
    const users = await getUsers();
    const filtered = users.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase());
    if (filtered.length === users.length) return { success: false, error: 'User not found.' };
    await saveUsers(filtered);
    return { success: true };
  } catch (error: any) {
    console.error("Error removing user:", error);
    return { success: false, error: error.message };
  }
}

export async function adminSetCard(email: string, tier: string) {
  try {
    const users = await getUsers();
    const idx = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return { success: false, error: 'User not found.' };
    users[idx].cardOverride = tier;
    await saveUsers(users);
    return { success: true };
  } catch (error: any) {
    console.error("Error setting card tier:", error);
    return { success: false, error: error.message };
  }
}
