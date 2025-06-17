import { NavLink } from './NavLink';
import type { BiblicalRegion } from '../../types/biblical';

interface RegionCardProps {
  region: BiblicalRegion;
  className?: string;
  showDescription?: boolean;
  periodSlug?: string;
}

export function RegionCard({ region, className = '', showDescription = true, periodSlug }: RegionCardProps) {
  const href = periodSlug 
    ? `/regions/${region.id}?from=period&period=${periodSlug}`
    : `/regions/${region.id}`;
    
  return (
    <NavLink
      href={href}
      className={`block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md transition-all ${className}`}
    >
      <div className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600">{region.name}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{region.location}</div>
      {showDescription && (
        <div className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">{region.description}</div>
      )}
    </NavLink>
  );
}