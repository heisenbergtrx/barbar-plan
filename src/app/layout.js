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
```

Bunu yaptıktan sonra, VS Code terminalinden şu komutları çalıştırarak tekrar gönder:

```bash
git add .
git commit -m "Fix: Add missing root layout"
git push