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
    const status = searchParams.get('status');
    const serviceType = searchParams.get('serviceType');

    const where: any = {};
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;

    const bookings = await prisma.designServiceBooking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      serviceType,
      preferredDate,
      preferredTime,
      budgetRange,
      message,
    } = body;

    if (!name || !email || !phone || !serviceType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const booking = await prisma.designServiceBooking.create({
      data: {
        name,
        email,
        phone,
        serviceType,
        preferredDate: preferredDate || null,
        preferredTime: preferredTime || null,
        budgetRange: budgetRange || null,
        message: message || null,
        status: 'pending',
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}