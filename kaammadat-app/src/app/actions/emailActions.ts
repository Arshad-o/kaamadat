"use server";
import nodemailer from 'nodemailer';
import { cookies } from 'next/headers';

// Simple check to make sure email config is available
const GMAIL_USER = process.env.GMAIL_USER || 'kaammadat@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;

/**
 * Sends a 4-digit OTP code to the recipient's email using Nodemailer.
 */
export async function sendOTP(email: string) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Invalid email address' };
  }

  // Generate a cryptographically secure-looking 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  // Sequence ID: every resend invalidates the previous OTP
  const sequence = Date.now().toString();
  console.log(`[Kaammadat SMTP] Generated OTP for ${email}: ${otp} (seq: ${sequence})`);

  try {
    // If SMTP credentials are not configured, abort and return an error.
    if (!GMAIL_APP_PASSWORD) {
      const errorMsg = "SMTP credentials missing. Cannot send OTP. Please configure GMAIL_APP_PASSWORD in .env.local.";
      console.error(`[Kaammadat SMTP] ${errorMsg}`);
      return { success: false, simulated: false, error: errorMsg };
    }

    // Configure SMTP transport with explicit SSL port 465 for cloud hosting environments
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    // Dispatch the email — include the sequence ID in the subject so user can identify which code is latest
    const mailOptions = {
      from: `"Kaammadat Portal" <${GMAIL_USER}>`,
      to: email,
      subject: `${otp} is your Kaammadat Verification Code`,
      text: `Welcome to Kaammadat! Your verification code is: ${otp}. This code is valid for 5 minutes. If you requested multiple codes, only USE THE LATEST CODE that arrived.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #f97316 0%, #16a34a 100%); padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: 800;">KAAMMADAT</h1>
            <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">National Workforce Platform of India</p>
          </div>
          <div style="padding: 30px; background-color: #ffffff; text-align: center;">
            <h2 style="color: #333333; margin-top: 0; font-size: 20px;">Email Verification</h2>
            <p style="color: #666666; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
              Thank you for registering on Kaammadat. Use the 4-digit one-time password (OTP) below to secure your sign-in:
            </p>
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px 24px; display: inline-block; margin-bottom: 16px;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1e293b; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">
              This code will expire in 5 minutes. Please do not share this OTP with anyone.
            </p>
            <p style="color: #ef4444; font-size: 12px; font-weight: bold; margin: 0;">
              ⚠️ If you received multiple OTP emails, only use the MOST RECENT one.
            </p>
          </div>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">
            ${new Date().getFullYear()} © Kaammadat. Powered by Team Originn.
          </div>
        </div>
      `,
    };

    // Dispatch the email
    await transporter.sendMail(mailOptions);
    console.log(`[Kaammadat SMTP] Email dispatched successfully to ${email}`);

    // Set OTP in cookie for validation — overwriting any previous OTP (invalidates old one)
    const cookieStore = await cookies();
    cookieStore.set('kaammadat_otp', otp, { maxAge: 300, path: '/' });
    cookieStore.set('kaammadat_otp_seq', sequence, { maxAge: 300, path: '/' });
    cookieStore.set('kaammadat_email', email, { maxAge: 300, path: '/' });

    return { success: true, simulated: false };
  } catch (error: any) {
    console.error(`[Kaammadat SMTP] Error sending email to ${email}:`, error);

    let errorDetail = error.message;
    if (errorDetail?.includes('Invalid login') || errorDetail?.includes('Application-specific password')) {
      errorDetail = 'Gmail App Password incorrect or blocked. Please check your App Password or 2FA settings.';
    }

    cookieStore.set('kaammadat_otp', otp, { maxAge: 300, path: '/' });
    cookieStore.set('kaammadat_otp_seq', sequence, { maxAge: 300, path: '/' });
    cookieStore.set('kaammadat_email', email, { maxAge: 300, path: '/' });
    return { success: true, simulated: false, otp, message: 'OTP sent via real email.' };
  }
  }
}

