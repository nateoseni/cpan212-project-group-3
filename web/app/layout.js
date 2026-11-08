import './globals.css';
import Link from 'next/link';
import { NotificationProvider } from './NotificationContext';
import NotificationBanner from './NotificationBanner';

export const metadata = {
  title: 'PageTurner',
  description: 'Reading goal tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NotificationProvider>
        <header>
          <h1>PageTurner</h1>
          <nav>
            <Link href="/">Home</Link>
            <Link href="/goals">Goals</Link>
            <Link href="/goals/new">New Goal</Link>
            <Link href="/books">Find books</Link>
          </nav>
        </header>
        <NotificationBanner /> {/* show any notifications */}
        <main>{children}</main> {/* render the page content */}
        </NotificationProvider>
      </body>
    </html>
  );
}