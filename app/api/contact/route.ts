import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact inquiry received",
    });
  } catch (error) {
    console.error("Error processing contact:", error);
    return NextResponse.json(
      { error: "Failed to process contact inquiry" },
      { status: 500 }
    );
  }
}