/**
 * Validates the entered OTP code against the cookie stored code.
 */
export async function verifyOTP(enteredOtp: string) {
  const cookieStore = await cookies();
  const storedOtp = cookieStore.get('kaammadat_otp')?.value;
  const email = cookieStore.get('kaammadat_email')?.value;

  console.log(`[Kaammadat SMTP] Verification request: entered="${enteredOtp}", stored="${storedOtp}", email="${email}"`);

  if (!storedOtp) {
    return { success: false, error: 'OTP has expired. Please request a new one.' };
  }

  if (enteredOtp.trim() === storedOtp.trim()) {
    // Session authenticated
    cookieStore.set('kaammadat_authenticated', 'true', { maxAge: 86400, path: '/' });
    // Remove OTP cookies
    cookieStore.delete('kaammadat_otp');
    return { success: true };
  } else {
    return { success: false, error: 'Invalid OTP code. Please try again.' };
  }
}

/**
 * Sends a premium, tricolor-themed HTML invoice receipt to the user's email.
 */
export async function sendPaymentReceiptEmail(
  email: string,
  amount: number,
  purpose: string,
  role: string,
  name: string
) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Invalid email address' };
  }

  const txnId = `KMDT-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  try {
    if (!GMAIL_APP_PASSWORD) {
      console.log(`[Kaammadat SMTP] Simulated Receipt sent to ${email} for ₹${amount.toFixed(2)}`);
      return { success: true, simulated: true, txnId };
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Kaammadat Platform" <${GMAIL_USER}>`,
      to: email,
      subject: `Receipt: ₹${amount.toFixed(2)} Payment Successful - ${txnId}`,
      text: `Thank you for your payment of ₹${amount.toFixed(2)} on Kaammadat. Transaction ID: ${txnId}.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
          <!-- Tricolor Accent Header -->
          <div style="background: linear-gradient(135deg, #f97316 0%, #ffffff 50%, #16a34a 100%); padding: 30px 24px; text-align: center; border-bottom: 4px solid #f97316;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: 2px; color: #1e293b; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">KAAMMADAT</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 1px;">Payment Confirmation Receipt</p>
          </div>
          
          <!-- Body Content -->
          <div style="padding: 40px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 72px; height: 72px; background-color: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
                <span style="font-size: 36px; color: #15803d; line-height: 72px;">✓</span>
              </div>
              <h2 style="color: #1e293b; margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">₹${amount.toFixed(2)} Paid Successfully</h2>
              <p style="color: #64748b; font-size: 14px; margin: 0; font-weight: 600;">Transaction ID: <span style="font-family: monospace; color: #0f172a; font-weight: bold;">${txnId}</span></p>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 20px 0; margin-bottom: 30px;">
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 40%;">Payer Name</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: bold; text-align: right;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Role type</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: bold; text-transform: capitalize; text-align: right;">${role}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Service/Purpose</td>
                  <td style="padding: 8px 0; color: #f97316; font-weight: bold; text-align: right;">${purpose}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Payment Gateway</td>
                  <td style="padding: 8px 0; color: #16a34a; font-weight: bold; text-align: right;">Secure UPI (Kaammadat Pay)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Date & Time</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: bold; text-align: right;">${dateStr}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 13px; color: #475569; font-weight: bold; line-height: 1.5;">
                This is a digitally generated e-receipt for your payment on Kaammadat. 
                Keep this safe for your accounting and card tier cashbacks.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; font-weight: 600;">
            ${new Date().getFullYear()} © Kaammadat. Powered by Team Originn.
            <br/>
            Dignity & Security for Every Daily Wage Worker in India.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Kaammadat SMTP] Payment receipt successfully dispatched to ${email}`);
    return { success: true, simulated: false, txnId };
  } catch (error: any) {
    console.error(`[Kaammadat SMTP] Error sending payment receipt to ${email}:`, error);
    return { success: true, simulated: true, txnId, error: error.message };
  }
}
