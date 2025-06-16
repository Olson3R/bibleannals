'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface DateRangeSliderProps {
  minYear: number | null;
  maxYear: number | null;
  minEra: 'BC' | 'AD';
  maxEra: 'BC' | 'AD';
  onMinYearChange: (year: number | null) => void;
  onMaxYearChange: (year: number | null) => void;
  onMinEraChange: (era: 'BC' | 'AD') => void;
  onMaxEraChange: (era: 'BC' | 'AD') => void;
  onDateRangeChange?: (type: 'min' | 'max', year: number | null, era: 'BC' | 'AD') => void;
  onReset: () => void;
  dataMinYear?: number; // Optional: actual minimum year in the data
  dataMaxYear?: number; // Optional: actual maximum year in the data
}

export function DateRangeSlider({
  minYear,
  maxYear,
  minEra,
  maxEra,
  onMinYearChange,
  onMaxYearChange,
  onMinEraChange,
  onMaxEraChange,
  onDateRangeChange,
  onReset,
  dataMinYear = -4004, // Default to 4004 BC
  dataMaxYear = 60      // Default to 60 AD
}: DateRangeSliderProps) {
  // Calculate dynamic range based on actual data
  const BC_START = Math.abs(dataMinYear); // e.g., 4004 for 4004 BC
  const AD_END = Math.max(0, dataMaxYear); // e.g., 60 for 60 AD
  const TOTAL_RANGE = BC_START + AD_END; // Total years span
  
  const yearToSliderValue = useCallback((year: number | null, era: 'BC' | 'AD'): number => {
    if (year === null) return era === 'BC' ? 0 : TOTAL_RANGE;
    if (era === 'BC') {
      return BC_START - Math.abs(year);
    } else {
      return BC_START + Math.abs(year);
    }
  }, [BC_START, TOTAL_RANGE]);
  
  const sliderValueToYear = useCallback((value: number): { year: number; era: 'BC' | 'AD' } => {
    if (value <= BC_START) {
      return { year: BC_START - value, era: 'BC' };
    } else {
      return { year: value - BC_START, era: 'AD' };
    }
  }, [BC_START]);
  
  const [minSliderValue, setMinSliderValue] = useState(() => 
    yearToSliderValue(minYear, minEra)
  );
  const [maxSliderValue, setMaxSliderValue] = useState(() => 
    yearToSliderValue(maxYear, maxEra)
  );
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  
  useEffect(() => {
    const newValue = yearToSliderValue(minYear, minEra);
    setMinSliderValue(newValue);
  }, [minYear, minEra, yearToSliderValue]);
  
  useEffect(() => {
    const newValue = yearToSliderValue(maxYear, maxEra);
    setMaxSliderValue(newValue);
  }, [maxYear, maxEra, yearToSliderValue]);
  
  const handleSliderChange = useCallback((clientX: number) => {
    if (!sliderRef.current || !isDragging) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const value = Math.round(percentage * TOTAL_RANGE);
    
    if (isDragging === 'min') {
      const newValue = Math.min(value, maxSliderValue - 1);
      setMinSliderValue(newValue);
      const { year, era } = sliderValueToYear(newValue);
      
      // Always call both - combined first, then individual as backup
      if (onDateRangeChange) {
        onDateRangeChange('min', era === 'BC' ? -year : year, era);
      }
      
      // Also call individual handlers for immediate state update
      onMinYearChange(era === 'BC' ? -year : year);
      if (era !== minEra) {
        onMinEraChange(era);
      }
    } else if (isDragging === 'max') {
      const newValue = Math.max(value, minSliderValue + 1);
      setMaxSliderValue(newValue);
      const { year, era } = sliderValueToYear(newValue);
      
      // Always call both - combined first, then individual as backup
      if (onDateRangeChange) {
        onDateRangeChange('max', era === 'BC' ? -year : year, era);
      }
      
      // Also call individual handlers for immediate state update
      onMaxYearChange(era === 'BC' ? -year : year);
      if (era !== maxEra) {
        onMaxEraChange(era);
      }
    }
  }, [isDragging, maxSliderValue, minSliderValue, TOTAL_RANGE, sliderValueToYear, onMinYearChange, onMinEraChange, onMaxYearChange, onMaxEraChange, onDateRangeChange, minEra, maxEra]);
  
  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleSliderChange(e.clientX);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(null);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleSliderChange]);
  
  const minPercentage = (minSliderValue / TOTAL_RANGE) * 100;
  const maxPercentage = (maxSliderValue / TOTAL_RANGE) * 100;
  
  return (
    <div className="w-full max-w-sm">
      {/* Combined input and slider header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
          📅
          <span className="hidden sm:inline">Filter</span>
        </span>
        
        {/* Compact input fields */}
        <div className="flex items-center gap-1 text-xs">
          <input
            type="number"
            placeholder="4004"
            value={minYear ? Math.abs(minYear) : ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : null;
              onMinYearChange(val ? (minEra === 'BC' ? -Math.abs(val) : Math.abs(val)) : null);
            }}
            className="w-16 px-1 py-1 border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={minEra}
            onChange={(e) => {
              const newEra = e.target.value as 'BC' | 'AD';
              onMinEraChange(newEra);
              if (minYear) {
                onMinYearChange(newEra === 'BC' ? -Math.abs(minYear) : Math.abs(minYear));
              }
            }}
            className="border border-gray-300 rounded px-1 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="BC">BC</option>
            <option value="AD">AD</option>
          </select>
          <span className="text-gray-400">—</span>
          <input
            type="number"
            placeholder="100"
            value={maxYear ? Math.abs(maxYear) : ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : null;
              onMaxYearChange(val ? (maxEra === 'BC' ? -Math.abs(val) : Math.abs(val)) : null);
            }}
            className="w-16 px-1 py-1 border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={maxEra}
            onChange={(e) => {
              const newEra = e.target.value as 'BC' | 'AD';
              onMaxEraChange(newEra);
              if (maxYear) {
                onMaxYearChange(newEra === 'BC' ? -Math.abs(maxYear) : Math.abs(maxYear));
              }
            }}
            className="border border-gray-300 rounded px-1 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="AD">AD</option>
            <option value="BC">BC</option>
          </select>
        </div>
        
        {/* Clear button */}
        {(minYear || maxYear) && (
          <button
            onClick={onReset}
            className="text-xs text-gray-500 hover:text-gray-700 p-1"
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
          className="relative h-1.5 bg-gray-200 rounded-full cursor-pointer"
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
            className="absolute w-3 h-3 bg-blue-600 border border-white rounded-full shadow-sm cursor-grab active:cursor-grabbing transform -translate-y-0.5"
            style={{ left: `${minPercentage}%`, marginLeft: '-6px' }}
            onMouseDown={handleMouseDown('min')}
          />
          
          {/* Max handle */}
          <div
            className="absolute w-3 h-3 bg-blue-600 border border-white rounded-full shadow-sm cursor-grab active:cursor-grabbing transform -translate-y-0.5"
            style={{ left: `${maxPercentage}%`, marginLeft: '-6px' }}
            onMouseDown={handleMouseDown('max')}
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
    <div className="hidden sm:flex absolute w-full top-2 text-xs text-gray-400">
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