// Utility functions for managing date filter query parameters across pages

export interface DateFilterParams {
  minYear?: string | null;
  maxYear?: string | null;
  minEra?: string | null;
  maxEra?: string | null;
}

/**
 * Extract date filter parameters from URL search params
 */
export function getDateFilterFromUrl(searchParams: URLSearchParams): DateFilterParams {
  return {
    minYear: searchParams.get('minYear'),
    maxYear: searchParams.get('maxYear'),
    minEra: searchParams.get('minEra'),
    maxEra: searchParams.get('maxEra'),
  };
}

/**
 * Add date filter parameters to a URL
 */
export function addDateFilterToUrl(url: string, dateFilter: DateFilterParams): string {
  const urlObj = new URL(url, window.location.origin);
  
  // Add date filter params if they exist
  if (dateFilter.minYear) urlObj.searchParams.set('minYear', dateFilter.minYear);
  if (dateFilter.maxYear) urlObj.searchParams.set('maxYear', dateFilter.maxYear);
  if (dateFilter.minEra) urlObj.searchParams.set('minEra', dateFilter.minEra);
  if (dateFilter.maxEra) urlObj.searchParams.set('maxEra', dateFilter.maxEra);
  
  return urlObj.pathname + urlObj.search;
}

/**
 * Get current date filter parameters from window location
 */
export function getCurrentDateFilter(): DateFilterParams {
  if (typeof window === 'undefined') return {};
  
  const searchParams = new URLSearchParams(window.location.search);
  return getDateFilterFromUrl(searchParams);
}

/**
 * Build a navigation URL with current date filter parameters preserved
 */
export function buildNavUrl(basePath: string, additionalParams?: Record<string, string>): string {
  const currentFilter = getCurrentDateFilter();
  const urlObj = new URL(basePath, window.location.origin);
  
  // Add current date filter
  if (currentFilter.minYear) urlObj.searchParams.set('minYear', currentFilter.minYear);
  if (currentFilter.maxYear) urlObj.searchParams.set('maxYear', currentFilter.maxYear);
  if (currentFilter.minEra) urlObj.searchParams.set('minEra', currentFilter.minEra);
  if (currentFilter.maxEra) urlObj.searchParams.set('maxEra', currentFilter.maxEra);
  
  // Add any additional parameters
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
  }
  
  return urlObj.pathname + urlObj.search;
}