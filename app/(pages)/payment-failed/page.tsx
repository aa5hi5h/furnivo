'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RefreshCw, Home, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const error = searchParams.get('error');
  const reason = searchParams.get('reason');

  const getErrorMessage = () => {
    if (error) return error;
    if (reason === 'PAYMENT_CANCELLED') return 'Payment was cancelled';
    if (reason === 'PAYMENT_PENDING') return 'Payment is pending';
    if (reason === 'PAYMENT_ERROR') return 'Payment processing error';
    return 'Payment could not be completed';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Error Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-lg text-gray-600">
            {getErrorMessage()}
          </p>
        </div>

        {/* Error Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="border-l-4 border-red-500 pl-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              What happened?
            </h2>
            <p className="text-gray-600">
              Your payment could not be processed. This could be due to:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Insufficient balance in your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Payment method declined</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Network connectivity issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>You cancelled the payment</span>
              </li>
            </ul>
          </div>

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                Order ID: <span className="font-mono font-semibold text-gray-900">{orderId}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You can retry payment or contact support with this order ID
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-800">
              If money was deducted from your account, it will be automatically
              refunded within 5-7 business days. Contact our support team if you
              need assistance.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/checkout" className="block">
            <Button className="w-full bg-[#C47456] hover:bg-[#B36647] text-white py-6">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Payment
            </Button>
          </Link>
          <Link href="/cart" className="block">
            <Button variant="outline" className="w-full py-6">
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Cart
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full py-6">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Need help? Contact us at{' '}
          <a
            href="mailto:support@furnivo.com"
            className="text-[#C47456] hover:underline"
          >
            support@furnivo.com
          </a>
        </p>
      </div>
    </div>
  );
}