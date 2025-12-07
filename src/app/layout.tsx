import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProvider from '@/components/providers/ClientProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "BudgetByMe - Plan Life's Special Moments",
  description: "Budgeting and expense tracking for life's major events",
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
