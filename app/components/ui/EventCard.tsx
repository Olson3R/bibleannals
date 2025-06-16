import Link from 'next/link';
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
    <Link
      href={href}
      className={`block p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:shadow-md transition-all ${className}`}
    >
      <div className="font-medium text-gray-800 hover:text-blue-600">{event.name}</div>
      <div className="text-sm text-gray-600 mt-1">{event.date} • {displayLocation}</div>
      {showDescription && (
        <div className="text-sm text-gray-700 mt-2 line-clamp-2">{event.description}</div>
      )}
    </Link>
  );
}