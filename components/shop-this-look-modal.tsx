'use client';

import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  slug: string;
}

interface ShopThisLookModalProps {
  roomName: string;
  roomImage: string;
  products: Product[];
  open: boolean;
  onClose: () => void;
  onAddToCart: (productId: string) => void;
}

export function ShopThisLookModal({
  roomName,
  roomImage,
  products,
  open,
  onClose,
  onAddToCart,
}: ShopThisLookModalProps) {
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);

  const handleAddAll = () => {
    products.forEach(product => onAddToCart(product.id));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogClose className="absolute right-4 top-4 z-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Room Image */}
          <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={roomImage}
              alt={roomName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Products List */}
          <div className="flex flex-col">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              {roomName}
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Shop all the pieces in this beautifully styled room
            </p>

            <div className="flex-1 overflow-y-auto space-y-4 mb-6">
              {products.map(product => (
                <div
                  key={product.id}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-lg font-bold text-[#C47456] mt-1">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <Button
                    onClick={() => onAddToCart(product.id)}
                    size="sm"
                    className="bg-[#2C2C2C] hover:bg-[#C47456] text-white self-center"
                  >
                    <ShoppingCart size={16} />
                  </Button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-900">Total Price:</span>
                <span className="text-2xl font-bold text-[#C47456]">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <Button
                onClick={handleAddAll}
                className="w-full bg-[#2C2C2C] hover:bg-[#C47456] text-white"
              >
                Add All to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}