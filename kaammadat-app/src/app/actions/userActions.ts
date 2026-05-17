"use server";
import fs from 'fs';
import path from 'path';
import { sendOTP, verifyOTP } from './emailActions';
import { cookies } from 'next/headers';

const usersFilePath = path.join(process.cwd(), 'users.json');

export async function getUsers() {
  try {
    if (!fs.existsSync(usersFilePath)) {
      return [];
    }
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
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

    const users = await getUsers();
    const existing = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Add new user
    const newUser = {
      id: Date.now(),
      name,
      mobile,
      email,
      aadhar,
      address,
      password,
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

export async function loginUser(email: string, password: string, type: 'admin' | 'worker' | 'job-giver') {
  try {
    const users = await getUsers();
    const user = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.type === type
    );

    if (!user) {
      return { success: false, error: 'Invalid email or user type.' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }

    // Set authenticated cookie session
    const cookieStore = await cookies();
    cookieStore.set('kaammadat_authenticated', 'true', { maxAge: 86400, path: '/' });
    cookieStore.set('kaammadat_user_type', type, { maxAge: 86400, path: '/' });
    cookieStore.set('kaammadat_user_email', email, { maxAge: 86400, path: '/' });

    return { 
      success: true, 
      user: { 
        name: user.name, 
        email: user.email, 
        mobile: user.mobile, 
        type: user.type 
      } 
    };
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

    users[userIdx].password = newPassword;
    await saveUsers(users);

    return { success: true };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return { success: false, error: error.message };
  }
}
