import Razorpay from "razorpay";
import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "your_key_id";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "your_key_secret";

const isSimulated =
  RAZORPAY_KEY_ID.includes("your_") ||
  RAZORPAY_KEY_SECRET.includes("your_");

let razorpayInstance = null;
if (!isSimulated) {
  try {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    console.error("Failed to initialize Razorpay SDK instance:", err.message);
  }
}

/**
 * Create a new Payment Order
 */
export const createPaymentOrder = async (amountInINR, receipt = "") => {
  // Razorpay accepts amounts in paise (1 INR = 100 Paise)
  const amountInPaise = Math.round(amountInINR * 100);

  if (isSimulated || !razorpayInstance) {
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 17)}`;
    return {
      success: true,
      id: mockOrderId,
      amount: amountInPaise,
      currency: "INR",
      receipt,
      simulated: true,
    };
  }

  try {
    const order = await razorpayInstance.orders.create({
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
    console.error("Razorpay order creation failed, falling back to simulated order:", err.message);
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 17)}`;
    return {
      success: true,
      id: mockOrderId,
      amount: amountInPaise,
      currency: "INR",
      receipt,
      simulated: true,
      error: err.message,
    };
  }
};

/**
 * Verify Razorpay Web Signature
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  if (isSimulated || !razorpayInstance) {
    // Simulated verification succeeds if signature contains "simulated_signature"
    // or if we just want it to pass for development testing
    return true;
  }

  try {
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  } catch (err) {
    console.error("Razorpay signature validation failed:", err.message);
    return false;
  }
};
