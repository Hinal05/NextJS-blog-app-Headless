'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('csrf_token'));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <nav className="max-w-6xl mx-auto flex justify-between items-center p-4">
            <div className="flex gap-4">
              <Link href="/" className="font-bold">Home</Link>
              <Link href="/blog">Blog</Link>
            </div>
            <div>
              {isLoggedIn ? (
                <button onClick={handleLogout} className="text-red-600 font-medium">Logout</button>
              ) : (
                <Link href="/login" className="text-blue-600 font-medium">Login</Link>
              )}
            </div>
          </nav>
        </header>
        <main className="max-w-6xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}