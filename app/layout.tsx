import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../contexts/cart-context";
import CartPanel from "@/components/cart-pannel";
import { Providers } from "./provider";
import ConditionalLayout from "@/components/conditional-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FURNIVO - Premium Furniture Store",
  description: "Discover beautiful and affordable furniture for your home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Providers>
          <CartProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <CartPanel />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}