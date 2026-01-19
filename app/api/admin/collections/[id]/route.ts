// api/admin/collections/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT update collection
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const collectionId = params.id;

    const body = await req.json();
    const { name, description, imageUrl } = body;

    if (!name || !imageUrl) {
      return NextResponse.json(
        { error: 'Name and image URL are required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if another collection has the same name or slug
    const existing = await prisma.collection.findFirst({
      where: {
        AND: [
          { id: { not: collectionId } },
          {
            OR: [
              { name: name },
              { slug: slug }
            ]
          }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Collection name already exists' },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.update({
      where: { id: collectionId },
      data: {
        name,
        slug,
        description: description || null,
        imageUrl,
      }
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

// DELETE collection
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const collectionId = params.id;

    // Check if collection has products
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    if (collection._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete collection with ${collection._count.products} products. Please reassign or delete products first.` },
        { status: 400 }
      );
    }

    await prisma.collection.delete({
      where: { id: collectionId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}