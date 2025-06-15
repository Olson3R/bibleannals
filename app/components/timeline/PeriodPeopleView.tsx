// Period people view component
'use client';

import { useSearchParams } from 'next/navigation';
import type { BiblicalEvent, BiblicalPerson, TimelinePeriod } from '../../types/biblical';

interface PeriodPeopleViewProps {
  events: BiblicalEvent[];
  timelinePeriods: TimelinePeriod[];
  getPersonById: (id: string) => BiblicalPerson | undefined;
  showPersonDetail: (person: BiblicalPerson) => void;
  onBackClick: () => void;
}

export function PeriodPeopleView({ 
  events, 
  timelinePeriods, 
  getPersonById, 
  showPersonDetail,
  onBackClick
}: PeriodPeopleViewProps) {
  const searchParams = useSearchParams();
  
  const periodName = searchParams.get('period');
  const period = timelinePeriods.find(p => p.name === periodName);
  
  if (!period) return <div>Period not found</div>;
  
  // Get events for this period to find participants
  const periodEvents = events.filter(event => {
    let eventYear = parseInt(event.date.replace(/[^\d-]/g, ''));
    const isAD = event.date.includes('AD');
    if (isAD) eventYear = -eventYear;
    
    const [startStr, endStr] = period.dateRange.split('-');
    let startYear = parseInt(startStr.replace(/[^\d]/g, ''));
    let endYear = parseInt(endStr.replace(/[^\d]/g, ''));
    
    if (startStr.includes('BC')) startYear = Math.abs(startYear);
    if (endStr.includes('BC')) endYear = Math.abs(endYear);
    if (startStr.includes('AD')) startYear = -Math.abs(startYear);
    if (endStr.includes('AD')) endYear = -Math.abs(endYear);
    
    if (period.dateRange === "6 BC-60 AD") {
      const eventYearOriginal = parseInt(event.date.replace(/[^\d-]/g, ''));
      if (event.date.includes('BC')) {
        return eventYearOriginal <= 6;
      } else if (event.date.includes('AD')) {
        return eventYearOriginal <= 60;
      }
    }
    
    return eventYear >= endYear && eventYear <= startYear;
  });
  
  // Get all participants
  const allParticipants = new Set<string>();
  periodEvents.forEach(event => {
    event.participants.forEach(p => allParticipants.add(p));
  });
  
  const periodPeople = Array.from(allParticipants).map(id => getPersonById(id)).filter((p): p is BiblicalPerson => p !== undefined);
  
  const getColorScheme = (person: BiblicalPerson) => {
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
    if (person.id.includes('APOSTLE') || ['PETER', 'PAUL', 'JOHN_THE_APOSTLE'].includes(person.id)) {
      return { bg: 'bg-indigo-200', border: 'border-indigo-400', text: 'text-indigo-800' };
    }
    if (person.gender === 'female') {
      return { bg: 'bg-pink-200', border: 'border-pink-400', text: 'text-pink-800' };
    }
    return { bg: 'bg-blue-200', border: 'border-blue-400', text: 'text-blue-800' };
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{period.name} - People</h2>
          <p className="text-gray-600">{period.dateRange}</p>
        </div>
        <button
          onClick={onBackClick}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Timeline
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {periodPeople.map(person => {
          const colors = getColorScheme(person);
          
          return (
            <div key={person.id} className="p-3 border border-gray-300 rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => showPersonDetail(person)}>
              <div className={`px-2 py-1 rounded border ${colors.bg} ${colors.border}`}>
                <div className="flex items-center">
                  <span className="font-medium text-gray-800 text-sm">{person.name}</span>
                  {person.created && <span className="ml-1 text-orange-600" title="Created by God">⭐</span>}
                  {person.translated && <span className="ml-1 text-cyan-600" title="Translated">↗️</span>}
                </div>
              </div>
              {person.birth_date && (
                <div className="text-xs text-gray-600 mt-1">{person.birth_date}</div>
              )}
            </div>
          );
        })}
      </div>
      
      {periodPeople.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No people found for this period.</p>
        </div>
      )}
    </div>
  );
}