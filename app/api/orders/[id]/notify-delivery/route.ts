// app/api/orders/[orderId]/notify-delivery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendDeliveryNotificationEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Await params to get the actual id
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Run email sending and database update concurrently
    await Promise.all([
      sendDeliveryNotificationEmail(
        order.user.email,
        order.user.name,
        order.id,
        req.headers.get('x-tracking-number') || undefined
      ),
      prisma.order.update({
        where: { id },
        data: { status: 'delivered' },
      })
    ]);

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