import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const BANNER_CONFIG_KEY = 'banner_images';

export interface BannerImages {
  home: string;
  collections: string;
  categories: Record<string, string>; // e.g. { "bedroom": "...", "living-room": "..." }
}

const DEFAULT_BANNERS: BannerImages = {
  home: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
  collections: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1600',
  categories: {
    bedroom: 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg',
    'living-room': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    dining: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
    office: 'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg',
    outdoor: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
  },
};

export async function GET() {
  try {
    const config = await prisma.adminConfig.findUnique({
      where: { key: BANNER_CONFIG_KEY },
    });

    if (!config) {
      return NextResponse.json(DEFAULT_BANNERS);
    }

    const banners = JSON.parse(config.value) as BannerImages;
    // Merge with defaults to ensure all keys exist
    return NextResponse.json({
      ...DEFAULT_BANNERS,
      ...banners,
      categories: {
        ...DEFAULT_BANNERS.categories,
        ...(banners.categories || {}),
      },
    });
  } catch (error) {
    console.error('Error fetching banner images:', error);
    return NextResponse.json(DEFAULT_BANNERS);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Fetch existing config
    const existing = await prisma.adminConfig.findUnique({
      where: { key: BANNER_CONFIG_KEY },
    });

    const current: BannerImages = existing
      ? JSON.parse(existing.value)
      : DEFAULT_BANNERS;

    // Merge updates
    const updated: BannerImages = {
      home: body.home ?? current.home,
      collections: body.collections ?? current.collections,
      categories: {
        ...current.categories,
        ...(body.categories || {}),
      },
    };

    await prisma.adminConfig.upsert({
      where: { key: BANNER_CONFIG_KEY },
      create: {
        key: BANNER_CONFIG_KEY,
        value: JSON.stringify(updated),
      },
      update: {
        value: JSON.stringify(updated),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating banner images:', error);
    return NextResponse.json({ error: 'Failed to update banners' }, { status: 500 });
  }
}