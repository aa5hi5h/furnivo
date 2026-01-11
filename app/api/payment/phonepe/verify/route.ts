// app/api/payment/phonepe/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { generateStatusChecksum, PHONEPE_CONFIG } from '@/lib/phonepe';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const merchantTransactionId = searchParams.get('transactionId');

    console.log('PhonePe Verify - orderId:', orderId, 'transactionId:', merchantTransactionId);

    if (!orderId || !merchantTransactionId) {
      return NextResponse.redirect(
        `${PHONEPE_CONFIG.redirectUrl}/payment-failed?error=Missing parameters`
      );
    }

    // Verify payment status one more time
    const statusUrl = `${PHONEPE_CONFIG.hostUrl}/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${merchantTransactionId}`;
    const xVerify = generateStatusChecksum(merchantTransactionId);

    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': PHONEPE_CONFIG.merchantId,
        'accept': 'application/json',
      },
    });

    const paymentResult = await response.json();
    console.log('PhonePe Verify Status:', JSON.stringify(paymentResult, null, 2));

    if (!paymentResult.success || paymentResult.code !== 'PAYMENT_SUCCESS') {
      return NextResponse.redirect(
        `${PHONEPE_CONFIG.redirectUrl}/payment-failed?orderId=${orderId}`
      );
    }

    // Get order with user info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.redirect(
        `${PHONEPE_CONFIG.redirectUrl}/payment-failed?error=Order not found`
      );
    }

    // Check if order is already processed
    if (order.status !== 'pending') {
      console.log('Order already processed, redirecting to success');
      return NextResponse.redirect(
        `${PHONEPE_CONFIG.redirectUrl}/order-success?orderId=${orderId}`
      );
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: order.userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      console.error('No cart items found for user:', order.userId);
      return NextResponse.redirect(
        `${PHONEPE_CONFIG.redirectUrl}/payment-failed?error=Cart is empty`
      );
    }

    // Update order status and create order items
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'processing',
        paymentMethod: 'phonepe', // Clean up the payment method
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
        address: true,
      },
    });

    console.log('Order updated successfully');

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: order.userId },
    });

    console.log('Cart cleared');

    // Send order confirmation email
    try {
      const subtotal = updatedOrder.orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shipping = subtotal > 50000 ? 0 : 500;
      const tax = subtotal * 0.18;

      await sendOrderConfirmationEmail({
        customerEmail: order.user.email,
        customerName: order.user.name,
        orderId: order.id,
        orderDate: new Date(order.createdAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        items: updatedOrder.orderItems.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          image: item.product.image,
        })),
        subtotal,
        shipping,
        tax,
        total: order.totalAmount,
        shippingAddress: {
          street: updatedOrder.address!.street,
          city: updatedOrder.address!.city,
          state: updatedOrder.address!.state,
          postalCode: updatedOrder.address!.postalCode,
          country: updatedOrder.address!.country,
        },
      });

      console.log('Confirmation email sent');
    } catch (emailError) {
      console.error('Error sending email (non-blocking):', emailError);
      // Don't fail the order if email fails
    }

    // Redirect to success page
    console.log('Redirecting to success page');
    return NextResponse.redirect(
      `${PHONEPE_CONFIG.redirectUrl}/order-success?orderId=${orderId}`
    );
  } catch (error: any) {
    console.error('PhonePe verification error:', error);
    return NextResponse.redirect(
      `${PHONEPE_CONFIG.redirectUrl}/payment-failed?error=Verification failed`
    );
  }
}