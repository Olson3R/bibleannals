import { NavLink } from './NavLink';
import type { BiblicalPerson } from '../../types/biblical';

interface PersonCardProps {
  person: BiblicalPerson;
  className?: string;
  showDates?: boolean;
  showTags?: boolean;
  maxTags?: number;
  periodSlug?: string;
}

// Color scheme function for person cards
export function getPersonColorScheme(person: BiblicalPerson) {
  if (['GOD_FATHER', 'JESUS'].includes(person.id)) {
    return { bg: 'bg-yellow-200 dark:bg-yellow-900', border: 'border-yellow-400 dark:border-yellow-600', text: 'text-yellow-800 dark:text-yellow-200' };
  }
  if (['ABRAHAM', 'ISAAC', 'JACOB'].includes(person.id)) {
    return { bg: 'bg-purple-200 dark:bg-purple-900', border: 'border-purple-400 dark:border-purple-600', text: 'text-purple-800 dark:text-purple-200' };
  }
  if (['DAVID', 'SOLOMON'].includes(person.id) || person.name.includes('King')) {
    return { bg: 'bg-red-200 dark:bg-red-900', border: 'border-red-400 dark:border-red-600', text: 'text-red-800 dark:text-red-200' };
  }
  if (['MOSES', 'ELIJAH', 'ELISHA', 'ISAIAH', 'JEREMIAH', 'DANIEL'].includes(person.id)) {
    return { bg: 'bg-green-200 dark:bg-green-900', border: 'border-green-400 dark:border-green-600', text: 'text-green-800 dark:text-green-200' };
  }
  return { bg: 'bg-blue-100 dark:bg-blue-900', border: 'border-blue-300 dark:border-blue-600', text: 'text-blue-800 dark:text-blue-200' };
}

export function PersonCard({ person, className = '', showDates = false, showTags = false, maxTags = 3, periodSlug }: PersonCardProps) {
  const colorScheme = getPersonColorScheme(person);

  const href = periodSlug 
    ? `/people/${person.id}?from=period&period=${periodSlug}`
    : `/people/${person.id}`;

  // Filter out 'biblical' tag and limit display
  const displayTags = person.tags?.filter(tag => tag !== 'biblical').slice(0, maxTags) || [];

  return (
    <NavLink
      href={href}
      className={`block px-3 py-3 sm:py-2 rounded-lg border ${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} hover:shadow-md transition-shadow min-h-[44px] ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <span className="font-medium">{person.name}</span>
          {showDates && person.birth_date && (
            <div className="text-xs opacity-75 mt-1" title={person.birth_date_source || 'Date source not specified'}>
              {person.birth_date}
            </div>
          )}
          {showTags && displayTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {displayTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-1.5 py-0.5 text-xs bg-white bg-opacity-60 dark:bg-black dark:bg-opacity-30 rounded text-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
              {person.tags && person.tags.length > maxTags + 1 && (
                <span className="px-1.5 py-0.5 text-xs bg-white bg-opacity-60 dark:bg-black dark:bg-opacity-30 rounded text-gray-500 dark:text-gray-400">
                  +{person.tags.length - maxTags - 1}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1 ml-2">
          {person.created && (
            <span className="text-orange-600" title="Created by God">⭐</span>
          )}
          {person.translated && (
            <span className="text-cyan-600" title="Translated">↗️</span>
          )}
        </div>
      </div>
    </NavLink>
  );
}