import type { Metadata } from 'next';
import { Heebo } from 'next/font/google';
import './globals.css';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: {
    default: 'Digitech Learning Hub',
    template: '%s · Digitech',
  },
  description: 'מועדון הלמידה של Digitech — קורסים, מדריכים ופלייבוקים ב-AI ובדיגיטל',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className={`${heebo.className} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
