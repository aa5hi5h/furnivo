import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      email,
      phone,
      service_type,
      preferred_date,
      preferred_time,
      budget_range,
      message,
    } = body;

    // Validation
    if (!name || !email || !phone || !service_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate service type
    const validServiceTypes = ['virtual', 'inhome', 'fullroom'];
    if (!validServiceTypes.includes(service_type)) {
      return NextResponse.json(
        { error: 'Invalid service type' },
        { status: 400 }
      );
    }

    // Create design service booking
    const booking = await prisma.designServiceBooking.create({
      data: {
        name,
        email,
        phone,
        serviceType: service_type,
        preferredDate: preferred_date || null,
        preferredTime: preferred_time || null,
        budgetRange: budget_range || null,
        message: message || null,
        status: 'pending',
      },
    });

    // Optional: Send confirmation email to customer
    // await sendConfirmationEmail(booking);

    // Optional: Send notification to admin
    // await sendAdminNotification(booking);

    return NextResponse.json(
      {
        success: true,
        data: booking,
        message: 'Design consultation request submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating design service booking:', error);
    return NextResponse.json(
      { error: 'Failed to submit request. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication check here
    // const session = await getServerSession();
    // if (!session || !session.user.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const serviceType = searchParams.get('serviceType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;

    const [bookings, total] = await Promise.all([
      prisma.designServiceBooking.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.designServiceBooking.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching design service bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// Optional: PATCH endpoint to update booking status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing id or status' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const booking = await prisma.designServiceBooking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking status updated successfully',
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}