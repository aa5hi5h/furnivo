// app/api/payment/phonepe/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateStatusChecksum, PHONEPE_CONFIG } from '@/lib/phonepe';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    console.log('PhonePe Callback - All params:', Object.fromEntries(searchParams.entries()));

    if (!orderId) {
      console.error('No orderId in callback');
      return NextResponse.redirect(
        `${PHONEPE_CONFIG.redirectUrl}/payment-failed?error=Missing order ID`
      );
    }

    // Get order from database to retrieve transaction ID
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error('Order not found:', orderId);
      return NextResponse.redirect(
        `${PHONEPE_CONFIG.redirectUrl}/payment-failed?error=Order not found`
      );
    }

    // Extract transaction ID from paymentMethod field
    const merchantTransactionId = order.paymentMethod?.replace('phonepe:', '');

    if (!merchantTransactionId) {
      console.error('Transaction ID not found in order');
      return NextResponse.redirect(
        `${PHONEPE_CONFIG.redirectUrl}/payment-failed?error=Invalid transaction`
      );
    }

    console.log('Checking payment status for transaction:', merchantTransactionId);

    // Check payment status
    const statusUrl = `${PHONEPE_CONFIG.hostUrl}/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${merchantTransactionId}`;
    const xVerify = generateStatusChecksum(merchantTransactionId);

    console.log('Status check URL:', statusUrl);
    console.log('X-VERIFY:', xVerify);

    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': PHONEPE_CONFIG.merchantId,
        'accept': 'application/json',
      },
    });

    const result = await response.json();
    console.log('PhonePe Status Response:', JSON.stringify(result, null, 2));

    if (result.success && result.code === 'PAYMENT_SUCCESS') {
      console.log('Payment successful, redirecting to verify');
      // Redirect to verify endpoint
      return NextResponse.redirect(
        `${PHONEPE_CONFIG.redirectUrl}/api/payment/phonepe/verify?orderId=${orderId}&transactionId=${merchantTransactionId}`
      );
    } else {
      console.log('Payment failed or pending:', result.code);
      // Payment failed or pending
      return NextResponse.redirect(
        `${PHONEPE_CONFIG.redirectUrl}/payment-failed?orderId=${orderId}&reason=${result.code || 'UNKNOWN'}`
      );
    }
  } catch (error: any) {
    console.error('PhonePe callback error:', error);
    return NextResponse.redirect(
      `${PHONEPE_CONFIG.redirectUrl}/payment-failed?error=Callback processing failed`
    );
  }
}