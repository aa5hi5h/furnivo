// app/payment-failed/page.tsx
import { Suspense } from 'react';
import PaymentFailedContent from './payment-failed-content';

export const metadata = {
  title: 'Payment Failed',
  description: 'Your payment could not be processed',
};

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<PaymentFailedLoadingFallback />}>
      <PaymentFailedContent />
    </Suspense>
  );
}

function PaymentFailedLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}