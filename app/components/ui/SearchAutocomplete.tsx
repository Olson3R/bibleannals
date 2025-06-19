'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { BiblicalPerson, BiblicalEvent, BiblicalRegion, TimelinePeriod } from '../../types/biblical';

interface SearchSuggestion {
  id: string;
  name: string;
  type: 'person' | 'event' | 'region' | 'period' | 'tag';
  category?: string;
  score: number;
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: SearchSuggestion) => void;
  persons: BiblicalPerson[];
  events: BiblicalEvent[];
  regions: BiblicalRegion[];
  periods: TimelinePeriod[];
  placeholder?: string;
  className?: string;
  maxSuggestions?: number;
}

// Calculate relevance score for autocomplete
function calculateAutocompleteRelevance(text: string, searchTerm: string, isExactMatch: boolean = false): number {
  if (!searchTerm.trim()) return 0;
  
  const textLower = text.toLowerCase();
  const searchLower = searchTerm.toLowerCase();
  
  // Exact match gets highest score
  if (textLower === searchLower) return isExactMatch ? 100 : 80;
  
  // Starts with search term gets high score
  if (textLower.startsWith(searchLower)) return isExactMatch ? 90 : 70;
  
  // Contains search term gets medium score
  if (textLower.includes(searchLower)) return isExactMatch ? 60 : 40;
  
  // Word boundary matches get bonus
  const words = textLower.split(' ');
  for (const word of words) {
    if (word.startsWith(searchLower)) return isExactMatch ? 70 : 50;
  }
  
  return 0;
}

export function SearchAutocomplete({
  value,
  onChange,
  onSelect,
  persons,
  events,
  regions,
  periods,
  placeholder = "Search...",
  className = "",
  maxSuggestions = 10
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef(false);

  // Extract all unique tags
  const allTags = useCallback(() => {
    const tagSet = new Set<string>();
    
    persons.forEach(person => {
      person.tags?.forEach(tag => {
        if (tag !== 'biblical') tagSet.add(tag);
      });
    });
    
    events.forEach(event => {
      event.tags?.forEach(tag => {
        if (tag !== 'biblical') tagSet.add(tag);
      });
    });
    
    return Array.from(tagSet).sort();
  }, [persons, events]);

  // Generate suggestions based on search term
  const generateSuggestions = useCallback((searchTerm: string): SearchSuggestion[] => {
    if (!searchTerm.trim()) return [];
    
    const suggestions: SearchSuggestion[] = [];
    
    // Search persons
    persons.forEach(person => {
      let maxScore = calculateAutocompleteRelevance(person.name, searchTerm, true);
      
      // Check alternative names
      if (person.names) {
        for (const name of person.names) {
          const nameScore = calculateAutocompleteRelevance(name.name, searchTerm, true);
          maxScore = Math.max(maxScore, nameScore);
        }
      }
      
      if (maxScore > 0) {
        suggestions.push({
          id: person.id,
          name: person.name,
          type: 'person',
          category: person.ethnicity || 'Person',
          score: maxScore
        });
      }
    });
    
    // Search events
    events.forEach(event => {
      let maxScore = calculateAutocompleteRelevance(event.name, searchTerm, true);
      maxScore = Math.max(maxScore, calculateAutocompleteRelevance(event.description, searchTerm, false));
      
      if (maxScore > 0) {
        suggestions.push({
          id: event.id,
          name: event.name,
          type: 'event',
          category: event.date,
          score: maxScore
        });
      }
    });
    
    // Search regions
    regions.forEach(region => {
      let maxScore = calculateAutocompleteRelevance(region.name, searchTerm, true);
      maxScore = Math.max(maxScore, calculateAutocompleteRelevance(region.description, searchTerm, false));
      
      if (maxScore > 0) {
        suggestions.push({
          id: region.id,
          name: region.name,
          type: 'region',
          category: region.time_period,
          score: maxScore
        });
      }
    });
    
    // Search periods
    periods.forEach(period => {
      let maxScore = calculateAutocompleteRelevance(period.name, searchTerm, true);
      maxScore = Math.max(maxScore, calculateAutocompleteRelevance(period.description, searchTerm, false));
      
      if (maxScore > 0) {
        suggestions.push({
          id: period.slug,
          name: period.name,
          type: 'period',
          category: period.dateRange,
          score: maxScore
        });
      }
    });
    
    // Search tags
    const tags = allTags();
    tags.forEach(tag => {
      const score = calculateAutocompleteRelevance(tag, searchTerm, true);
      if (score > 0) {
        suggestions.push({
          id: `tag:${tag}`,
          name: tag,
          type: 'tag',
          category: 'Tag',
          score: score
        });
      }
    });
    
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions);
  }, [persons, events, regions, periods, allTags, maxSuggestions]);

  // Update suggestions when search term changes
  useEffect(() => {
    const newSuggestions = generateSuggestions(value);
    setSuggestions(newSuggestions);
    setSelectedIndex(-1);
    
    // Don't show suggestions if user just selected something
    if (justSelectedRef.current) {
      setIsOpen(false);
    } else {
      setIsOpen(newSuggestions.length > 0 && value.length > 0);
    }
  }, [value, generateSuggestions]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    justSelectedRef.current = true;
    if (suggestion.type === 'tag') {
      onChange(`tag:${suggestion.name}`);
    } else {
      onChange(suggestion.name);
    }
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect?.(suggestion);
  };

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0 && value.length > 0 && !justSelectedRef.current) {
      setIsOpen(true);
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon for suggestion type
  const getTypeIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'person': return '👤';
      case 'event': return '📅';
      case 'region': return '🗺️';
      case 'period': return '📜';
      case 'tag': return '🏷️';
      default: return '📄';
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // If user is typing (not programmatic change) and has modified the selected value
    if (justSelectedRef.current && newValue !== value) {
      justSelectedRef.current = false;
    }
    
    onChange(newValue);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`w-full px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        aria-describedby="search-description"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
        aria-controls="suggestions-listbox"
        role="combobox"
      />
      
      {value && (
        <button
          onClick={() => {
            onChange('');
            setIsOpen(false);
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
          aria-label="Clear search"
          title="Clear search"
        >
          ✕
        </button>
      )}

      {isOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id="suggestions-listbox"
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              id={`suggestion-${index}`}
              className={`px-3 py-2 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/30' : ''
              }`}
              onClick={() => handleSuggestionSelect(suggestion)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{getTypeIcon(suggestion.type)}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {suggestion.name}
                    </div>
                    {suggestion.category && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {suggestion.category}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                  {suggestion.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}