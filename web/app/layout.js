import './globals.css';

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
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}