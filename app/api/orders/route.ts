import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      status,
      total_amount,
      shipping_address,
      payment_method,
      payment_status,
      delivery_option,
      notes,
    } = body;

    if (!userId || !total_amount) {
      return NextResponse.json(
        { error: "User ID and total amount are required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        user_id: userId,
        status: status || "pending",
        total_amount,
        shipping_address: shipping_address || {},
        payment_method: payment_method || "",
        payment_status: payment_status || "pending",
        delivery_option: delivery_option || "",
        notes: notes || "",
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
