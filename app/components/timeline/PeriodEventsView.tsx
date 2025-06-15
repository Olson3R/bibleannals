// Period events view component
'use client';

import { useSearchParams } from 'next/navigation';
import type { BiblicalEvent, BiblicalPerson, TimelinePeriod } from '../../types/biblical';

interface PeriodEventsViewProps {
  events: BiblicalEvent[];
  timelinePeriods: TimelinePeriod[];
  getPersonById: (id: string) => BiblicalPerson | undefined;
  showEventDetail: (event: BiblicalEvent) => void;
  onBackClick: () => void;
}

export function PeriodEventsView({ 
  events, 
  timelinePeriods, 
  getPersonById, 
  showEventDetail,
  onBackClick
}: PeriodEventsViewProps) {
  const searchParams = useSearchParams();
  
  const periodName = searchParams.get('period');
  const period = timelinePeriods.find(p => p.name === periodName);
  
  if (!period) return <div>Period not found</div>;
  
  // Filter events for this period
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
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{period.name} - Events</h2>
          <p className="text-gray-600">{period.dateRange}</p>
        </div>
        <button
          onClick={onBackClick}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Timeline
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {periodEvents.map(event => (
          <div key={event.id} className="p-4 border border-gray-300 rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => showEventDetail(event)}>
            <h3 className="font-semibold text-gray-800 hover:text-blue-600">{event.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{event.date}</p>
            <p className="text-sm text-gray-700 mt-2">{event.description}</p>
            {event.participants.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {event.participants.slice(0, 3).map(participantId => {
                    const person = getPersonById(participantId);
                    return person ? (
                      <span key={participantId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {person.name}
                      </span>
                    ) : null;
                  })}
                  {event.participants.length > 3 && (
                    <span className="text-xs text-gray-500">+{event.participants.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {periodEvents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No events found for this period.</p>
        </div>
      )}
    </div>
  );
}