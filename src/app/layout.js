import { Outfit } from 'next/font/google';
import './globals.css';

// 1. Fontu bir CSS değişkeni (variable) olarak yüklüyoruz
const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit', // Kritik nokta burası
  weight: ['300', '400', '500', '600', '700']
});

export const metadata = {
  title: 'Barbarians Plan',
  description: 'Professional Trading Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 2. Değişkeni body'ye ekleyip, font-sans ile Tailwind'i tetikliyoruz */}
      <body className={`${outfit.variable} font-sans bg-black text-neutral-400 antialiased`}>
        {children}
      </body>
    </html>
  );
}