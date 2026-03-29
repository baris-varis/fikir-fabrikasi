import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ideactory.ai v6.2',
  description: 'Startup fikirlerinizi McKinsey analitikliği, YC pragmatizmi ve Sequoia vizyonuyla analiz edin.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
