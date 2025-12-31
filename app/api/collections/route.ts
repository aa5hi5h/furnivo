import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get all collections
export async function GET(req: NextRequest) {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new collection (Admin only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, imageUrl } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description,
        imageUrl,
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}