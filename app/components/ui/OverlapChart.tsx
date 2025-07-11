'use client';

import { useState, useMemo, useEffect } from 'react';
import type { BiblicalEvent, BiblicalPerson, TimelinePeriod } from '../../types/biblical';
import { parseDate, parseDateRange } from '../../utils/date-parsing';

interface OverlapChartProps {
  events: BiblicalEvent[];
  persons: BiblicalPerson[];
  timelinePeriods: TimelinePeriod[];
  showEvents: boolean;
  showPeople: boolean;
  minYear: number | null;
  maxYear: number | null;
  onEventClick?: (event: BiblicalEvent) => void;
  onPersonClick?: (person: BiblicalPerson) => void;
  periodSlug?: string; // For making headers clickable on period pages
}

interface ChartItem {
  id: string;
  name: string;
  type: 'person' | 'event' | 'ethnicity';
  startYear: number;
  endYear: number | null;
  color: string;
  ethnicity?: string;
  originalIndex: number; // For consistent coloring
  data?: BiblicalEvent | BiblicalPerson; // Store original data for click handlers
  truncatedStart?: boolean; // Indicates if start was truncated
  truncatedEnd?: boolean; // Indicates if end was truncated
  originalStartYear?: number; // Original start year before truncation
  originalEndYear?: number | null; // Original end year before truncation
}

const TYPE_COLORS = {
  person: '#3b82f6',     // Blue
  event: '#ef4444',      // Red
  ethnicity: '#10b981'   // Green
};

const ETHNICITY_COLORS = [
  '#8b5cf6', '#f59e0b', '#06b6d4', '#84cc16', '#f97316',
  '#ec4899', '#6366f1', '#14b8a6', '#eab308', '#8b5cf6'
];

// Period colors matching the timeline (converted from Tailwind to actual colors)
const PERIOD_BACKGROUND_COLORS = [
  'rgba(16, 185, 129, 0.05)',   // Emerald (Creation & Nature)
  'rgba(59, 130, 246, 0.05)',   // Blue (Waters & Covenant) 
  'rgba(245, 158, 11, 0.05)',   // Amber (Desert & Bondage)
  'rgba(249, 115, 22, 0.05)',   // Orange (Journey & Wilderness)
  'rgba(139, 92, 246, 0.05)',   // Purple (Judges & Transition)
  'rgba(239, 68, 68, 0.05)',    // Red (Kingdom & Power)
  'rgba(236, 72, 153, 0.05)',   // Pink (Division & Conflict)
  'rgba(99, 102, 241, 0.05)',   // Indigo (Exile & Return)
  'rgba(71, 85, 105, 0.05)',    // Slate (Silent Period)
  'rgba(20, 184, 166, 0.05)',   // Teal (New Testament & Life)
];

const PERIOD_BORDER_COLORS = [
  'rgba(16, 185, 129, 0.3)',    // Emerald
  'rgba(59, 130, 246, 0.3)',    // Blue
  'rgba(245, 158, 11, 0.3)',    // Amber
  'rgba(249, 115, 22, 0.3)',    // Orange
  'rgba(139, 92, 246, 0.3)',    // Purple
  'rgba(239, 68, 68, 0.3)',     // Red
  'rgba(236, 72, 153, 0.3)',    // Pink
  'rgba(99, 102, 241, 0.3)',    // Indigo
  'rgba(71, 85, 105, 0.3)',     // Slate
  'rgba(20, 184, 166, 0.3)',    // Teal
];

