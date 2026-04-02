import '@/styles/globals.css';
import type { ReactNode } from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { fontSans } from '@/config/fonts';
import { Providers } from './providers';
import NavBar from '../components/ui/navBar/NavBar';
import clsx from 'clsx';
import ohanaLogo from '../components/images/ohana-patch.png';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: `${ohanaLogo.src}`,
    shortcut: `${ohanaLogo.src}`,
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head />
      <body className={clsx('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'ohana' }}>
          <div className='relative flex flex-col h-screen'>
            <NavBar />
            <main className='container mx-auto max-w-7xl pt-16 px-6 flex-grow'>
              <ToastContainer position='top-right' autoClose={2000} closeOnClick theme='dark' />
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
