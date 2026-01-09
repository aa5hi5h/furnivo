import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const customers = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    });

    // Get total spent for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await prisma.order.findMany({
          where: { userId: customer.id },
          select: { totalAmount: true },
        });

        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        return {
          ...customer,
          totalOrders: customer._count.orders,
          totalReviews: customer._count.reviews,
          totalSpent,
        };
      })
    );

    return NextResponse.json(customersWithStats);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}