import { NavLink } from './NavLink';
import type { BiblicalEvent } from '../../types/biblical';

interface EventCardProps {
  event: BiblicalEvent;
  className?: string;
  showDescription?: boolean;
  showTags?: boolean;
  maxTags?: number;
  locationName?: string; // Optional override for location display
  periodSlug?: string;
}

export function EventCard({ event, className = '', showDescription = true, showTags = false, maxTags = 3, locationName, periodSlug }: EventCardProps) {
  const displayLocation = locationName || event.location;
  
  const href = periodSlug 
    ? `/events/${event.id}?from=period&period=${periodSlug}`
    : `/events/${event.id}`;

  // Filter out 'biblical' tag and limit display
  const displayTags = event.tags?.filter(tag => tag !== 'biblical').slice(0, maxTags) || [];
  
  return (
    <NavLink
      href={href}
      className={`block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md transition-all ${className}`}
    >
      <div className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600">{event.name}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        <span title={event.date_source || 'Date source not specified'}>{event.date}</span> • {displayLocation}
      </div>
      {showDescription && (
        <div className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">{event.description}</div>
      )}
      {showTags && displayTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {displayTags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
            >
              {tag}
            </span>
          ))}
          {event.tags && event.tags.length > maxTags + 1 && (
            <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
              +{event.tags.length - maxTags - 1}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
}