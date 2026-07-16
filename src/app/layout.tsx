import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeRegistry } from '@/design/ThemeRegistry';
import { NavBar } from '@/components/NavBar';
import { getCurrentUser } from '@/lib/supabase/server';
import './globals.css';

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Interview Prep Platform',
  description:
    'Practice coding, code review, tech, and behavioural interviews — grounded in the actual role.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable}`}>
      <body>
        <ThemeRegistry>
          <NavBar userEmail={user?.email ?? null} />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
