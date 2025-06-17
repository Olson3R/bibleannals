'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface DateRangeSliderProps {
  minYear: number | null;
  maxYear: number | null;
  onMinYearChange: (year: number | null) => void;
  onMaxYearChange: (year: number | null) => void;
  onReset: () => void;
  dataMinYear?: number; // Optional: actual minimum year in the data
  dataMaxYear?: number; // Optional: actual maximum year in the data
}

export function DateRangeSlider({
  minYear,
  maxYear,
  onMinYearChange,
  onMaxYearChange,
  onReset,
  dataMinYear = -4004, // Default to 4004 BC
  dataMaxYear = 60      // Default to 60 AD
}: DateRangeSliderProps) {
  // Calculate dynamic range based on actual data
  const BC_START = Math.abs(dataMinYear); // e.g., 4004 for 4004 BC
  const AD_END = Math.max(0, dataMaxYear); // e.g., 60 for 60 AD
  const TOTAL_RANGE = BC_START + AD_END; // Total years span
  
  const yearToSliderValue = useCallback((year: number | null): number => {
    if (year === null) return 0;
    if (year < 0) {
      // BC year (negative value)
      return BC_START - Math.abs(year);
    } else {
      // AD year (positive value)
      return BC_START + year;
    }
  }, [BC_START]);
  
  const sliderValueToYear = useCallback((value: number): number => {
    if (value <= BC_START) {
      // BC year - return negative value
      return -(BC_START - value);
    } else {
      // AD year - return positive value
      return value - BC_START;
    }
  }, [BC_START]);
  
  const [minSliderValue, setMinSliderValue] = useState(() => 
    yearToSliderValue(minYear ?? dataMinYear)
  );
  const [maxSliderValue, setMaxSliderValue] = useState(() => 
    yearToSliderValue(maxYear ?? dataMaxYear)
  );
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  
  useEffect(() => {
    const newValue = yearToSliderValue(minYear ?? dataMinYear);
    setMinSliderValue(newValue);
  }, [minYear, yearToSliderValue, dataMinYear]);
  
  useEffect(() => {
    const newValue = yearToSliderValue(maxYear ?? dataMaxYear);
    setMaxSliderValue(newValue);
  }, [maxYear, yearToSliderValue, dataMaxYear]);
  
  const handleSliderChange = useCallback((clientX: number) => {
    if (!sliderRef.current || !isDragging) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const value = Math.round(percentage * TOTAL_RANGE);
    
    // Minimum gap of 10 years between handles to prevent confusion
    const MIN_GAP = Math.round(10 * TOTAL_RANGE / (BC_START + AD_END));
    
    if (isDragging === 'min') {
      const newValue = Math.min(value, maxSliderValue - MIN_GAP);
      setMinSliderValue(newValue);
      const year = sliderValueToYear(newValue);
      onMinYearChange(year);
    } else if (isDragging === 'max') {
      const newValue = Math.max(value, minSliderValue + MIN_GAP);
      setMaxSliderValue(newValue);
      const year = sliderValueToYear(newValue);
      onMaxYearChange(year);
    }
  }, [isDragging, maxSliderValue, minSliderValue, TOTAL_RANGE, BC_START, AD_END, sliderValueToYear, onMinYearChange, onMaxYearChange]);
  
  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleTouchStart = (type: 'min' | 'max') => (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleSliderChange(e.clientX);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        e.preventDefault();
        handleSliderChange(e.touches[0].clientX);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(null);
    };
    
    const handleTouchEnd = () => {
      setIsDragging(null);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleSliderChange]);
  
  const minPercentage = (minSliderValue / TOTAL_RANGE) * 100;
  const maxPercentage = (maxSliderValue / TOTAL_RANGE) * 100;
  
  return (
    <div className="w-full max-w-sm">
      {/* Combined input and slider header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-400 flex items-center gap-1">
          📅
          <span className="hidden sm:inline">Filter</span>
        </span>
        
        {/* Compact input fields */}
        <div className="flex items-center gap-1 text-xs">
          <input
            type="number"
            placeholder="4004"
            value={minYear !== null ? Math.abs(minYear) : ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : null;
              if (val !== null) {
                // Preserve current era, or default to BC if no previous value
                const currentEra = minYear !== null ? (minYear < 0 ? 'BC' : 'AD') : 'BC';
                onMinYearChange(currentEra === 'BC' ? -Math.abs(val) : Math.abs(val));
              } else {
                onMinYearChange(null);
              }
            }}
            className="w-16 px-1 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={minYear !== null ? (minYear < 0 ? 'BC' : 'AD') : 'BC'}
            onChange={(e) => {
              const newEra = e.target.value as 'BC' | 'AD';
              if (minYear !== null) {
                onMinYearChange(newEra === 'BC' ? -Math.abs(minYear) : Math.abs(minYear));
              }
            }}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded px-1 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="BC">BC</option>
            <option value="AD">AD</option>
          </select>
          <span className="text-gray-400 dark:text-gray-500">—</span>
          <input
            type="number"
            placeholder="100"
            value={maxYear !== null ? Math.abs(maxYear) : ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : null;
              if (val !== null) {
                // Preserve current era, or default to AD if no previous value
                const currentEra = maxYear !== null ? (maxYear < 0 ? 'BC' : 'AD') : 'AD';
                onMaxYearChange(currentEra === 'BC' ? -Math.abs(val) : Math.abs(val));
              } else {
                onMaxYearChange(null);
              }
            }}
            className="w-16 px-1 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={maxYear !== null ? (maxYear < 0 ? 'BC' : 'AD') : 'AD'}
            onChange={(e) => {
              const newEra = e.target.value as 'BC' | 'AD';
              if (maxYear !== null) {
                onMaxYearChange(newEra === 'BC' ? -Math.abs(maxYear) : Math.abs(maxYear));
              }
            }}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded px-1 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="AD">AD</option>
            <option value="BC">BC</option>
          </select>
        </div>
        
        {/* Clear button */}
        {(minYear || maxYear) && (
          <button
            onClick={onReset}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1"
            title="Clear date filter"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Compact slider */}
      <div className="relative">
        <div
          ref={sliderRef}
          className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
        >
          {/* Active range */}
          <div
            className="absolute h-1.5 bg-blue-500 rounded-full"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />
          
          {/* Min handle */}
          <div
            className="absolute w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md cursor-grab active:cursor-grabbing -translate-x-1/2 touch-manipulation"
            style={{ 
              left: `${minPercentage}%`,
              padding: '6px',
              margin: '-6px 3px 0 4px'
            }}
            onMouseDown={handleMouseDown('min')}
            onTouchStart={handleTouchStart('min')}
          />
          
          {/* Max handle */}
          <div
            className="absolute w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md cursor-grab active:cursor-grabbing -translate-x-1/2 touch-manipulation"
            style={{ 
              left: `${maxPercentage}%`,
              marginTop: '3px',
              padding: '6px',
              margin: '-6px 0 0 -8px'
            }}
            onMouseDown={handleMouseDown('max')}
            onTouchStart={handleTouchStart('max')}
          />
        </div>
        
        {/* Dynamic scale markers - only show on larger screens */}
        <DynamicScaleMarkers
          bcStart={BC_START}
          adEnd={AD_END}
          totalRange={TOTAL_RANGE}
        />
      </div>
    </div>
  );
}

