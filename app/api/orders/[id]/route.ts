import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendOrderStatusEmail, sendDeliveryNotificationEmail } from '@/lib/email';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { 
        id,
        userId: user.id,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        address: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();
    const newStatus = body.status;

    // Verify order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user is admin or owner of the order
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL;
    if (existingOrder.userId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        address: true,
        user: true,
      },
    });

    // Send status update emails
    sendStatusEmails(order, existingOrder.status, newStatus)
      .catch((err) => console.error('Error sending status emails:', err));

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// Helper function to send appropriate emails based on status change
async function sendStatusEmails(
  order: any,
  oldStatus: string,
  newStatus: string
) {
  const customerEmail = order.user.email;
  const customerName = order.user.name;
  const orderId = order.id;

  // Only send emails for specific status transitions
  if (oldStatus === newStatus) {
    console.log('Status unchanged, skipping email');
    return;
  }

  try {
    // When order is shipped
    if (newStatus === 'shipped') {
      console.log(`Sending shipped notification for order ${orderId}`);
      await sendOrderStatusEmail(
        customerEmail,
        customerName,
        orderId,
        'shipped'
      );
    }

    // When order is delivered
    if (newStatus === 'delivered') {
      console.log(`Sending delivery notification for order ${orderId}`);
      await sendDeliveryNotificationEmail(
        customerEmail,
        customerName,
        orderId,
        undefined // trackingNumber - add if you have it
      );
    }

    // When order is cancelled
    if (newStatus === 'cancelled') {
      console.log(`Sending cancellation notification for order ${orderId}`);
      await sendOrderStatusEmail(
        customerEmail,
        customerName,
        orderId,
        'cancelled'
      );
    }

    console.log(`✓ Status email sent for order ${orderId} (${newStatus})`);
  } catch (error) {
    console.error(`Error sending email for order ${orderId}:`, error);
  }
}