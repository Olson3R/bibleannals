import { NavLink } from './NavLink';
import type { BiblicalEvent } from '../../types/biblical';

interface EventCardProps {
  event: BiblicalEvent;
  className?: string;
  showDescription?: boolean;
  locationName?: string; // Optional override for location display
  periodSlug?: string;
}

export function EventCard({ event, className = '', showDescription = true, locationName, periodSlug }: EventCardProps) {
  const displayLocation = locationName || event.location;
  
  const href = periodSlug 
    ? `/events/${event.id}?from=period&period=${periodSlug}`
    : `/events/${event.id}`;
  
  return (
    <NavLink
      href={href}
      className={`block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md transition-all ${className}`}
    >
      <div className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600">{event.name}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.date} • {displayLocation}</div>
      {showDescription && (
        <div className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">{event.description}</div>
      )}
    </NavLink>
  );
}