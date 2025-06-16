import Link from 'next/link';
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
    <Link
      href={href}
      className={`block p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:shadow-md transition-all ${className}`}
    >
      <div className="font-medium text-gray-800 hover:text-blue-600">{region.name}</div>
      <div className="text-sm text-gray-600 mt-1">{region.location}</div>
      {showDescription && (
        <div className="text-sm text-gray-700 mt-2 line-clamp-2">{region.description}</div>
      )}
    </Link>
  );
}