'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function ConditionalLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  
  const adminPages = ['/admin', '/auth'];
  const isAdminPage = adminPages.some(page => pathname.startsWith(page));
  
  const noFooterPages = ['/admin'];
  const noFooter = noFooterPages.some(page => pathname.startsWith(page));

  return (
    <>
      {!isAdminPage && <Header />}
      
      <main className="min-h-screen">
        {children}
      </main>
      
      {!noFooter && <Footer />}
    </>
  );
}