import type { Metadata } from 'next';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Some Claude Skills',
  description: 'Expert AI Agents for Specialized Tasks - 90+ curated Claude Code skills',
  keywords: ['claude', 'ai', 'skills', 'agents', 'anthropic', 'coding'],
  authors: [{ name: 'Erich Owens' }],
  openGraph: {
    title: 'Some Claude Skills',
    description: 'Expert AI Agents for Specialized Tasks',
    url: 'https://someclaudeskills.com',
    siteName: 'Some Claude Skills',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Some Claude Skills',
    description: 'Expert AI Agents for Specialized Tasks',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
