import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from '@/lib/email';

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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
    } = body;

    console.log('Razorpay Verify Request:', { razorpay_order_id, razorpay_payment_id, dbOrderId });

    // Verify payment signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error('Invalid Razorpay signature');
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: dbOrderId },
      include: { user: true, address: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if already processed
    if (order.status !== 'pending') {
      console.log('Order already processed');
      return NextResponse.json({
        success: true,
        message: 'Order already processed',
        data: { orderId: order.id },
      });
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Update order status and create order items
    const updatedOrder = await prisma.order.update({
      where: { id: dbOrderId },
      data: {
        status: 'processing',
        paymentMethod: 'razorpay',
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
      where: { userId: user.id },
    });

    console.log('Cart cleared');

    // Prepare email data
    const subtotal = updatedOrder.orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = subtotal > 50000 ? 0 : 500;
    const tax = subtotal * 0.18;
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const emailData = {
      customerEmail: order.user.email,
      customerName: order.user.name,
      orderId: order.id,
      orderDate,
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
    };

    // Send emails (non-blocking)
    Promise.all([
      // Send confirmation email to customer
      sendOrderConfirmationEmail(emailData)
        .then(() => console.log('✓ Customer confirmation email sent'))
        .catch((err) => console.error('✗ Failed to send customer email:', err)),

      // Send notification email to admin
      sendAdminOrderNotificationEmail({
        ...emailData,
        customerPhone: order.user.phone  || undefined,
        paymentMethod: 'razorpay',
      })
        .then(() => console.log('✓ Admin notification email sent'))
        .catch((err) => console.error('✗ Failed to send admin email:', err)),
    ]).catch((err) => console.error('Error in email Promise.all:', err));

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: order.id,
      },
    });
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}