import 'dotenv/config';
import sha256 from 'sha256';
import uniqid from 'uniqid';

export const PHONEPE_CONFIG = {
  merchantId: process.env.PHONEPE_MERCHANT_ID!,
  saltKey: process.env.PHONEPE_SALT_KEY!,
  saltIndex: parseInt(process.env.PHONEPE_SALT_INDEX || '1'),
  hostUrl: process.env.PHONEPE_HOST_URL!,
  redirectUrl: process.env.NEXT_PUBLIC_APP_URL!,
};

export interface PhonePePaymentPayload {
  merchantId: string;
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number;
  redirectUrl: string;
  redirectMode: string;
  mobileNumber?: string;
  callbackUrl?: string;
  paymentInstrument: {
    type: string;
  };
}

// Generate unique transaction ID
export function generateTransactionId(): string {
  return uniqid();
}

// Create base64 encoded payload
export function createBase64Payload(payload: PhonePePaymentPayload): string {
  const jsonPayload = JSON.stringify(payload);
  return Buffer.from(jsonPayload, 'utf8').toString('base64');
}

// Generate X-VERIFY checksum for payment initiation
export function generatePaymentChecksum(base64Payload: string): string {
  const string = base64Payload + '/pg/v1/pay' + PHONEPE_CONFIG.saltKey;
  const sha256Hash = sha256(string);
  return `${sha256Hash}###${PHONEPE_CONFIG.saltIndex}`;
}

// Generate X-VERIFY checksum for status check
export function generateStatusChecksum(merchantTransactionId: string): string {
  const string = `/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${merchantTransactionId}${PHONEPE_CONFIG.saltKey}`;
  const sha256Hash = sha256(string);
  return `${sha256Hash}###${PHONEPE_CONFIG.saltIndex}`;
}

// Verify callback checksum (for webhooks)
export function verifyCallbackChecksum(
  base64Response: string,
  receivedChecksum: string
): boolean {
  const string = base64Response + PHONEPE_CONFIG.saltKey;
  const sha256Hash = sha256(string);
  const expectedChecksum = `${sha256Hash}###${PHONEPE_CONFIG.saltIndex}`;
  return expectedChecksum === receivedChecksum;
}