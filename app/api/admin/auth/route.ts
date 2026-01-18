// app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Fetch admin credentials from database
    const adminConfig = await prisma.adminConfig.findFirst({
      where: { key: 'admin_credentials' },
    });

    if (!adminConfig) {
      // If no admin exists, create default (change these in production!)
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.adminConfig.create({
        data: {
          key: 'admin_credentials',
          value: JSON.stringify({
            username: 'admin',
            password: hashedPassword,
          }),
        },
      });

      // Check against default credentials
      if (username === 'admin' && password === 'admin123') {
        return NextResponse.json({ success: true });
      }
    } else {
      const credentials = JSON.parse(adminConfig.value as string);
      
      // Verify credentials
      const isValidUsername = username === credentials.username;
      const isValidPassword = await bcrypt.compare(password, credentials.password);

      if (isValidUsername && isValidPassword) {
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch current username (without password)
export async function GET() {
  try {
    const adminConfig = await prisma.adminConfig.findFirst({
      where: { key: 'admin_credentials' },
    });

    if (!adminConfig) {
      return NextResponse.json({ username: 'admin' });
    }

    const credentials = JSON.parse(adminConfig.value as string);
    return NextResponse.json({ username: credentials.username });
  } catch (error) {
    return NextResponse.json({ username: 'admin' });
  }
}