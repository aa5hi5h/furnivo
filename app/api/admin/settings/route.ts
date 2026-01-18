// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(req: NextRequest) {
  try {
    const { currentPassword, newUsername, newPassword } = await req.json();

    // Get current credentials
    const adminConfig = await prisma.adminConfig.findFirst({
      where: { key: 'admin_credentials' },
    });

    if (!adminConfig) {
      return NextResponse.json(
        { message: 'Admin configuration not found' },
        { status: 404 }
      );
    }

    const credentials = JSON.parse(adminConfig.value as string);

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      credentials.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update credentials
    const updatedCredentials = {
      username: newUsername || credentials.username,
      password: newPassword
        ? await bcrypt.hash(newPassword, 10)
        : credentials.password,
    };

    await prisma.adminConfig.update({
      where: { id: adminConfig.id },
      data: {
        value: JSON.stringify(updatedCredentials),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin credentials updated successfully',
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}