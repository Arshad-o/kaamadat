"use server";
import Razorpay from 'razorpay';
import crypto from 'crypto';

export async function createRazorpayOrder(amount: number, receiptId: string) {
  try {
    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      throw new Error("Razorpay API keys are missing in the environment variables.");
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: receiptId,
    };

    const order = await razorpay.orders.create(options);
    return { success: true, order };
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return { success: false, error: error.message || "Failed to create order" };
  }
}

export async function verifyRazorpayPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) {
  try {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      throw new Error("Razorpay secret key is missing in the environment variables.");
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return { success: true };
    } else {
      return { success: false, error: "Payment signature is not authentic." };
    }
  } catch (error: any) {
    console.error("Error verifying payment signature:", error);
    return { success: false, error: error.message || "Failed to verify signature" };
  }
}
