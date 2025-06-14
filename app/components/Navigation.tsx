'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Biblical Timeline', description: 'Comprehensive biblical history with events, people, and regions' }
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
              Biblical Timeline
            </Link>
            <div className="hidden md:flex space-x-6">
              {navItems.map(({ href, label, description }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === href
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                  title={description}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
              onClick={() => {
                const menu = document.getElementById('mobile-menu');
                menu?.classList.toggle('hidden');
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div id="mobile-menu" className="hidden md:hidden pb-4">
          <div className="space-y-2">
            {navItems.map(({ href, label, description }) => (
              <Link
                key={href}
                href={href}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
                title={description}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}