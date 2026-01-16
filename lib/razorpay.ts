import 'dotenv/config';
// lib/razorpay.ts
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Validate environment variables
if (!process.env.RAZORPAY_KEY_ID) {
  console.error('❌ RAZORPAY_KEY_ID is not set in environment variables');
}
if (!process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ RAZORPAY_KEY_SECRET is not set in environment variables');
}

console.log('Razorpay Config:', {
  keyId: process.env.RAZORPAY_KEY_ID ? '✓ Set' : '✗ Missing',
  keySecret: process.env.RAZORPAY_KEY_SECRET ? '✓ Set' : '✗ Missing',
});

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Verify payment signature
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    
    const isValid = generatedSignature === signature;
    console.log('Signature verification:', { isValid, orderId, paymentId });
    return isValid;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}