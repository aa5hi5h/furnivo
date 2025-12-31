import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, service_type, description, budget } = body;

    if (!name || !email || !service_type) {
      return NextResponse.json(
        { error: "Name, email, and service type are required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Design service inquiry received",
    });
  } catch (error) {
    console.error("Error processing design service:", error);
    return NextResponse.json(
      { error: "Failed to process design service inquiry" },
      { status: 500 }
    );
  }
}
