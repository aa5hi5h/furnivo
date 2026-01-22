import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendDeliveryNotificationEmail, sendShippingNotificationEmail } from '@/lib/email';

// GET single order
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
          },
        },
        address: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update order
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status, paymentMethod, trackingNumber } = body;

    // Check if order exists and get full details
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user has required fields for email
    const canSendEmail = existingOrder.user.email && existingOrder.user.name;

    // Track if status is changing to shipped or delivered
    const oldStatus = existingOrder.status;
    const newStatus = status || existingOrder.status;
    const statusChanged = oldStatus !== newStatus;

    // Update the order
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : existingOrder.paymentMethod,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    // Send email notifications if status changed and email is possible
    if (statusChanged && canSendEmail) {
      const userEmail = order.user.email!;
      const userName = order.user.name!;
      const orderId = order.id;

      // Send appropriate email based on new status (non-blocking)
      if (newStatus === 'shipped') {
        sendShippingNotificationEmail(
          userEmail,
          userName,
          orderId,
          trackingNumber
        )
          .then(() => console.log('✓ Shipping notification email sent to:', userEmail))
          .catch((err:any) => console.error('✗ Failed to send shipping email:', err));
      } else if (newStatus === 'delivered') {
        sendDeliveryNotificationEmail(
          userEmail,
          userName,
          orderId,
          trackingNumber
        )
          .then(() => console.log('✓ Delivery notification email sent to:', userEmail))
          .catch((err) => console.error('✗ Failed to send delivery email:', err));
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE order
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Delete order items first, then order
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId: id } }),
      prisma.order.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}