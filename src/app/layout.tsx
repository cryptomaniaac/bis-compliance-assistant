import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'BIS Compliance Assistant — AI Guidance for Startups & Founders (SIH26107)',
  description: 'Instant, grounded BIS certification roadmaps, applicable IS standards, testing requirements, and action checklists for Indian startups and manufacturers.',
  keywords: 'BIS certification, Indian Standards, ISI Mark, CRS, BIS Compliance Assistant, SIH26107, startup compliance'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
