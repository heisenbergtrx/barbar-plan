import { Outfit } from 'next/font/google';
import './globals.css';

// Outfit fontunu yapılandırıyoruz
const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'] // İstediğin tüm ağırlıklar
});

export const metadata = {
  title: 'Barbarians Plan',
  description: 'Professional Trading Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Fontu tüm body'ye uyguluyoruz */}
      <body className={`${outfit.className} bg-black text-neutral-400 antialiased`}>
        {children}
      </body>
    </html>
  );
}