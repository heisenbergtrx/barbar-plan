import './globals.css';

export const metadata = {
  title: 'Barbarians Plan',
  description: 'Professional Trading Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-neutral-400">{children}</body>
    </html>
  );
}