import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Create new order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      shippingAddress,
      paymentMethod,
      deliveryOption,
      totalAmount,
      items,
    } = body;

    // Validation
    if (!shippingAddress || !paymentMethod || !totalAmount || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create address if needed
    let addressId = null;
    if (shippingAddress) {
      const address = await prisma.address.create({
        data: {
          userId: user.id,
          street: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.pincode,
          country: 'India',
          isDefault: false,
        },
      });
      addressId = address.id;
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: 'pending',
        totalAmount,
        paymentMethod,
        addressId,
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}