// app/api/orders/[orderId]/notify-delivery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendDeliveryNotificationEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admin can send delivery notifications
    if (!session?.user?.email || process.env.ADMIN_EMAIL !== session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Send delivery notification
    await sendDeliveryNotificationEmail(
      order.user.email,
      order.user.name,
      order.id,
      req.headers.get('x-tracking-number') || undefined
    );

    // Update order status to delivered
    await prisma.order.update({
      where: { id: params.id },
      data: { status: 'delivered' },
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery notification sent',
    });
  } catch (error: any) {
    console.error('Error sending delivery notification:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}