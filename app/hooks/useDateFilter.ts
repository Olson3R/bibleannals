'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export interface DateFilterState {
  minYear: number | null;
  maxYear: number | null;
}

export interface DateFilterActions {
  setMinYear: (year: number | null) => void;
  setMaxYear: (year: number | null) => void;
  resetFilter: () => void;
}

/**
 * Custom hook for managing date filter state with URL persistence
 */
export function useDateFilter(): DateFilterState & DateFilterActions {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize state from URL parameters
  const [minYear, setMinYearState] = useState<number | null>(() => {
    const param = searchParams.get('minYear');
    return param ? parseInt(param, 10) : null;
  });
  const [maxYear, setMaxYearState] = useState<number | null>(() => {
    const param = searchParams.get('maxYear');
    return param ? parseInt(param, 10) : null;
  });

  // Function to update URL parameters
  const updateUrlParams = useCallback((params: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.replace(`${pathname}${query}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Action functions that update both state and URL
  const setMinYear = useCallback((year: number | null) => {
    setMinYearState(year);
    updateUrlParams({ minYear: year?.toString() ?? null });
  }, [updateUrlParams]);

  const setMaxYear = useCallback((year: number | null) => {
    setMaxYearState(year);
    updateUrlParams({ maxYear: year?.toString() ?? null });
  }, [updateUrlParams]);

  // Reset function to clear all filters
  const resetFilter = useCallback(() => {
    setMinYearState(null);
    setMaxYearState(null);
    updateUrlParams({ 
      minYear: null,
      maxYear: null 
    });
  }, [updateUrlParams]);

  // Sync URL params to state when navigating (only on mount and URL changes)
  useEffect(() => {
    const newMinYear = searchParams.get('minYear');
    const newMaxYear = searchParams.get('maxYear');

    const urlMinYear = newMinYear ? parseInt(newMinYear, 10) : null;
    const urlMaxYear = newMaxYear ? parseInt(newMaxYear, 10) : null;

    // Update state from URL (for navigation/initial load)
    setMinYearState(urlMinYear);
    setMaxYearState(urlMaxYear);
  }, [searchParams.toString()]); // Use toString to avoid infinite loops

  return {
    minYear,
    maxYear,
    setMinYear,
    setMaxYear,
    resetFilter
  };
}