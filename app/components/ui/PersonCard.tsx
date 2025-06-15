import Link from 'next/link';
import type { BiblicalPerson } from '../../types/biblical';

interface PersonCardProps {
  person: BiblicalPerson;
  className?: string;
  showDates?: boolean;
}

// Color scheme function for person cards
export function getPersonColorScheme(person: BiblicalPerson) {
  if (['GOD_FATHER', 'JESUS'].includes(person.id)) {
    return { bg: 'bg-yellow-200', border: 'border-yellow-400', text: 'text-yellow-800' };
  }
  if (['ABRAHAM', 'ISAAC', 'JACOB'].includes(person.id)) {
    return { bg: 'bg-purple-200', border: 'border-purple-400', text: 'text-purple-800' };
  }
  if (['DAVID', 'SOLOMON'].includes(person.id) || person.name.includes('King')) {
    return { bg: 'bg-red-200', border: 'border-red-400', text: 'text-red-800' };
  }
  if (['MOSES', 'ELIJAH', 'ELISHA', 'ISAIAH', 'JEREMIAH', 'DANIEL'].includes(person.id)) {
    return { bg: 'bg-green-200', border: 'border-green-400', text: 'text-green-800' };
  }
  return { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' };
}

export function PersonCard({ person, className = '', showDates = false }: PersonCardProps) {
  const colorScheme = getPersonColorScheme(person);

  return (
    <Link
      href={`/people/${person.id}`}
      className={`block px-3 py-2 rounded-lg border ${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} hover:shadow-md transition-shadow ${className}`}
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
    </Link>
  );
}