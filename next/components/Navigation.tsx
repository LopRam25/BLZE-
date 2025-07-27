"use client";
import Link from 'next/link';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Menu' },
  { path: '/about', label: 'About' },
  { path: '/blog', label: 'Blog' },
  { path: '/contact', label: 'Contact' },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="bg-black text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center h-14">
          <Link href="/" className="text-xl font-extrabold tracking-wider">
            BLZE
          </Link>
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            ☰
          </button>
          <ul className="hidden md:flex space-x-6">
            {navItems.map(({ path, label }) => (
              <li key={path}>
                <Link href={path} className="hover:text-green-400">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="tel:+18285551234"
                className="bg-blue-600 px-3 py-1 rounded-lg hover:bg-blue-700"
              >
                📞 Call
              </a>
            </li>
          </ul>
        </div>
        {open && (
          <ul className="md:hidden bg-black px-4 pb-4 space-y-2">
            {navItems.map(({ path, label }) => (
              <li key={path}>
                <Link
                  href={path}
                  className="block py-2"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="tel:+18285551234"
                className="block py-2 bg-blue-600 text-center rounded-lg"
              >
                📞 Call
              </a>
            </li>
          </ul>
        )}
      </nav>

      {/* Delivery Areas */}
      <div className="bg-blue-600 text-white text-sm py-1 shadow-inner">
        <div className="container mx-auto px-4 text-center space-x-4 overflow-x-auto whitespace-nowrap">
          <span className="font-semibold">🚚 Delivery Areas:</span>
          <span>Buncombe</span>
          <span>Henderson</span>
          <span>Polk</span>
          <span>Transylvania</span>
        </div>
      </div>
    </>
  );
}