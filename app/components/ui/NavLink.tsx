'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  additionalParams?: Record<string, string>;
  preserveFilter?: boolean;
}

/**
 * Navigation Link component that preserves date filter query parameters
 */
export function NavLink({ 
  href, 
  children, 
  className, 
  additionalParams,
  preserveFilter = true 
}: NavLinkProps) {
  const searchParams = useSearchParams();
  
  // Build URL with preserved filter parameters
  const url = preserveFilter ? (() => {
    // Simple approach: append current query params to href
    const currentParams = new URLSearchParams();
    
    // Add current date filter params
    const minYear = searchParams.get('minYear');
    const maxYear = searchParams.get('maxYear');
    const minEra = searchParams.get('minEra');
    const maxEra = searchParams.get('maxEra');
    
    console.log('NavLink: current search params:', { minYear, maxYear, minEra, maxEra });
    console.log('NavLink: building URL for href:', href);
    
    if (minYear) currentParams.set('minYear', minYear);
    if (maxYear) currentParams.set('maxYear', maxYear);
    if (minEra) currentParams.set('minEra', minEra);
    if (maxEra) currentParams.set('maxEra', maxEra);
    
    // Add any additional parameters
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        currentParams.set(key, value);
      });
    }
    
    // Combine href with query string
    const separator = href.includes('?') ? '&' : '?';
    const queryString = currentParams.toString();
    const finalUrl = queryString ? `${href}${separator}${queryString}` : href;
    
    console.log('NavLink: final URL:', finalUrl);
    return finalUrl;
  })() : href;

  return (
    <Link href={url} className={className}>
      {children}
    </Link>
  );
}