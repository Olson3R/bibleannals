'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export interface DateFilterState {
  minYear: number | null;
  maxYear: number | null;
  minEra: 'BC' | 'AD';
  maxEra: 'BC' | 'AD';
}

export interface DateFilterActions {
  setMinYear: (year: number | null) => void;
  setMaxYear: (year: number | null) => void;
  setMinEra: (era: 'BC' | 'AD') => void;
  setMaxEra: (era: 'BC' | 'AD') => void;
  updateDateRange: (type: 'min' | 'max', year: number | null, era: 'BC' | 'AD') => void;
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
  const [minEra, setMinEraState] = useState<'BC' | 'AD'>(() => {
    const param = searchParams.get('minEra');
    return param === 'AD' ? 'AD' : 'BC';
  });
  const [maxEra, setMaxEraState] = useState<'BC' | 'AD'>(() => {
    const param = searchParams.get('maxEra');
    return param === 'BC' ? 'BC' : 'AD';
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

  const setMinEra = useCallback((era: 'BC' | 'AD') => {
    setMinEraState(era);
    updateUrlParams({ minEra: era });
  }, [updateUrlParams]);

  const setMaxEra = useCallback((era: 'BC' | 'AD') => {
    setMaxEraState(era);
    updateUrlParams({ maxEra: era });
  }, [updateUrlParams]);

  // Combined update function for atomic year and era changes
  const updateDateRange = useCallback((type: 'min' | 'max', year: number | null, era: 'BC' | 'AD') => {
    if (type === 'min') {
      setMinYearState(year);
      setMinEraState(era);
      updateUrlParams({ 
        minYear: year?.toString() ?? null,
        minEra: era 
      });
    } else {
      setMaxYearState(year);
      setMaxEraState(era);
      updateUrlParams({ 
        maxYear: year?.toString() ?? null,
        maxEra: era 
      });
    }
  }, [updateUrlParams]);

  // Reset function
  const resetFilter = useCallback(() => {
    setMinYearState(null);
    setMaxYearState(null);
    setMinEraState('BC');
    setMaxEraState('AD');
    updateUrlParams({
      minYear: null,
      maxYear: null,
      minEra: null,
      maxEra: null
    });
  }, [updateUrlParams]);

  // Sync URL params to state when navigating (only on mount and URL changes)
  useEffect(() => {
    const newMinYear = searchParams.get('minYear');
    const newMaxYear = searchParams.get('maxYear');
    const newMinEra = searchParams.get('minEra');
    const newMaxEra = searchParams.get('maxEra');

    const urlMinYear = newMinYear ? parseInt(newMinYear, 10) : null;
    const urlMaxYear = newMaxYear ? parseInt(newMaxYear, 10) : null;
    const urlMinEra = newMinEra === 'AD' ? 'AD' : 'BC';
    const urlMaxEra = newMaxEra === 'BC' ? 'BC' : 'AD';

    // Update state from URL (for navigation/initial load)
    setMinYearState(urlMinYear);
    setMaxYearState(urlMaxYear);
    setMinEraState(urlMinEra);
    setMaxEraState(urlMaxEra);
  }, [searchParams.toString()]); // Use toString to avoid infinite loops

  return {
    minYear,
    maxYear,
    minEra,
    maxEra,
    setMinYear,
    setMaxYear,
    setMinEra,
    setMaxEra,
    updateDateRange,
    resetFilter
  };
}