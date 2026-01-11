
// app/api/payment/phonepe/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  PHONEPE_CONFIG,
  generateTransactionId,
  createBase64Payload,
  generatePaymentChecksum,
} from '@/lib/phonepe';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { amount, addressId, mobileNumber } = body;

    if (!amount || !addressId) {
      return NextResponse.json(
        { success: false, error: 'Amount and address are required' },
        { status: 400 }
      );
    }

    // Verify address belongs to user
    const address = await prisma.address.findUnique({
      where: { id: addressId, userId: user.id },
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Invalid address' },
        { status: 400 }
      );
    }

    // Generate unique transaction ID
    const merchantTransactionId = generateTransactionId();

    // Create order in database with pending status
    // Store transaction ID in paymentMethod field temporarily
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: amount,
        status: 'pending',
        addressId,
        paymentMethod: `phonepe:${merchantTransactionId}`, // Store transaction ID
      },
    });

    // Create PhonePe payment payload
    const payload = {
      merchantId: PHONEPE_CONFIG.merchantId,
      merchantTransactionId,
      merchantUserId: user.id,
      amount: Math.round(amount * 100), // Convert to paise
      redirectUrl: `${PHONEPE_CONFIG.redirectUrl}/api/payment/phonepe/callback?orderId=${order.id}`,
      redirectMode: 'REDIRECT',
      mobileNumber: mobileNumber || '9999999999',
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    // Create base64 encoded payload
    const base64Payload = createBase64Payload(payload);

    // Generate checksum
    const xVerify = generatePaymentChecksum(base64Payload);

    // Make request to PhonePe
    const response = await fetch(`${PHONEPE_CONFIG.hostUrl}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'accept': 'application/json',
      },
      body: JSON.stringify({
        request: base64Payload,
      }),
    });

    const result = await response.json();

    if (result.success && result.data?.instrumentResponse?.redirectInfo?.url) {
      // Update order with transaction ID
      await prisma.order.update({
        where: { id: order.id },
        data: {
          // Store transaction ID in a custom field or use a separate table
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          redirectUrl: result.data.instrumentResponse.redirectInfo.url,
          merchantTransactionId,
          orderId: order.id,
        },
      });
    } else {
      // Delete the pending order if payment initiation failed
      await prisma.order.delete({ where: { id: order.id } });

      return NextResponse.json(
        { success: false, error: 'Failed to initiate payment' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error initiating PhonePe payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}