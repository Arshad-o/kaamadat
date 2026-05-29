"use server";

// ── Verhoeff Algorithm for Aadhar validation ──────────────────────────────────
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];
const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

function verhoeffValidate(num: string): boolean {
  let c = 0;
  const reversed = num.split('').reverse();
  for (let i = 0; i < reversed.length; i++) {
    c = d[c][p[i % 8][parseInt(reversed[i])]];
  }
  return c === 0;
}

// ── OTP Store (in-memory, server-side) ────────────────────────────────────────
const kycOtpStore: Record<string, { otp: string; expiry: number }> = {};

// ── Send KYC OTP via Fast2SMS ─────────────────────────────────────────────────
export async function sendKycOtp(mobile: string, aadhar: string) {
  // 1. Validate Aadhar format
  if (!/^\d{12}$/.test(aadhar)) {
    return { success: false, error: 'Aadhar number must be exactly 12 digits.' };
  }

  // 2. Validate using Verhoeff checksum (same algorithm UIDAI uses)
  if (!verhoeffValidate(aadhar)) {
    return { success: false, error: 'Invalid Aadhar number. Please check and re-enter.' };
  }

  // 3. Validate mobile
  if (!/^\d{10}$/.test(mobile)) {
    return { success: false, error: 'Mobile number must be exactly 10 digits.' };
  }

  // 4. Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  // 5. Store OTP
  kycOtpStore[mobile] = { otp, expiry };

  // 6. Send OTP via Fast2SMS
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    // Dev fallback: log otp to console and pretend to send
    console.warn(`[DEV MODE] KYC OTP for ${mobile}: ${otp}`);
    return { success: true, simulated: true, otp };
  }

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: mobile,
      }),
    });

    const data = await response.json();

    if (data.return) {
      return { success: true };
    } else {
      console.error('Fast2SMS error:', data);
      return { success: false, error: 'Failed to send SMS. Please check your mobile number.' };
    }
  } catch (error: any) {
    console.error('Fast2SMS network error:', error);
    return { success: false, error: 'SMS service unavailable. Please try again.' };
  }
}

// ── Verify KYC OTP ─────────────────────────────────────────────────────────────
export async function verifyKycOtp(mobile: string, enteredOtp: string) {
  const stored = kycOtpStore[mobile];

  if (!stored) {
    return { success: false, error: 'No OTP found. Please request a new OTP.' };
  }

  if (Date.now() > stored.expiry) {
    delete kycOtpStore[mobile];
    return { success: false, error: 'OTP has expired. Please request a new one.' };
  }

  if (stored.otp !== enteredOtp.trim()) {
    return { success: false, error: 'Incorrect OTP. Please try again.' };
  }

  delete kycOtpStore[mobile];
  return { success: true };
}
