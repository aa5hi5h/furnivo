// app/api/payment/razorpay/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { razorpay } from '@/lib/razorpay';

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
    const { amount, addressId } = body;

    if (!amount || !addressId) {
      return NextResponse.json(
        { success: false, error: 'Amount and address are required' },
        { status: 400 }
      );
    }

    // Verify address belongs to user
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid address' },
        { status: 400 }
      );
    }

    // Validate Razorpay credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials missing');
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Create order in database with pending status
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: amount,
        status: 'pending',
        addressId,
        paymentMethod: 'razorpay',
      },
    });

    console.log('Created order:', order.id);
    console.log('Creating Razorpay order with amount:', amount);

    // Create Razorpay order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `order_${order.id}`,
        notes: {
          orderId: order.id,
          userId: user.id,
          userEmail: user.email,
        },
      });

      console.log('✓ Razorpay order created:', razorpayOrder.id);
    } catch (razorpayError: any) {
      console.error('❌ Razorpay API error:', razorpayError);
      
      // Delete the order since Razorpay creation failed
      await prisma.order.delete({
        where: { id: order.id },
      });

      // Return specific error
      const errorMessage = razorpayError.error?.description || 
                          razorpayError.message || 
                          'Failed to create Razorpay order';
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? razorpayError : undefined
        },
        { status: 500 }
      );
    }

    // Update order with Razorpay order ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        merchantTransactionId: razorpayOrder.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        dbOrderId: order.id,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    console.error('❌ Error creating Razorpay order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}