export function OverlapChart({
  events,
  persons,
  timelinePeriods,
  showEvents,
  showPeople,
  minYear,
  maxYear,
  onEventClick,
  onPersonClick,
  periodSlug
}: OverlapChartProps) {
  const [selectedType, setSelectedType] = useState<'all' | 'person' | 'event' | 'ethnicity'>('all');
  const [selectedEthnicity, setSelectedEthnicity] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Ensure component only renders on client to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
    
    // Check for dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Handle chart download with improved SVG processing
  const handleDownloadChart = () => {
    // Find the chart SVG by its unique ID
    const svgElement = document.getElementById('overlap-chart-svg') as unknown as SVGSVGElement;
    
    if (!svgElement || svgElement.tagName.toLowerCase() !== 'svg') {
      console.error('Chart SVG not found for download');
      alert('Chart SVG not found. Please make sure you are on the chart view.');
      return;
    }

    // Debug: Log what we found
    console.log('Found SVG element:', svgElement);
    console.log('SVG ID:', svgElement.id);
    console.log('SVG dimensions:', svgElement.getAttribute('width'), 'x', svgElement.getAttribute('height'));

    try {
      console.log('Starting chart download process...');
      
      // Clone the SVG element
      const svgClone = svgElement.cloneNode(true) as SVGElement;
      
      // Get dimensions
      const width = parseInt(svgElement.getAttribute('width') || '1000');
      const height = parseInt(svgElement.getAttribute('height') || '600');
      
      // Set proper SVG attributes
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      svgClone.setAttribute('width', width.toString());
      svgClone.setAttribute('height', height.toString());
      svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`);
      
      // Convert foreignObject elements to native SVG text elements to avoid taint issues
      const foreignObjects = svgClone.querySelectorAll('foreignObject');
      foreignObjects.forEach((foreignObj) => {
        const div = foreignObj.querySelector('div');
        if (div) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', foreignObj.getAttribute('x') || '0');
          text.setAttribute('y', (parseInt(foreignObj.getAttribute('y') || '0') + 12).toString()); // Adjust for baseline
          text.setAttribute('font-size', '12');
          text.setAttribute('font-family', 'Arial, sans-serif');
          text.setAttribute('fill', isDarkMode ? '#9ca3af' : '#4b5563');
          text.setAttribute('text-anchor', 'end');
          text.textContent = div.textContent || div.title || '';
          
          // Replace foreignObject with text element
          foreignObj.parentNode?.replaceChild(text, foreignObj);
        }
      });
      
      // Add comprehensive inline styles for standalone SVG
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = `
        text { 
          font-family: Arial, sans-serif; 
          font-size: 12px;
        }
        .fill-gray-600 { fill: #4b5563; }
        .dark\\:fill-gray-400 { fill: #9ca3af; }
        .text-gray-600 { fill: #4b5563; }
        .dark\\:text-gray-400 { fill: #9ca3af; }
      `;
      svgClone.insertBefore(style, svgClone.firstChild);
      
      // Serialize and create download
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(svgBlob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `biblical-timeline-chart-${new Date().toISOString().split('T')[0]}.svg`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 100);
      
      console.log('Chart download completed successfully');
      
    } catch (error) {
      console.error('Error downloading chart:', error);
      alert('Failed to download chart. Please try again.');
    }
  };

  const { chartItems, yearRange, ethnicities } = useMemo(() => {
    const items: ChartItem[] = [];
    let minChartYear = Infinity;
    let maxChartYear = -Infinity;
    const ethnicitySet = new Set<string>();

    // Detect if we're viewing a single period (period-specific page)
    const isSinglePeriod = timelinePeriods.length === 1;
    let periodStartYear = null;
    let periodEndYear = null;
    
    if (isSinglePeriod && timelinePeriods[0]) {
      try {
        const { startYear, endYear } = parseDateRange(timelinePeriods[0].dateRange);
        periodStartYear = startYear;
        periodEndYear = endYear;
      } catch (error) {
        console.warn('Error parsing period range:', error);
      }
    }

    try {

    // Process people
    if (showPeople) {
      persons.forEach((person, index) => {
        const birthYear = parseDate(person.birth_date || '');
        const deathYear = parseDate(person.death_date || '');
        
        if (birthYear !== null) {
          // Check if within filter range
          if ((minYear === null || birthYear >= minYear) && 
              (maxYear === null || (deathYear || birthYear) <= maxYear)) {
            
            let displayStartYear = birthYear;
            let displayEndYear = deathYear;
            let truncatedStart = false;
            let truncatedEnd = false;
            
            // For period-specific pages, truncate lifespans based on period dates with buffer
            if (isSinglePeriod && periodStartYear !== null && periodEndYear !== null && deathYear !== null) {
              // Add 2% of period range as buffer before truncating
              const periodSpan = periodEndYear - periodStartYear;
              const buffer = Math.round(periodSpan * 0.02);
              const truncateStartBound = periodStartYear - buffer;
              const truncateEndBound = periodEndYear + buffer;
              
              // Apply truncation if the person's lifespan extends beyond the buffer zone
              if (birthYear < truncateStartBound || deathYear > truncateEndBound) {
                const newStartYear = Math.max(birthYear, truncateStartBound);
                const newEndYear = Math.min(deathYear, truncateEndBound);
                
                truncatedStart = newStartYear > birthYear;
                truncatedEnd = newEndYear < deathYear;
                displayStartYear = newStartYear;
                displayEndYear = newEndYear;
              }
            }
            
            items.push({
              id: person.id,
              name: person.name,
              type: 'person',
              startYear: displayStartYear,
              endYear: displayEndYear,
              color: TYPE_COLORS.person,
              ethnicity: person.ethnicity,
              originalIndex: index,
              data: person,
              truncatedStart,
              truncatedEnd,
              originalStartYear: birthYear,
              originalEndYear: deathYear
            });
            
            minChartYear = Math.min(minChartYear, displayStartYear);
            maxChartYear = Math.max(maxChartYear, displayEndYear || displayStartYear);
            
            if (person.ethnicity) {
              ethnicitySet.add(person.ethnicity);
            }
          }
        }
      });
    }

    // Process events
    if (showEvents) {
      events.forEach((event, index) => {
        const eventYear = parseDate(event.date);
        
        if (eventYear !== null) {
          // Check if within filter range
          if ((minYear === null || eventYear >= minYear) && 
              (maxYear === null || eventYear <= maxYear)) {
            
            items.push({
              id: event.id,
              name: event.name,
              type: 'event',
              startYear: eventYear,
              endYear: null, // Events are points in time
              color: TYPE_COLORS.event,
              originalIndex: index,
              data: event
            });
            
            minChartYear = Math.min(minChartYear, eventYear);
            maxChartYear = Math.max(maxChartYear, eventYear);
          }
        }
      });
    }

    // Process ethnicities as grouped ranges
    const ethnicityList = Array.from(ethnicitySet);
    ethnicityList.forEach((ethnicity, index) => {
      const ethnicityPeople = items.filter(item => 
        item.type === 'person' && item.ethnicity === ethnicity
      );
      
      if (ethnicityPeople.length > 0) {
        const originalStartYear = Math.min(...ethnicityPeople.map(p => p.startYear));
        const originalEndYear = Math.max(...ethnicityPeople.map(p => p.endYear || p.startYear));
        let startYear = originalStartYear;
        let endYear = originalEndYear;
        let truncatedStart = false;
        let truncatedEnd = false;
        
        // For period-specific pages, truncate ethnicities based on period dates with buffer
        if (isSinglePeriod && periodStartYear !== null && periodEndYear !== null) {
          // Add 2% of period range as buffer before truncating
          const periodSpan = periodEndYear - periodStartYear;
          const buffer = Math.round(periodSpan * 0.02);
          const truncateStartBound = periodStartYear - buffer;
          const truncateEndBound = periodEndYear + buffer;
          
          // Apply truncation if the entity extends beyond the buffer zone
          if (startYear < truncateStartBound || endYear > truncateEndBound) {
            const newStartYear = Math.max(startYear, truncateStartBound);
            const newEndYear = Math.min(endYear, truncateEndBound);
            
            truncatedStart = newStartYear > startYear;
            truncatedEnd = newEndYear < endYear;
            startYear = newStartYear;
            endYear = newEndYear;
          }
        }
        
        items.push({
          id: `ethnicity-${ethnicity}`,
          name: `${ethnicity} People`,
          type: 'ethnicity',
          startYear,
          endYear,
          color: ETHNICITY_COLORS[index % ETHNICITY_COLORS.length],
          ethnicity,
          originalIndex: index,
          truncatedStart,
          truncatedEnd,
          originalStartYear,
          originalEndYear
        });
      }
    });

    return {
      chartItems: items,
      yearRange: {
        min: minChartYear === Infinity ? -4000 : minChartYear,
        max: maxChartYear === -Infinity ? 100 : maxChartYear
      },
      ethnicities: ethnicityList
    };
    } catch (error) {
      console.error('Error processing chart data:', error);
      return {
        chartItems: [],
        yearRange: { min: -4000, max: 100 },
        ethnicities: []
      };
    }
  }, [events, persons, showEvents, showPeople, minYear, maxYear]);

  // Filter items based on selection
  const filteredItems = useMemo(() => {
    let items = chartItems;
    
    if (selectedType !== 'all') {
      items = items.filter(item => item.type === selectedType);
    }
    
    if (selectedEthnicity) {
      items = items.filter(item => 
        item.ethnicity === selectedEthnicity || 
        (item.type === 'ethnicity' && item.ethnicity === selectedEthnicity)
      );
    }
    
    return items;
  }, [chartItems, selectedType, selectedEthnicity]);

  // Group items by type for display and sort chronologically
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: ChartItem[] } = {
      ethnicity: [],
      person: [],
      event: []
    };
    
    filteredItems.forEach(item => {
      groups[item.type].push(item);
    });
    
    // Sort each group chronologically by start year
    Object.keys(groups).forEach(type => {
      groups[type].sort((a, b) => a.startYear - b.startYear);
    });
    
    return groups;
  }, [filteredItems]);

  const chartWidth = 1000;
  const marginLeft = 200;
  const marginRight = 50;
  const marginTop = 50;
  const marginBottom = 80;
  const plotWidth = chartWidth - marginLeft - marginRight;
  
  // Calculate total items for height
  const totalItems = Object.values(groupedItems).reduce((sum, items) => sum + items.length, 0);
  const itemHeight = 24;
  const sectionSpacing = 50; // Reduced from 60 to 50 
  const chartHeight = marginTop + marginBottom + (totalItems * itemHeight) + (Object.keys(groupedItems).length * sectionSpacing);

  // Calculate year scale
  const yearSpan = yearRange.max - yearRange.min;
  const getXPosition = (year: number) => {
    return marginLeft + ((year - yearRange.min) / yearSpan) * plotWidth;
  };

  // Calculate Y positions for each type with proper Gantt-style spacing
  const typeOrder = ['ethnicity', 'person', 'event'];
  const getYPosition = (type: string, index: number) => {
    let yOffset = marginTop;
    
    // Add space for previous sections
    for (const prevType of typeOrder) {
      if (prevType === type) break;
      yOffset += groupedItems[prevType].length * itemHeight + sectionSpacing;
    }
    
    // Add extra spacing after the section header
    return yOffset + 10 + index * itemHeight + itemHeight / 2;
  };

  // Generate tick marks for years
  const generateYearTicks = () => {
    const ticks = [];
    const tickCount = 10;
    const step = Math.ceil(yearSpan / tickCount);
    
    for (let year = Math.ceil(yearRange.min / step) * step; year <= yearRange.max; year += step) {
      ticks.push({
        year,
        x: getXPosition(year),
        label: year < 0 ? `${Math.abs(year)} BC` : `${year} AD`
      });
    }
    
    return ticks;
  };

  const yearTicks = generateYearTicks();

  // Safety check for required data and client-side rendering
  if (!isClient || !events || !persons || !timelinePeriods) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Biblical Timeline Gantt Chart
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Loading chart data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm" suppressHydrationWarning>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Biblical Timeline Gantt Chart
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Download Button */}
          <button
            onClick={handleDownloadChart}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Download chart as SVG"
          >
            📥 Download
          </button>
          
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as 'all' | 'person' | 'event' | 'ethnicity')}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="ethnicity">Ethnicities</option>
            <option value="person">People</option>
            <option value="event">Events</option>
          </select>

          {/* Ethnicity Filter */}
          <select
            value={selectedEthnicity || ''}
            onChange={(e) => setSelectedEthnicity(e.target.value || null)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Ethnicities</option>
            {ethnicities.filter(Boolean).map(ethnicity => (
              <option key={ethnicity} value={ethnicity}>{ethnicity}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <svg id="overlap-chart-svg" width={chartWidth} height={chartHeight} className="border border-gray-200 dark:border-gray-600 rounded">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />
          
          {/* Period background sections */}
          {timelinePeriods
            .map((period, index) => ({ period, index }))
            .filter(({ period }) => {
              try {
                if (!period?.dateRange) return false;
                const { startYear, endYear } = parseDateRange(period.dateRange);
                if (startYear === null || endYear === null) return false;
                
                // Check if period overlaps with current view
                if ((maxYear !== null && startYear > maxYear) || (minYear !== null && endYear < minYear)) {
                  return false;
                }
                
                const x1 = getXPosition(Math.max(startYear, yearRange.min));
                const x2 = getXPosition(Math.min(endYear, yearRange.max));
                const periodWidth = x2 - x1;
                
                return periodWidth > 0;
              } catch (error) {
                console.warn('Error processing period:', period, error);
                return false;
              }
            })
            .map(({ period, index }) => {
              try {
                const { startYear, endYear } = parseDateRange(period.dateRange);
                if (startYear === null || endYear === null) return null;
                
                const x1 = getXPosition(Math.max(startYear, yearRange.min));
                const x2 = getXPosition(Math.min(endYear, yearRange.max));
                const periodWidth = x2 - x1;
              
              // Use period colors matching the timeline
                
                return (
                  <g key={`period-${period.name}-${index}`}>
                    {/* Period background */}
                    <rect
                      x={x1}
                      y={marginTop - 20}
                      width={periodWidth}
                      height={chartHeight - marginTop - marginBottom + 40}
                      fill={PERIOD_BACKGROUND_COLORS[index % PERIOD_BACKGROUND_COLORS.length]}
                      stroke={PERIOD_BORDER_COLORS[index % PERIOD_BORDER_COLORS.length]}
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    
                  </g>
                );
              } catch (error) {
                console.warn('Error rendering period:', period, error);
                return null;
              }
            }).filter(Boolean)}
          
          {/* Year axis */}
          <line 
            x1={marginLeft} 
            y1={chartHeight - marginBottom} 
            x2={chartWidth - marginRight} 
            y2={chartHeight - marginBottom} 
            stroke="#374151" 
            strokeWidth="2"
          />
          
          {/* Year ticks and labels */}
          {yearTicks.map((tick, index) => (
            <g key={index}>
              <line
                x1={tick.x}
                y1={chartHeight - marginBottom}
                x2={tick.x}
                y2={chartHeight - marginBottom + 5}
                stroke="#374151"
                strokeWidth="1"
              />
              <text
                x={tick.x}
                y={chartHeight - marginBottom + 20}
                textAnchor="middle"
                className="text-xs fill-gray-600 dark:fill-gray-400"
                transform={`rotate(-45, ${tick.x}, ${chartHeight - marginBottom + 20})`}
              >
                {tick.label}
              </text>
            </g>
          ))}
          
          {/* Section headers */}
          {typeOrder.map((type, typeIndex) => {
            if (groupedItems[type].length === 0) return null;
            
            let yOffset = marginTop;
            for (let i = 0; i < typeIndex; i++) {
              yOffset += groupedItems[typeOrder[i]].length * itemHeight + sectionSpacing;
            }
            
            const getHeaderUrl = () => {
              if (!periodSlug) return null;
              if (type === 'person') return `/periods/${periodSlug}/people`;
              if (type === 'event') return `/periods/${periodSlug}/events`;
              if (type === 'ethnicity') return `/periods/${periodSlug}/regions`;
              return null;
            };

            const headerUrl = getHeaderUrl();

            return (
              <g key={type}>
                {/* Section background */}
                <rect
                  x={marginLeft - 190}
                  y={yOffset - 20}
                  width={190}
                  height={groupedItems[type].length * itemHeight + 30}
                  fill={isDarkMode ? "#374151" : "#f9fafb"}
                  stroke={isDarkMode ? "#6b7280" : "#e5e7eb"}
                  strokeWidth="1"
                  className={headerUrl ? "cursor-pointer hover:opacity-80" : ""}
                  onClick={headerUrl ? () => window.open(headerUrl, '_self') : undefined}
                />
                {/* Section title */}
                <text
                  x={marginLeft - 10}
                  y={yOffset}
                  textAnchor="end"
                  fill={isDarkMode ? "#f9fafb" : "#1f2937"}
                  fontSize="18"
                  fontWeight="bold"
                  className={headerUrl ? 'cursor-pointer hover:opacity-70' : ''}
                  onClick={headerUrl ? () => window.open(headerUrl, '_self') : undefined}
                >
                  {type === 'ethnicity' ? '🏛️ Ethnicities' : type === 'person' ? '👥 People' : '📅 Events'}
                </text>
                {/* Link indicator */}
                {headerUrl && (
                  <text
                    x={marginLeft - 195}
                    y={yOffset}
                    textAnchor="start"
                    fill="#3b82f6"
                    fontSize="14"
                    opacity="0.7"
                  >
                    →
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Grid lines for each row */}
          {Object.entries(groupedItems).map(([type, items]) =>
            items.map((item, index) => {
              const y = getYPosition(type, index);
              return (
                <line
                  key={`grid-${item.id}`}
                  x1={marginLeft}
                  y1={y + itemHeight / 2 - 12}
                  x2={chartWidth - marginRight}
                  y2={y + itemHeight / 2 - 12}
                  stroke="#f3f4f6"
                  strokeWidth="0.5"
                />
              );
            })
          )}

          {/* Chart items */}
          {Object.entries(groupedItems).map(([type, items]) =>
            items.map((item, index) => {
              const x1 = getXPosition(item.startYear);
              const x2 = item.endYear ? getXPosition(item.endYear) : x1;
              const y = getYPosition(type, index);
              const isRange = item.endYear !== null && item.endYear !== item.startYear;
              const barWidth = Math.max(x2 - x1, 3);
              
              const handleClick = () => {
                if (item.type === 'event' && onEventClick && item.data) {
                  onEventClick(item.data as BiblicalEvent);
                } else if (item.type === 'person' && onPersonClick && item.data) {
                  onPersonClick(item.data as BiblicalPerson);
                }
              };
              
              return (
                <g key={item.id} 
                   onClick={handleClick}
                   className={item.type !== 'ethnicity' ? 'cursor-pointer' : ''}>
                  {/* Item label */}
                  <foreignObject
                    x={marginLeft - 195}
                    y={y - 8}
                    width="180"
                    height="16"
                  >
                    <div
                      className="text-xs text-gray-600 dark:text-gray-400 text-right truncate leading-4"
                      style={{
                        width: '180px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </div>
                  </foreignObject>
                  
                  {isRange ? (
                    // Gantt-style bar for people lifespans and ethnicity periods
                    <>
                      <rect
                        x={x1}
                        y={y - 8}
                        width={barWidth}
                        height={16}
                        fill={item.color}
                        opacity={0.8}
                        rx={8}
                        stroke="#fff"
                        strokeWidth="1"
                        className={item.type !== 'ethnicity' ? 'hover:opacity-100' : ''}
                      />
                      
                      {/* Truncation indicators */}
                      {item.truncatedStart && (
                        <g>
                          {/* Jagged edge indicator at start */}
                          <path
                            d={`M${x1} ${y - 8} L${x1 + 6} ${y - 4} L${x1} ${y} L${x1 + 6} ${y + 4} L${x1} ${y + 8}`}
                            fill={item.color}
                            stroke="#fff"
                            strokeWidth="1"
                          />
                          {/* Arrow indicator */}
                          <path
                            d={`M${x1 - 8} ${y} L${x1 - 2} ${y - 3} L${x1 - 2} ${y + 3} Z`}
                            fill="#666"
                            opacity={0.7}
                          />
                        </g>
                      )}
                      
                      {item.truncatedEnd && (
                        <g>
                          {/* Jagged edge indicator at end */}
                          <path
                            d={`M${x2} ${y - 8} L${x2 - 6} ${y - 4} L${x2} ${y} L${x2 - 6} ${y + 4} L${x2} ${y + 8}`}
                            fill={item.color}
                            stroke="#fff"
                            strokeWidth="1"
                          />
                          {/* Arrow indicator */}
                          <path
                            d={`M${x2 + 8} ${y} L${x2 + 2} ${y - 3} L${x2 + 2} ${y + 3} Z`}
                            fill="#666"
                            opacity={0.7}
                          />
                        </g>
                      )}
                    </>
                  ) : (
                    // Diamond marker for events
                    <>
                      <rect
                        x={x1 - 4}
                        y={y - 4}
                        width={8}
                        height={8}
                        fill={item.color}
                        stroke="#fff"
                        strokeWidth={1}
                        transform={`rotate(45 ${x1} ${y})`}
                        className="hover:opacity-100"
                      />
                    </>
                  )}
                  
                  {/* Tooltip on hover */}
                  <title>
                    {item.name}
                    {item.ethnicity && ` (${item.ethnicity})`}
                    {isRange 
                      ? ` (${item.startYear < 0 ? Math.abs(item.startYear) + ' BC' : item.startYear + ' AD'} - ${item.endYear! < 0 ? Math.abs(item.endYear!) + ' BC' : item.endYear! + ' AD'})`
                      : ` (${item.startYear < 0 ? Math.abs(item.startYear) + ' BC' : item.startYear + ' AD'})`
                    }
                    {(item.truncatedStart || item.truncatedEnd) && (
                      `\n🔄 Truncated for focus - Full range: ${item.originalStartYear! < 0 ? Math.abs(item.originalStartYear!) + ' BC' : item.originalStartYear! + ' AD'} - ${item.originalEndYear! < 0 ? Math.abs(item.originalEndYear!) + ' BC' : item.originalEndYear! + ' AD'}`
                    )}
                    {item.type !== 'ethnicity' && '\nClick to view details'}
                  </title>
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-6 h-4 bg-blue-500 rounded mr-2 opacity-80 border border-white"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">👥 People (lifespans)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 mr-2 transform rotate-45 border border-white"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">📅 Events (milestones)</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-4 bg-green-500 rounded mr-2 opacity-80 border border-white"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">🏛️ Ethnicities (periods)</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          • Gantt-style chart • Hover for details • Filter by type or ethnicity • ⚡ Jagged edges = truncated ranges
        </div>
      </div>
    </div>
  );
}