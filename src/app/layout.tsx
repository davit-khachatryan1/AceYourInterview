import type { Metadata } from 'next';
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google';
import FirebaseAnalyticsBootstrap from '@/components/FirebaseAnalyticsBootstrap';
import ThemeInitializer from '@/components/ThemeInitializer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AceYourInterview',
  description: 'Premium bilingual interview preparation workspace.',
};

const themeBootstrapScript = `
(() => {
  try {
    const key = 'ace-your-interview-ui';
    const raw = window.localStorage.getItem(key);
    let theme = 'system';
    if (raw) {
      const parsed = JSON.parse(raw);
      const fromStore = parsed?.state?.theme;
      if (fromStore === 'dark' || fromStore === 'light' || fromStore === 'system') {
        theme = fromStore;
      }
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
  } catch {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = 'dark';
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <FirebaseAnalyticsBootstrap />
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
