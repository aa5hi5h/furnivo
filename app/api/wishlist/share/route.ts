import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, wishlistItems, userName } = body;

    if (!platform || !wishlistItems || wishlistItems.length === 0) {
      return NextResponse.json(
        { error: 'Platform and wishlist items required' },
        { status: 400 }
      );
    }

    // Generate share message
    const productList = wishlistItems
      .map((item: any) => `${item.product.name} - $${item.product.price}`)
      .join('\n');

    const message = `Check out my wishlist from FURNIVO:\n\n${productList}\n\nVisit: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`;

    const shareData = {
      text: message,
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wishlist`,
    };

    let shareUrl = '';

    switch (platform.toLowerCase()) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(message)}&hashtag=%23Furnivo`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Check out my FURNIVO wishlist&body=${encodeURIComponent(message)}`;
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported platform' },
          { status: 400 }
        );
    }

    return NextResponse.json({ shareUrl, message });
  } catch (error) {
    console.error('Share wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    );
  }
}