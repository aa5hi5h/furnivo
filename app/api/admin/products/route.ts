import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      description,
      category,
      price,
      originalPrice,
      stock,
      colorVariants, // NEW: Color variants with images
      images, // LEGACY: Keep for backward compatibility
      colors, // LEGACY: Keep for backward compatibility
      materials,
      featured,
    } = body;

    // Validation
    if (!name || !slug || !category || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, category, price, and stock are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this slug already exists' },
        { status: 400 }
      );
    }

    // NEW: Extract data from colorVariants OR use legacy format
    let finalImages: string[] = [];
    let finalColors: string[] = [];
    let finalMainImage = '';

    if (colorVariants && colorVariants.length > 0) {
      // NEW FORMAT: Extract from color variants
      colorVariants.forEach((variant: any) => {
        finalColors.push(variant.color);
        if (variant.images && variant.images.length > 0) {
          finalImages.push(...variant.images);
        }
      });
      finalMainImage = finalImages[0] || '';
    } else if (images && images.length > 0) {
      // LEGACY FORMAT: Use old images/colors arrays
      finalImages = images;
      finalColors = colors || [];
      finalMainImage = images[0];
    } else {
      return NextResponse.json(
        { error: 'At least one image is required (either in colorVariants or images array)' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        category,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock),
        image: finalMainImage,
        images: finalImages,
        colors: finalColors,
        colorVariants: colorVariants || null, // NEW: Store as JSON
        materials: materials || null,
        featured: featured || false,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}