// api/admin/products/[id]/collection/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - Assign/unassign product to collection
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
    const productId = params.id;
    const body = await req.json();
    const { collectionId } = body;

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // If collectionId is provided, validate it exists
    if (collectionId) {
      const collection = await prisma.collection.findUnique({
        where: { id: collectionId }
      });

      if (!collection) {
        return NextResponse.json(
          { error: 'Collection not found' },
          { status: 404 }
        );
      }
    }

    // Update product with collection
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        collectionId: collectionId || null
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product collection:', error);
    return NextResponse.json(
      { error: 'Failed to update product collection' },
      { status: 500 }
    );
  }
}