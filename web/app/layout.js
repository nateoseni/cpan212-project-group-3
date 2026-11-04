import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'PageTurner',
  description: 'Reading goal tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1>PageTurner</h1>
          <nav>
            <link href="/">Home</link>
            <Link href="/goals">Goals</Link>
            <Link href="/goals/new">New Goal</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}