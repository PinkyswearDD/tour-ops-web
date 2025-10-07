import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tour Ops - Play Dead Management',
  description: 'Tour management system for Play Dead Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}