interface DynamicScaleMarkersProps {
  bcStart: number;
  adEnd: number;
  totalRange: number;
}

function DynamicScaleMarkers({ bcStart, adEnd, totalRange }: DynamicScaleMarkersProps) {
  const markers = useMemo(() => {
    const result: { position: number; label: string; key: string }[] = [];
    
    // Always include the start point
    result.push({
      position: 0,
      label: `${bcStart}BC`,
      key: 'start'
    });
    
    // Handle AD markers with overlap detection
    if (adEnd > 0) {
      const adStartPosition = (bcStart / totalRange) * 100;
      const adEndPosition = 100;
      
      // Check if 1AD and end AD would overlap (minimum 20% apart for AD markers)
      const adSpacing = adEndPosition - adStartPosition;
      
      if (adSpacing >= 20) {
        // Enough space for both markers
        result.push({
          position: adStartPosition,
          label: '1AD',
          key: 'ad-start'
        });
        result.push({
          position: adEndPosition,
          label: `${adEnd}AD`,
          key: 'end'
        });
      } else {
        // Too close - only show the end marker
        result.push({
          position: adEndPosition,
          label: `${adEnd}AD`,
          key: 'end'
        });
      }
    }
    
    // Add intermediate BC markers, but only if they don't overlap
    const bcRange = bcStart;
    const intervals = [1000, 500, 250, 100]; // Try different intervals
    
    for (const interval of intervals) {
      const potentialMarkers: { position: number; label: string; key: string }[] = [];
      
      // Generate markers at this interval
      for (let year = interval; year < bcRange; year += interval) {
        const position = ((bcRange - year) / totalRange) * 100;
        potentialMarkers.push({
          position,
          label: `${year}BC`,
          key: `bc-${year}`
        });
      }
      
      // Check if these markers would have enough space (minimum 15% apart)
      const allMarkers = [...result, ...potentialMarkers].sort((a, b) => a.position - b.position);
      let hasOverlap = false;
      
      for (let i = 1; i < allMarkers.length; i++) {
        if (allMarkers[i].position - allMarkers[i - 1].position < 15) {
          hasOverlap = true;
          break;
        }
      }
      
      if (!hasOverlap) {
        result.push(...potentialMarkers);
        break; // Use this interval and stop trying smaller ones
      }
    }
    
    return result.sort((a, b) => a.position - b.position);
  }, [bcStart, adEnd, totalRange]);
  
  return (
    <div className="hidden sm:flex absolute w-full top-2 text-xs text-gray-400 dark:text-gray-500">
      {markers.map((marker) => (
        <span
          key={marker.key}
          style={{
            position: 'absolute',
            left: `${marker.position}%`,
            transform: marker.position === 0 ? 'translateX(0%)' : 
                      marker.position === 100 ? 'translateX(-100%)' : 
                      'translateX(-50%)'
          }}
        >
          {marker.label}
        </span>
      ))}
    </div>
  );
}