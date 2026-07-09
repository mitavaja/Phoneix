import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;
  
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!key_id || !key_secret) {
    console.warn("WARNING: Razorpay keys are missing in the .env file!");
    return null;
  }
  
  try {
    razorpayInstance = new Razorpay({ key_id, key_secret });
    return razorpayInstance;
  } catch (err) {
    console.error("Failed to initialize Razorpay SDK instance:", err.message);
    return null;
  }
};

/**
 * Create a new Payment Order
 */
export const createPaymentOrder = async (amountInINR, receipt = "") => {
  // Razorpay accepts amounts in paise (1 INR = 100 Paise)
  const amountInPaise = Math.round(amountInINR * 100);

  const instance = getRazorpayInstance();
  if (!instance) {
    throw new Error("Razorpay is not properly configured. Check your environment variables.");
  }

  try {
    const order = await instance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
    });
    return {
      success: true,
      ...order,
      simulated: false,
    };
  } catch (err) {
    console.error("Razorpay order creation failed:", err.message);
    throw new Error(`Razorpay order creation failed: ${err.message}`);
  }
};

/**
 * Verify Razorpay Web Signature
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const instance = getRazorpayInstance();
  if (!instance) {
    return false;
  }

  try {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  } catch (err) {
    console.error("Razorpay signature validation failed:", err.message);
    return false;
  }
};
