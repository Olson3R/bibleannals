import { NavLink } from './NavLink';
import type { BiblicalPerson } from '../../types/biblical';

interface PersonCardProps {
  person: BiblicalPerson;
  className?: string;
  showDates?: boolean;
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

export function PersonCard({ person, className = '', showDates = false, periodSlug }: PersonCardProps) {
  const colorScheme = getPersonColorScheme(person);

  const href = periodSlug 
    ? `/people/${person.id}?from=period&period=${periodSlug}`
    : `/people/${person.id}`;

  return (
    <NavLink
      href={href}
      className={`block px-3 py-3 sm:py-2 rounded-lg border ${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} hover:shadow-md transition-shadow min-h-[44px] ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">{person.name}</span>
          {showDates && person.birth_date && (
            <div className="text-xs opacity-75 mt-1">{person.birth_date}</div>
          )}
        </div>
        <div className="flex items-center space-x-1">
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