import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get collection by slug with products
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const collection = await prisma.collection.findUnique({
      where: { slug: params.slug },
      include: {
        products: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete collection (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.collection.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}