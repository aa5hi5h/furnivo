import Link from 'next/link';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Footer() {
  return (
    <footer className="bg-[#2C2C2C] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-serif font-bold mb-4">FURNIVO</h3>
            <p className="text-gray-400 text-sm mb-6">
              Crafting exceptional furniture that transforms your living spaces with timeless elegance and modern comfort.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-[#C47456] transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-[#C47456] transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-[#C47456] transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/collections" className="hover:text-white transition-colors">Collections</Link></li>
              <li><Link href="/category/living-room" className="hover:text-white transition-colors">Living Room</Link></li>
              <li><Link href="/category/bedroom" className="hover:text-white transition-colors">Bedroom</Link></li>
              <li><Link href="/category/dining" className="hover:text-white transition-colors">Dining</Link></li>
              <li><Link href="/category/office" className="hover:text-white transition-colors">Office</Link></li>
              <li><Link href="/category/outdoor" className="hover:text-white transition-colors">Outdoor</Link></li>
              <li><Link href="/products?filter=new" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/sale" className="hover:text-white transition-colors">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Exchange</Link></li>
              <li><Link href="/design-services" className="hover:text-white transition-colors">Design Services</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Stay Connected</h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to get special offers, design inspiration, and more
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Button className="bg-[#C47456] hover:bg-[#C47456]/90 text-white whitespace-nowrap">
                Subscribe
              </Button>
            </div>
            <div className="mt-6">
              <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">✓</div>
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">🚚</div>
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">↺</div>
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div>© 2025 Furnivo. All rights reserved.</div>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs">We accept:</span>
              <div className="flex gap-2">
                <div className="bg-white/10 px-2 py-1 rounded text-xs">VISA</div>
                <div className="bg-white/10 px-2 py-1 rounded text-xs">MC</div>
                <div className="bg-white/10 px-2 py-1 rounded text-xs">UPI</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
