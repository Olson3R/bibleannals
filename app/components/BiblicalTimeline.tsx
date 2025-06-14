'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface BiblicalPerson {
  id: string;
  name: string;
  names?: { name: string; reference: string }[];
  gender?: string;
  ethnicity?: string;
  age?: string;
  birth_date?: string;
  death_date?: string;
  parents?: string[];
  spouses?: string[];
  references?: string[];
  created?: boolean;
  translated?: boolean;
  foster_father?: string;
}

interface BiblicalEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  participants: string[];
  references: string[];
}

interface BiblicalRegion {
  id: string;
  name: string;
  description: string;
  location: string;
  time_period: string;
  estimated_dates: string;
  notable_people: string[];
}

// Helper function to convert KJV references to bible.com URLs
function getBibleUrl(reference: string): string {
  if (!reference) return '';
  
  // Convert reference like "GEN.1.1.KJV" to bible.com format
  const cleanRef = reference.replace('.KJV', '');
  const parts = cleanRef.split('.');
  
  if (parts.length >= 3) {
    const book = parts[0];
    const chapter = parts[1];
    const verse = parts[2];
    
    // Use the abbreviation directly - bible.com can handle them
    return `https://www.bible.com/bible/1/${book}.${chapter}.${verse}`;
  }
  
  return '';
}

// Helper function to create Bible study links for regions
function getRegionStudyUrl(regionName: string): string {
  // Create a search URL for the region on bible.com
  const searchTerm = encodeURIComponent(regionName);
  return `https://www.bible.com/search/bible?q=${searchTerm}`;
}




function PersonDetails({ person, allPersons, onPersonClick, onBackClick }: {
  person: BiblicalPerson;
  allPersons: BiblicalPerson[];
  onPersonClick: (person: BiblicalPerson) => void;
  onBackClick?: () => void;
}) {
  const parents = person.parents?.map(id => allPersons.find(p => p.id === id)).filter((p): p is BiblicalPerson => p !== undefined) || [];
  const children = allPersons.filter(p => p.parents?.includes(person.id));
  const spouses = person.spouses?.map(id => allPersons.find(p => p.id === id)).filter((p): p is BiblicalPerson => p !== undefined) || [];

  // Color scheme function for family relations
  const getPersonColorScheme = (person: BiblicalPerson) => {
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
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      {onBackClick && (
        <button
          onClick={onBackClick}
          className="mb-4 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          ← Back
        </button>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-gray-600">Name:</span>
              <span className="ml-2 text-gray-800">{person.name}</span>
              {person.created && <span className="ml-2 text-orange-600" title="Created by God">⭐</span>}
              {person.translated && <span className="ml-2 text-cyan-600" title="Translated">↗️</span>}
            </div>
            
            {person.names && person.names.length > 0 && (
              <div>
                <span className="font-semibold text-gray-600">Other Names:</span>
                <div className="ml-2 space-y-1">
                  {person.names.map((name, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="text-gray-800">{name.name}</span>
                      {name.reference && (
                        <span className="text-gray-500 ml-1">({name.reference})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {person.gender && (
              <div>
                <span className="font-semibold text-gray-600">Gender:</span>
                <span className="ml-2 text-gray-800 capitalize">{person.gender}</span>
              </div>
            )}
            
            {person.ethnicity && (
              <div>
                <span className="font-semibold text-gray-600">Ethnicity:</span>
                <span className="ml-2 text-gray-800">{person.ethnicity}</span>
              </div>
            )}
            
            {person.birth_date && (
              <div>
                <span className="font-semibold text-gray-600">Birth:</span>
                <span className="ml-2 text-gray-800">{person.birth_date}</span>
              </div>
            )}
            
            {person.death_date && (
              <div>
                <span className="font-semibold text-gray-600">Death:</span>
                <span className="ml-2 text-gray-800">{person.death_date}</span>
              </div>
            )}
            
            {person.age && (
              <div>
                <span className="font-semibold text-gray-600">Age:</span>
                <span className="ml-2 text-gray-800">{person.age}</span>
              </div>
            )}
          </div>
        </div>

        {/* Family Relations */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Family Relations</h3>
          <div className="space-y-4">
            {parents.length > 0 && (
              <div>
                <span className="font-semibold text-gray-600">Parents:</span>
                <div className="ml-2 space-y-1">
                  {parents.map(parent => {
                    const colors = getPersonColorScheme(parent);
                    return (
                      <button
                        key={parent.id}
                        onClick={() => onPersonClick(parent)}
                        className={`px-2 py-1 rounded border text-sm font-medium transition-all duration-200 hover:shadow-md ${colors.bg} ${colors.border} ${colors.text}`}
                      >
                        {parent.name}
                        {parent.created && <span className="ml-1 text-orange-600">⭐</span>}
                        {parent.translated && <span className="ml-1 text-cyan-600">↗️</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {spouses.length > 0 && (
              <div>
                <span className="font-semibold text-gray-600">Spouses:</span>
                <div className="ml-2 space-y-1">
                  {spouses.map(spouse => {
                    const colors = getPersonColorScheme(spouse);
                    return (
                      <button
                        key={spouse.id}
                        onClick={() => onPersonClick(spouse)}
                        className={`px-2 py-1 rounded border text-sm font-medium transition-all duration-200 hover:shadow-md ${colors.bg} ${colors.border} ${colors.text}`}
                      >
                        {spouse.name}
                        {spouse.created && <span className="ml-1 text-orange-600">⭐</span>}
                        {spouse.translated && <span className="ml-1 text-cyan-600">↗️</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {children.length > 0 && (
              <div>
                <span className="font-semibold text-gray-600">Children:</span>
                <div className="ml-2 space-y-1 flex flex-wrap gap-1">
                  {children.slice(0, 10).map(child => {
                    const colors = getPersonColorScheme(child);
                    return (
                      <button
                        key={child.id}
                        onClick={() => onPersonClick(child)}
                        className={`px-2 py-1 rounded border text-sm font-medium transition-all duration-200 hover:shadow-md ${colors.bg} ${colors.border} ${colors.text}`}
                      >
                        {child.name}
                        {child.created && <span className="ml-1 text-orange-600">⭐</span>}
                        {child.translated && <span className="ml-1 text-cyan-600">↗️</span>}
                      </button>
                    );
                  })}
                  {children.length > 10 && (
                    <div className="text-sm text-gray-500 self-center">+{children.length - 10} more children</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Biblical References */}
      {person.references && person.references.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Biblical References</h3>
          <div className="flex flex-wrap gap-2">
            {person.references.map((ref, index) => (
              <a
                key={index}
                href={getBibleUrl(ref)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                {ref.replace('.KJV', '')}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PersonCard({ person, searchParams, router }: { 
  person: BiblicalPerson; 
  searchParams: URLSearchParams;
  router: AppRouterInstance;
}) {
  const selectedPersonId = searchParams.get('selected')?.split(':')[1];
  const isSelected = selectedPersonId === person.id;
  
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
  
  const colors = getColorScheme(person);
  
  const handlePersonClick = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('selected', `person:${person.id}`);
    router.push(`/?${newSearchParams.toString()}`, { scroll: false });
  };
  
  return (
    <div className="inline-block mb-2">
      <div 
        className={`px-2 py-1 rounded border cursor-pointer transition-all duration-200 hover:shadow-md text-xs ${
          isSelected 
            ? 'bg-blue-600 border-blue-800 shadow-lg ring-2 ring-blue-300' 
            : `${colors.bg} ${colors.border}`
        }`}
        onClick={handlePersonClick}
        data-person-id={person.id}
      >
        <div className="flex items-center">
          <span className={`font-medium ${
            isSelected ? 'text-white font-bold' : 'text-gray-800'
          }`}>{person.name}</span>
          {person.created && <span className={`ml-1 ${
            isSelected ? 'text-yellow-300' : 'text-orange-600'
          }`} title="Created by God">⭐</span>}
          {person.translated && <span className={`ml-1 ${
            isSelected ? 'text-cyan-300' : 'text-cyan-600'
          }`} title="Translated (taken up without death)">↗️</span>}
        </div>
      </div>
    </div>
  );
}


function PeriodEventsView({ 
  periodName, 
  events, 
  onEventClick, 
  onBackClick 
}: {
  periodName: string;
  events: BiblicalEvent[];
  onEventClick: (event: BiblicalEvent) => void;
  onBackClick: () => void;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Events in {periodName}</h2>
        <button
          onClick={onBackClick}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          ← Back to Timeline
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map(event => (
          <div 
            key={event.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onEventClick(event)}
          >
            <h3 className="font-semibold text-gray-800 mb-2">{event.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{event.date}</p>
            <p className="text-sm text-gray-700 mb-2">{event.description}</p>
            <p className="text-xs text-gray-500">{event.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PeriodPeopleView({ 
  periodName, 
  people, 
  onPersonClick, 
  onBackClick 
}: {
  periodName: string;
  people: BiblicalPerson[];
  onPersonClick: (person: BiblicalPerson) => void;
  onBackClick: () => void;
}) {
  const getPersonColorScheme = (person: BiblicalPerson) => {
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
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">People in {periodName}</h2>
        <button
          onClick={onBackClick}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          ← Back to Timeline
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {people.map(person => {
          const colors = getPersonColorScheme(person);
          return (
            <div 
              key={person.id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${colors.bg} ${colors.border}`}
              onClick={() => onPersonClick(person)}
            >
              <div className="text-center">
                <div className="font-semibold text-sm text-gray-800 mb-1">
                  {person.name}
                  {person.created && <span className="ml-1 text-orange-600" title="Created by God">⭐</span>}
                  {person.translated && <span className="ml-1 text-cyan-600" title="Translated">↗️</span>}
                </div>
                {person.birth_date && (
                  <div className="text-xs text-gray-600">Born: {person.birth_date}</div>
                )}
                {person.age && (
                  <div className="text-xs text-gray-600">Age: {person.age}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PeriodRegionsView({ 
  periodName, 
  regions, 
  onRegionClick, 
  onBackClick 
}: {
  periodName: string;
  regions: BiblicalRegion[];
  onRegionClick: (region: BiblicalRegion) => void;
  onBackClick: () => void;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Regions in {periodName}</h2>
        <button
          onClick={onBackClick}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          ← Back to Timeline
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regions.map(region => (
          <div 
            key={region.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onRegionClick(region)}
          >
            <h3 className="font-semibold text-gray-800 mb-2">{region.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{region.location}</p>
            <p className="text-sm text-gray-700 mb-2">{region.description}</p>
            <p className="text-xs text-gray-500">{region.time_period}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventDetailView({ 
  event, 
  onBackClick,
  getPersonById
}: {
  event: BiblicalEvent;
  onBackClick: () => void;
  getPersonById: (id: string) => BiblicalPerson | undefined;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Event Details</h2>
        <button
          onClick={onBackClick}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          ← Back
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{event.name}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-gray-600">Date:</span>
            <span className="ml-2 text-gray-800">{event.date}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Location:</span>
            <span className="ml-2 text-gray-800">{event.location}</span>
          </div>
        </div>
        
        <div>
          <span className="font-semibold text-gray-600">Description:</span>
          <p className="mt-2 text-gray-800">{event.description}</p>
        </div>
        
        {event.participants.length > 0 && (
          <div>
            <span className="font-semibold text-gray-600">Participants:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {event.participants.map(participantId => {
                const person = getPersonById(participantId);
                return person ? (
                  <span key={participantId} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {person.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
        
        {event.references.length > 0 && (
          <div>
            <span className="font-semibold text-gray-600">Biblical References:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {event.references.map((ref, index) => (
                <a
                  key={index}
                  href={getBibleUrl(ref)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {ref.replace('.KJV', '')}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RegionDetailView({ 
  region, 
  onBackClick,
  getPersonById
}: {
  region: BiblicalRegion;
  onBackClick: () => void;
  getPersonById: (id: string) => BiblicalPerson | undefined;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Region Details</h2>
        <button
          onClick={onBackClick}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          ← Back
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{region.name}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-gray-600">Location:</span>
            <span className="ml-2 text-gray-800">{region.location}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Time Period:</span>
            <span className="ml-2 text-gray-800">{region.time_period}</span>
          </div>
        </div>
        
        <div>
          <span className="font-semibold text-gray-600">Estimated Dates:</span>
          <span className="ml-2 text-gray-800">{region.estimated_dates}</span>
        </div>
        
        <div>
          <span className="font-semibold text-gray-600">Description:</span>
          <p className="mt-2 text-gray-800">{region.description}</p>
        </div>
        
        {region.notable_people.length > 0 && (
          <div>
            <span className="font-semibold text-gray-600">Notable People:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {region.notable_people.map(personId => {
                const person = getPersonById(personId);
                return person ? (
                  <span key={personId} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {person.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
        
        <div>
          <a 
            href={getRegionStudyUrl(region.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📖 Study this region in the Bible
          </a>
        </div>
      </div>
    </div>
  );
}

// Utility function to check if element is visible in viewport
function isElementVisible(element: Element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function TimelinePeriodCard({ 
  period, 
  events, 
  regions, 
  getPersonById, 
  searchParams,
  router,
  showEvents,
  showPeople,
  showRegions,
  onPersonClick,
  showPeriodEvents,
  showPeriodPeople,
  showPeriodRegions
}: { 
  period: { name: string; dateRange: string; color: string; description: string };
  events: BiblicalEvent[];
  regions: BiblicalRegion[];
  getPersonById: (id: string) => BiblicalPerson | undefined;
  searchParams: URLSearchParams;
  router: AppRouterInstance;
  showEvents: boolean;
  showPeople: boolean;
  showRegions: boolean;
  onPersonClick: (person: BiblicalPerson) => void;
  showPeriodEvents: (periodName: string) => void;
  showPeriodPeople: (periodName: string) => void;
  showPeriodRegions: (periodName: string) => void;
}) {
  const periodSlug = period.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const periodEvents = events.filter(event => {
    // Parse event date
    let eventYear = parseInt(event.date.replace(/[^\d-]/g, ''));
    const isAD = event.date.includes('AD');
    if (isAD) eventYear = -eventYear; // Convert AD to negative for comparison
    
    // Parse period range
    const [startStr, endStr] = period.dateRange.split('-');
    let startYear = parseInt(startStr.replace(/[^\d]/g, ''));
    let endYear = parseInt(endStr.replace(/[^\d]/g, ''));
    
    // Handle BC/AD in period range
    if (startStr.includes('BC')) startYear = Math.abs(startYear);
    if (endStr.includes('BC')) endYear = Math.abs(endYear);
    if (startStr.includes('AD')) startYear = -Math.abs(startYear);
    if (endStr.includes('AD')) endYear = -Math.abs(endYear);
    
    // For periods spanning BC to AD, we need special handling
    if (period.dateRange === "6 BC-60 AD") {
      const eventYearOriginal = parseInt(event.date.replace(/[^\d-]/g, ''));
      if (event.date.includes('BC')) {
        return eventYearOriginal <= 6;
      } else if (event.date.includes('AD')) {
        return eventYearOriginal <= 60;
      }
    }
    
    // Normal filtering for other periods
    return eventYear >= endYear && eventYear <= startYear;
  }).slice(0, 8); // Limit to 8 events per period

  // Get ALL participants from all events in this period (not just the first 8 displayed)
  const allPeriodEvents = events.filter(event => {
    // Parse event date
    let eventYear = parseInt(event.date.replace(/[^\d-]/g, ''));
    const isAD = event.date.includes('AD');
    if (isAD) eventYear = -eventYear; // Convert AD to negative for comparison
    
    // Parse period range
    const [startStr, endStr] = period.dateRange.split('-');
    let startYear = parseInt(startStr.replace(/[^\d]/g, ''));
    let endYear = parseInt(endStr.replace(/[^\d]/g, ''));
    
    // Handle BC/AD in period range
    if (startStr.includes('BC')) startYear = Math.abs(startYear);
    if (endStr.includes('BC')) endYear = Math.abs(endYear);
    if (startStr.includes('AD')) startYear = -Math.abs(startYear);
    if (endStr.includes('AD')) endYear = -Math.abs(endYear);
    
    // For periods spanning BC to AD, we need special handling
    if (period.dateRange === "6 BC-60 AD") {
      const eventYearOriginal = parseInt(event.date.replace(/[^\d-]/g, ''));
      if (event.date.includes('BC')) {
        return eventYearOriginal <= 6;
      } else if (event.date.includes('AD')) {
        return eventYearOriginal <= 60;
      }
    }
    
    // Normal filtering for other periods
    return eventYear >= endYear && eventYear <= startYear;
  });
  
  const allParticipants = new Set<string>();
  allPeriodEvents.forEach(event => {
    event.participants.forEach(p => allParticipants.add(p));
  });

  const relevantRegions = regions.filter(region => {
    // Check if region's date range overlaps with period
    const regionDates = region.estimated_dates.toLowerCase();
    
    // For New Testament period, specifically include NT regions
    if (period.dateRange === "6 BC-60 AD") {
      return regionDates.includes('ad') || 
             regionDates.includes('testament') ||
             region.time_period.toLowerCase().includes('testament') ||
             region.notable_people.some(personId => 
               ['JESUS', 'PETER', 'PAUL', 'JOHN_THE_APOSTLE', 'MARY_MOTHER_OF_JESUS'].includes(personId)
             );
    }
    
    // Check if any participants from period events are notable people in this region
    return periodEvents.some(event => 
      region.notable_people.some(personId => event.participants.includes(personId)) ||
      event.location === region.id
    );
  }).slice(0, 3);

  // Handle scrolling for linked periods, events, and regions
  useEffect(() => {
    const targetPeriod = searchParams.get('period');
    const targetEvent = searchParams.get('event');
    const targetRegion = searchParams.get('region');

    // Scroll to period only if not visible
    if (targetPeriod === periodSlug) {
      setTimeout(() => {
        const element = document.querySelector(`[data-period-id="${periodSlug}"]`);
        if (element && !isElementVisible(element)) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }

    // Scroll to event only if not visible
    if (targetEvent && periodEvents.some(event => event.id === targetEvent)) {
      setTimeout(() => {
        const element = document.querySelector(`[data-event-id="${targetEvent}"]`);
        if (element && !isElementVisible(element)) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }

    // Scroll to region only if not visible
    if (targetRegion && relevantRegions.some(region => region.id === targetRegion)) {
      setTimeout(() => {
        const element = document.querySelector(`[data-region-id="${targetRegion}"]`);
        if (element && !isElementVisible(element)) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [searchParams, periodSlug, periodEvents, relevantRegions]);

  return (
    <div className={`rounded-lg border-2 ${period.color} shadow-lg mb-8`} data-period-id={periodSlug}>
      {/* Sticky Period Header */}
      <div className="sticky top-[120px] lg:top-[180px] z-20 bg-white border-b-2 border-gray-200 rounded-t-lg">
        <div className={`p-4 ${period.color} rounded-t-lg`}>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            <button
              className="text-left hover:text-blue-600 hover:underline cursor-pointer"
              onClick={() => {
                const newSearchParams = new URLSearchParams(searchParams);
                const periodSlug = period.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                newSearchParams.set('period', periodSlug);
                router.push(`/?${newSearchParams.toString()}`, { scroll: false });
                
                // Only scroll if period not visible
                setTimeout(() => {
                  const element = document.querySelector(`[data-period-id="${periodSlug}"]`);
                  if (element && !isElementVisible(element)) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
            >
              {period.name}
            </button>
          </h3>
          <p className="text-lg font-semibold text-gray-700">{period.dateRange}</p>
        </div>
      </div>
      
      {/* Period Content */}
      <div className="p-6">
        <p className="text-gray-600 mb-4">{period.description}</p>

      <div className={`grid grid-cols-1 gap-6 ${
        [showEvents, showPeople, showRegions].filter(Boolean).length === 3 ? 'lg:grid-cols-3' :
        [showEvents, showPeople, showRegions].filter(Boolean).length === 2 ? 'lg:grid-cols-2' :
        'lg:grid-cols-1'
      }`}>
        {/* Events Column */}
        {showEvents && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-800 text-lg">📅 Key Events</h4>
              {allPeriodEvents.length > 3 && (
                <button
                  onClick={() => showPeriodEvents(period.name)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View all {allPeriodEvents.length} events →
                </button>
              )}
            </div>
            <div className="space-y-3">
              {periodEvents.map((event) => {
                const selectedEventId = searchParams.get('selected')?.split(':')[1];
                const isEventSelected = selectedEventId === event.id;
                return (
                <div key={event.id} className={`rounded-lg p-3 border transition-all duration-200 ${
                  isEventSelected 
                    ? 'bg-green-600 border-green-800 shadow-lg ring-2 ring-green-300' 
                    : 'bg-white bg-opacity-80 border-gray-200'
                }`} data-event-id={event.id}>
                  <h5 className={`font-semibold text-sm mb-1 ${
                    isEventSelected ? 'text-white' : 'text-gray-800'
                  }`}>
                    <button
                      className={`text-left hover:underline cursor-pointer ${
                        isEventSelected ? 'text-white hover:text-gray-200' : 'hover:text-blue-600'
                      }`}
                      onClick={() => {
                        const newSearchParams = new URLSearchParams(searchParams);
                        newSearchParams.set('selected', `event:${event.id}`);
                        router.push(`/?${newSearchParams.toString()}`, { scroll: false });
                        
                        // Only scroll to event if not visible
                        setTimeout(() => {
                          const element = document.querySelector(`[data-event-id="${event.id}"]`);
                          if (element && !isElementVisible(element)) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }, 100);
                      }}
                    >
                      {event.name}
                    </button>
                  </h5>
                  <p className={`text-xs mb-2 ${
                    isEventSelected ? 'text-gray-200' : 'text-gray-600'
                  }`}>{event.date}</p>
                  <p className={`text-xs mb-2 ${
                    isEventSelected ? 'text-gray-100' : 'text-gray-700'
                  }`}>{event.description}</p>
                  {event.references && event.references.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500">References: </span>
                      {event.references.slice(0, 2).map((ref, refIndex) => (
                        <span key={refIndex}>
                          <a 
                            href={getBibleUrl(ref)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            {ref.replace('.KJV', '')}
                          </a>
                          {refIndex < event.references.slice(0, 2).length - 1 && ', '}
                        </span>
                      ))}
                      {event.references.length > 2 && (
                        <span className="text-xs text-gray-500"> +{event.references.length - 2} more</span>
                      )}
                    </div>
                  )}
                  {showPeople && event.participants.length > 0 && (
                    <div className="flex flex-wrap">
                      {event.participants.slice(0, 3).map(participantId => {
                        const person = getPersonById(participantId);
                        return person ? (
                          <button
                            key={participantId}
                            onClick={() => onPersonClick(person)}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1 hover:bg-blue-200"
                          >
                            {person.name}
                          </button>
                        ) : null;
                      })}
                      {event.participants.length > 3 && (
                        <span className="text-xs text-gray-500 ml-1">+{event.participants.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* People Column */}
        {showPeople && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-800 text-lg">👥 Key Figures</h4>
              {allParticipants.size > 6 && (
                <button
                  onClick={() => showPeriodPeople(period.name)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View all {allParticipants.size} people →
                </button>
              )}
            </div>
            <div className="bg-white bg-opacity-80 rounded-lg p-3 border border-gray-200">
              <div className="space-y-2">
                {Array.from(allParticipants).slice(0, 12).map(participantId => {
                  const person = getPersonById(participantId);
                  return person ? (
                    <PersonCard key={participantId} person={person} searchParams={searchParams} router={router} />
                  ) : null;
                })}
                {allParticipants.size > 12 && (
                  <p className="text-xs text-gray-500 mt-2">+{allParticipants.size - 12} more people</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Regions Column */}
        {showRegions && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-800 text-lg">🗺️ Regions</h4>
              {relevantRegions.length > 2 && (
                <button
                  onClick={() => showPeriodRegions(period.name)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View all {relevantRegions.length} regions →
                </button>
              )}
            </div>
            <div className="space-y-3">
              {relevantRegions.map(region => {
                const selectedRegionId = searchParams.get('selected')?.split(':')[1];
                const isRegionSelected = selectedRegionId === region.id;
                return (
                <div key={region.id} className={`rounded-lg p-3 border transition-all duration-200 ${
                  isRegionSelected 
                    ? 'bg-purple-600 border-purple-800 shadow-lg ring-2 ring-purple-300' 
                    : 'bg-white bg-opacity-80 border-gray-200'
                }`} data-region-id={region.id}>
                  <h5 className={`font-semibold text-sm mb-1 flex items-center gap-2 ${
                    isRegionSelected ? 'text-white' : 'text-gray-800'
                  }`}>
                    <button
                      className={`text-left hover:underline cursor-pointer ${
                        isRegionSelected ? 'text-white hover:text-gray-200' : 'hover:text-blue-600'
                      }`}
                      onClick={() => {
                        const newSearchParams = new URLSearchParams(searchParams);
                        newSearchParams.set('region', region.id);
                        router.push(`/?${newSearchParams.toString()}`, { scroll: false });
                        
                        // Only scroll to region if not visible
                        setTimeout(() => {
                          const element = document.querySelector(`[data-region-id="${region.id}"]`);
                          if (element && !isElementVisible(element)) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }, 100);
                      }}
                    >
                      {region.name}
                    </button>
                    <a 
                      href={getRegionStudyUrl(region.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs"
                      title="Study this region in the Bible"
                    >
                      📖
                    </a>
                  </h5>
                  <p className={`text-xs mb-1 ${
                    isRegionSelected ? 'text-gray-200' : 'text-gray-600'
                  }`}>{region.location}</p>
                  <p className={`text-xs mb-2 ${
                    isRegionSelected ? 'text-gray-100' : 'text-gray-700'
                  }`}>{region.description}</p>
                  {showPeople && region.notable_people.length > 0 && (
                    <div className="flex flex-wrap">
                      {region.notable_people.slice(0, 3).map(personId => {
                        const person = getPersonById(personId);
                        return person ? (
                          <button
                            key={personId}
                            onClick={() => onPersonClick(person)}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1 hover:bg-blue-200"
                          >
                            {person.name}
                          </button>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export function BiblicalTimeline({ 
  events, 
  persons, 
  regions 
}: { 
  events: BiblicalEvent[];
  persons: BiblicalPerson[];
  regions: BiblicalRegion[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const getPersonById = (id: string) => persons.find(p => p.id === id);
  
  // State for timeline features
  const [selectedPerson, setSelectedPerson] = useState<BiblicalPerson | null>(null);
  const [showEvents, setShowEvents] = useState(true);
  const [showPeople, setShowPeople] = useState(true);
  const [showRegions, setShowRegions] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for detailed views
  const [currentView, setCurrentView] = useState<'overview' | 'period-events' | 'period-people' | 'period-regions' | 'event-detail' | 'person-detail' | 'region-detail'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<BiblicalEvent | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<BiblicalRegion | null>(null);
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  // Handle URL state on load
  useEffect(() => {
    const selected = searchParams.get('selected');
    const view = searchParams.get('view');
    const period = searchParams.get('period');

    // Handle single selection parameter
    if (selected) {
      const [type, id] = selected.split(':');
      
      if (type === 'person') {
        const person = persons.find(p => p.id === id);
        if (person) {
          setSelectedPerson(person);
          // Only scroll to person card if not visible in timeline
          setTimeout(() => {
            const element = document.querySelector(`[data-person-id="${id}"]`);
            if (element && !isElementVisible(element)) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
        }
      } else if (type === 'event') {
        const event = events.find(e => e.id === id);
        if (event) {
          setSelectedEvent(event);
          // Only scroll to event if not visible in timeline
          setTimeout(() => {
            const element = document.querySelector(`[data-event-id="${id}"]`);
            if (element && !isElementVisible(element)) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
        }
      } else if (type === 'region') {
        const region = regions.find(r => r.id === id);
        if (region) {
          setSelectedRegion(region);
          // Only scroll to region if not visible in timeline
          setTimeout(() => {
            const element = document.querySelector(`[data-region-id="${id}"]`);
            if (element && !isElementVisible(element)) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
        }
      }
    }

    // Handle view state
    if (view) {
      const validViews = ['overview', 'period-events', 'period-people', 'period-regions', 'event-detail', 'person-detail', 'region-detail'];
      
      if (validViews.includes(view)) {
        setCurrentView(view as 'overview' | 'period-events' | 'period-people' | 'period-regions' | 'event-detail' | 'person-detail' | 'region-detail');
      }
    }

    // Handle period selection
    if (period) {
      setSelectedPeriod(period);
    }
  }, [searchParams, persons, events, regions]);

  // Handle person click - scroll to person card in timeline only if not visible
  const handlePersonClick = (person: BiblicalPerson) => {
    setSelectedPerson(person);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('selected', `person:${person.id}`);
    router.push(`/?${newSearchParams.toString()}`, { scroll: false });

    // Only scroll if the person card is not visible in the timeline
    setTimeout(() => {
      const element = document.querySelector(`[data-person-id="${person.id}"]`);
      if (element && !isElementVisible(element)) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };



  // Navigation functions
  const showPeriodEvents = (periodName: string) => {
    setScrollPosition(window.scrollY);
    setSelectedPeriod(periodName);
    setCurrentView('period-events');
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('view', 'period-events');
    newSearchParams.set('period', periodName);
    router.push(`/?${newSearchParams.toString()}`, { scroll: false });
  };

  const showPeriodPeople = (periodName: string) => {
    setScrollPosition(window.scrollY);
    setSelectedPeriod(periodName);
    setCurrentView('period-people');
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('view', 'period-people');
    newSearchParams.set('period', periodName);
    router.push(`/?${newSearchParams.toString()}`, { scroll: false });
  };

  const showPeriodRegions = (periodName: string) => {
    setScrollPosition(window.scrollY);
    setSelectedPeriod(periodName);
    setCurrentView('period-regions');
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('view', 'period-regions');
    newSearchParams.set('period', periodName);
    router.push(`/?${newSearchParams.toString()}`, { scroll: false });
  };

  const showEventDetail = (event: BiblicalEvent) => {
    setSelectedEvent(event);
    setCurrentView('event-detail');
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('view', 'event-detail');
    newSearchParams.set('selected', `event:${event.id}`);
    router.push(`/?${newSearchParams.toString()}`, { scroll: false });
  };

  const showRegionDetail = (region: BiblicalRegion) => {
    setSelectedRegion(region);
    setCurrentView('region-detail');
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('view', 'region-detail');
    newSearchParams.set('selected', `region:${region.id}`);
    router.push(`/?${newSearchParams.toString()}`, { scroll: false });
  };

  const showPersonDetail = (person: BiblicalPerson) => {
    setSelectedPerson(person);
    setCurrentView('person-detail');
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('view', 'person-detail');
    newSearchParams.set('selected', `person:${person.id}`);
    router.push(`/?${newSearchParams.toString()}`, { scroll: false });
  };

  const backToOverview = () => {
    setCurrentView('overview');
    setSelectedPeriod(null);
    setSelectedEvent(null);
    setSelectedRegion(null);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('view');
    newSearchParams.delete('period');
    newSearchParams.delete('selected');
    const newQuery = newSearchParams.toString();
    router.push(newQuery ? `/?${newQuery}` : '/', { scroll: false });
    
    // Restore scroll position
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 100);
  };

  const backToPeriodView = () => {
    setSelectedEvent(null);
    setSelectedRegion(null);
    setSelectedPerson(null);
    if (selectedPeriod) {
      // Determine which period view to return to based on current context
      const currentPeriodView = searchParams.get('view');
      let targetView = 'period-events'; // Default
      
      if (currentPeriodView === 'person-detail') {
        targetView = 'period-people'; // Return to people view if coming from person detail
      } else if (currentPeriodView === 'region-detail') {
        targetView = 'period-regions'; // Return to regions view if coming from region detail
      }
      
      setCurrentView(targetView as 'period-events' | 'period-people' | 'period-regions');
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('view', targetView);
      newSearchParams.delete('selected');
      router.push(`/?${newSearchParams.toString()}`, { scroll: false });
    }
  };

  const timelinePeriods = [
    {
      name: "Creation & Pre-Flood Era",
      dateRange: "4004-2348 BC",
      color: "bg-green-100 border-green-400",
      description: "From the creation of the world to Noah's flood, spanning approximately 1,656 years"
    },
    {
      name: "Post-Flood & Patriarchs",
      dateRange: "2348-1805 BC", 
      color: "bg-blue-100 border-blue-400",
      description: "From Noah's family repopulating the earth to the death of Joseph in Egypt"
    },
    {
      name: "Egyptian Bondage",
      dateRange: "1804-1491 BC",
      color: "bg-yellow-100 border-yellow-400", 
      description: "Israel's 400+ years of slavery in Egypt until the Exodus under Moses"
    },
    {
      name: "Wilderness & Conquest",
      dateRange: "1491-1427 BC",
      color: "bg-orange-100 border-orange-400",
      description: "40 years in wilderness and conquest of the Promised Land under Joshua"
    },
    {
      name: "Judges Period", 
      dateRange: "1427-1043 BC",
      color: "bg-purple-100 border-purple-400",
      description: "Cycles of sin, oppression, and deliverance through judges like Gideon and Samson"
    },
    {
      name: "United Kingdom",
      dateRange: "1043-930 BC", 
      color: "bg-red-100 border-red-400",
      description: "Israel united under kings Saul, David, and Solomon; temple built"
    },
    {
      name: "Divided Kingdom",
      dateRange: "930-586 BC",
      color: "bg-pink-100 border-pink-400", 
      description: "Kingdom splits into Israel and Judah; prophets warn of judgment"
    },
    {
      name: "Exile & Return",
      dateRange: "586-430 BC",
      color: "bg-indigo-100 border-indigo-400",
      description: "Babylonian exile, return under Cyrus, temple rebuilt, walls restored"
    },
    {
      name: "Intertestamental Period",
      dateRange: "430-6 BC", 
      color: "bg-gray-100 border-gray-400",
      description: "400 years of prophetic silence; Greek and Roman influence"
    },
    {
      name: "New Testament Era",
      dateRange: "6 BC-60 AD",
      color: "bg-emerald-100 border-emerald-400", 
      description: "Birth, life, death, and resurrection of Jesus; early church established"
    }
  ];

  // Relevance scoring function
  const calculateRelevance = (text: string, search: string, isMainField = false): number => {
    const searchLower = search.toLowerCase();
    const textLower = text.toLowerCase();
    let score = 0;
    
    // Exact match gets highest score
    if (textLower === searchLower) {
      score += isMainField ? 100 : 50;
    }
    // Starts with search term
    else if (textLower.startsWith(searchLower)) {
      score += isMainField ? 80 : 40;
    }
    // Contains search term
    else if (textLower.includes(searchLower)) {
      score += isMainField ? 60 : 30;
    }
    // Fuzzy match - each matching character in sequence
    else {
      let searchIndex = 0;
      for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
        if (textLower[i] === searchLower[searchIndex]) {
          searchIndex++;
        }
      }
      if (searchIndex === searchLower.length) {
        score += isMainField ? 20 : 10;
      }
    }
    
    // Bonus for shorter text (more specific matches)
    if (score > 0 && textLower.length < searchLower.length * 3) {
      score += 10;
    }
    
    return score;
  };

  // Search across all content types with relevance scoring
  const searchResults = searchTerm ? (() => {
    const personsWithScore = persons.map(person => {
      let maxScore = calculateRelevance(person.name, searchTerm, true);
      
      // Check alternative names
      if (person.names) {
        for (const name of person.names) {
          const nameScore = calculateRelevance(name.name, searchTerm, true);
          maxScore = Math.max(maxScore, nameScore);
        }
      }
      
      return { item: person, score: maxScore };
    }).filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(result => result.item);

    const eventsWithScore = events.map(event => {
      let maxScore = calculateRelevance(event.name, searchTerm, true);
      maxScore = Math.max(maxScore, calculateRelevance(event.description, searchTerm, false));
      maxScore = Math.max(maxScore, calculateRelevance(event.location, searchTerm, false));
      
      return { item: event, score: maxScore };
    }).filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(result => result.item);

    const regionsWithScore = regions.map(region => {
      let maxScore = calculateRelevance(region.name, searchTerm, true);
      maxScore = Math.max(maxScore, calculateRelevance(region.description, searchTerm, false));
      maxScore = Math.max(maxScore, calculateRelevance(region.location, searchTerm, false));
      
      return { item: region, score: maxScore };
    }).filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(result => result.item);

    const periodsWithScore = timelinePeriods.map(period => {
      let maxScore = calculateRelevance(period.name, searchTerm, true);
      maxScore = Math.max(maxScore, calculateRelevance(period.description, searchTerm, false));
      
      return { item: period, score: maxScore };
    }).filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(result => result.item);

    return {
      persons: personsWithScore,
      events: eventsWithScore,
      regions: regionsWithScore,
      periods: periodsWithScore
    };
  })() : { persons: [], events: [], regions: [], periods: [] };

  const totalResults = searchResults.persons.length + searchResults.events.length + searchResults.regions.length + searchResults.periods.length;

  return (
    <div className="min-h-screen">
      {/* Sticky Main Header - Compact for Mobile */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 lg:py-6">
          <div className="text-center mb-3 lg:mb-6">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-1 lg:mb-2">Biblical Timeline</h1>
            <p className="text-sm lg:text-lg text-gray-600 hidden lg:block">
              A comprehensive journey through biblical history
            </p>
          </div>
          
          {/* Search and Controls in Header */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-2 lg:gap-4">
            <div className="w-full max-w-md">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Content Toggles in Header - Compact for Mobile */}
            <div className="flex gap-2 lg:gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showEvents}
                  onChange={(e) => setShowEvents(e.target.checked)}
                  className="mr-1"
                />
                <span className="text-xs lg:text-sm font-medium text-gray-700">📅 <span className="hidden lg:inline">Events</span></span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showPeople}
                  onChange={(e) => setShowPeople(e.target.checked)}
                  className="mr-1"
                />
                <span className="text-xs lg:text-sm font-medium text-gray-700">👥 <span className="hidden lg:inline">People</span></span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showRegions}
                  onChange={(e) => setShowRegions(e.target.checked)}
                  className="mr-1"
                />
                <span className="text-xs lg:text-sm font-medium text-gray-700">🗺️ <span className="hidden lg:inline">Regions</span></span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">

      {/* Search Results */}
      {searchTerm && totalResults > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Results ({totalResults})</h3>
          
          {/* People Results */}
          {searchResults.persons.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">👥 People ({searchResults.persons.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {searchResults.persons.map(person => (
                  <button
                    key={person.id}
                    onClick={() => handlePersonClick(person)}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:shadow-md transition-shadow text-sm text-left"
                  >
                    <div className="font-medium text-gray-800">{person.name}</div>
                    {person.birth_date && (
                      <div className="text-xs text-gray-600">{person.birth_date}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Events Results */}
          {searchResults.events.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">📅 Events ({searchResults.events.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.events.map(event => (
                  <button
                    key={event.id}
                    onClick={() => {
                      const newSearchParams = new URLSearchParams(searchParams);
                      newSearchParams.set('selected', `event:${event.id}`);
                      router.push(`/?${newSearchParams.toString()}`, { scroll: false });
                    }}
                    className="p-3 bg-white border border-gray-300 rounded-lg hover:shadow-md transition-shadow text-sm text-left"
                  >
                    <div className="font-medium text-gray-800">{event.name}</div>
                    <div className="text-xs text-gray-600 mb-1">{event.date}</div>
                    <div className="text-xs text-gray-500">{event.description.slice(0, 80)}...</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Regions Results */}
          {searchResults.regions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">🗺️ Regions ({searchResults.regions.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.regions.map(region => (
                  <button
                    key={region.id}
                    onClick={() => {
                      const newSearchParams = new URLSearchParams(searchParams);
                      newSearchParams.set('selected', `region:${region.id}`);
                      router.push(`/?${newSearchParams.toString()}`, { scroll: false });
                    }}
                    className="p-3 bg-white border border-gray-300 rounded-lg hover:shadow-md transition-shadow text-sm text-left"
                  >
                    <div className="font-medium text-gray-800">{region.name}</div>
                    <div className="text-xs text-gray-600 mb-1">{region.location}</div>
                    <div className="text-xs text-gray-500">{region.description.slice(0, 80)}...</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Periods Results */}
          {searchResults.periods.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">📜 Time Periods ({searchResults.periods.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.periods.map((period, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const periodSlug = period.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                      const newSearchParams = new URLSearchParams(searchParams);
                      newSearchParams.set('period', periodSlug);
                      router.push(`/?${newSearchParams.toString()}`, { scroll: false });
                      
                      // Only scroll to the period if it's not visible
                      setTimeout(() => {
                        const element = document.querySelector(`[data-period-id="${periodSlug}"]`);
                        if (element && !isElementVisible(element)) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className={`p-3 border-2 ${period.color} rounded-lg hover:shadow-md transition-shadow text-sm text-left`}
                  >
                    <div className="font-medium text-gray-800">{period.name}</div>
                    <div className="text-xs text-gray-600 mb-1">{period.dateRange}</div>
                    <div className="text-xs text-gray-500">{period.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {searchTerm && totalResults === 0 && (
        <div className="mb-8 text-center">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Results Found</h3>
            <p className="text-gray-600">Try searching for different terms or check your spelling.</p>
          </div>
        </div>
      )}

      {/* Timeline Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-12 border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Timeline Overview</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {timelinePeriods.map((period, index) => {
            const selectedPeriod = searchParams.get('period');
            const periodSlug = period.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            const isPeriodSelected = selectedPeriod === periodSlug;
            return (
            <button
              key={index}
              className={`px-4 py-2 rounded-full border-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                isPeriodSelected 
                  ? 'bg-indigo-600 border-indigo-800 text-white shadow-lg ring-2 ring-indigo-300' 
                  : `${period.color}`
              }`}
              onClick={() => {
                const periodSlug = period.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('period', periodSlug);
                router.push(`/?${newSearchParams.toString()}`, { scroll: false });
                
                // Only scroll to the period if it's not visible
                setTimeout(() => {
                  const element = document.querySelector(`[data-period-id="${periodSlug}"]`);
                  if (element && !isElementVisible(element)) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
            >
              <div className="text-center">
                <div className={`font-semibold text-sm ${
                  isPeriodSelected ? 'text-white' : 'text-gray-800'
                }`}>{period.name}</div>
                <div className={`text-xs ${
                  isPeriodSelected ? 'text-gray-200' : 'text-gray-600'
                }`}>{period.dateRange}</div>
              </div>
            </button>
            );
          })}
        </div>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            <strong>Total Events:</strong> {events.length} | 
            <strong> People:</strong> {persons.length} | 
            <strong> Regions:</strong> {regions.length}
          </p>
        </div>
      </div>


      {/* Main Content Area with Sticky Person Details */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Timeline */}
        <div className="flex-1">
          {currentView === 'overview' ? (
            /* Main Timeline */
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 via-blue-400 via-yellow-400 via-purple-400 via-red-400 to-emerald-400"></div>
              
              {timelinePeriods.map((period, index) => (
                <div key={index} className="relative mb-16">
                  {/* Timeline dot */}
                  <div className="absolute left-6 w-5 h-5 bg-white border-4 border-gray-600 rounded-full z-10 shadow-lg"></div>
                  
                  {/* Content */}
                  <div className="ml-20">
                    <TimelinePeriodCard
                      period={period}
                      events={events}
                      regions={regions}
                      getPersonById={getPersonById}
                      searchParams={searchParams}
                      router={router}
                      showEvents={showEvents}
                      showPeople={showPeople}
                      showRegions={showRegions}
                      onPersonClick={handlePersonClick}
                      showPeriodEvents={showPeriodEvents}
                      showPeriodPeople={showPeriodPeople}
                      showPeriodRegions={showPeriodRegions}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : currentView === 'period-events' && selectedPeriod ? (
            <PeriodEventsView
              periodName={selectedPeriod}
              events={events.filter(event => {
                // Filter events for the selected period - same logic as in TimelinePeriodCard
                const period = timelinePeriods.find(p => p.name === selectedPeriod);
                if (!period) return false;
                
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
              })}
              onEventClick={showEventDetail}
              onBackClick={backToOverview}
            />
          ) : currentView === 'period-people' && selectedPeriod ? (
            <PeriodPeopleView
              periodName={selectedPeriod}
              people={Array.from(new Set(events.filter(event => {
                // Same period filtering logic
                const period = timelinePeriods.find(p => p.name === selectedPeriod);
                if (!period) return false;
                
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
              }).flatMap(event => event.participants))).map(id => getPersonById(id)).filter((p): p is BiblicalPerson => p !== undefined)}
              onPersonClick={showPersonDetail}
              onBackClick={backToOverview}
            />
          ) : currentView === 'period-regions' && selectedPeriod ? (
            <PeriodRegionsView
              periodName={selectedPeriod}
              regions={regions.filter(region => {
                // Filter regions for the selected period
                const period = timelinePeriods.find(p => p.name === selectedPeriod);
                if (!period) return false;
                
                const regionDates = region.estimated_dates.toLowerCase();
                
                if (period.dateRange === "6 BC-60 AD") {
                  return regionDates.includes('ad') || 
                         regionDates.includes('testament') ||
                         region.time_period.toLowerCase().includes('testament') ||
                         region.notable_people.some(personId => 
                           ['JESUS', 'PETER', 'PAUL', 'JOHN_THE_APOSTLE', 'MARY_MOTHER_OF_JESUS'].includes(personId)
                         );
                }
                
                // Check if any events from this period are in this region
                return events.some(event => 
                  region.notable_people.some(personId => event.participants.includes(personId)) ||
                  event.location === region.id
                );
              })}
              onRegionClick={showRegionDetail}
              onBackClick={backToOverview}
            />
          ) : currentView === 'event-detail' && selectedEvent ? (
            <EventDetailView
              event={selectedEvent}
              onBackClick={backToPeriodView}
              getPersonById={getPersonById}
            />
          ) : currentView === 'region-detail' && selectedRegion ? (
            <RegionDetailView
              region={selectedRegion}
              onBackClick={backToPeriodView}
              getPersonById={getPersonById}
            />
          ) : currentView === 'person-detail' && selectedPerson ? (
            <PersonDetails
              person={selectedPerson}
              allPersons={persons}
              onPersonClick={showPersonDetail}
              onBackClick={backToPeriodView}
            />
          ) : (
            <div className="text-center bg-gray-50 rounded-xl p-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h3>
            </div>
          )}
        </div>

        {/* Person Details - Desktop Sidebar / Mobile Modal */}
        {currentView === 'overview' && selectedPerson && (
          <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:w-80 xl:w-96">
              <div className="sticky top-[140px] lg:top-[200px]">
                <div className="bg-white rounded-xl p-1 border-2 border-blue-400 shadow-lg">
                  <div className="bg-blue-50 rounded-lg p-4 mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-blue-800">Selected Person</h3>
                      <button
                        onClick={() => {
                          setSelectedPerson(null);
                          const newSearchParams = new URLSearchParams(searchParams);
                          newSearchParams.delete('selected');
                          const newQuery = newSearchParams.toString();
                          router.push(newQuery ? `/?${newQuery}` : '/', { scroll: false });
                        }}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                        title="Clear selection"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-sm text-blue-700 font-medium">{selectedPerson.name}</p>
                  </div>
                  <PersonDetails
                    person={selectedPerson}
                    allPersons={persons}
                    onPersonClick={handlePersonClick}
                  />
                </div>
              </div>
            </div>
            
            {/* Mobile Modal Overlay */}
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => {
              setSelectedPerson(null);
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete('selected');
              const newQuery = newSearchParams.toString();
              router.push(newQuery ? `/?${newQuery}` : '/', { scroll: false });
            }}>
              <div className="fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white rounded-t-xl p-4 shadow-lg">
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-blue-800">Selected Person</h3>
                      <button
                        onClick={() => {
                          setSelectedPerson(null);
                          const newSearchParams = new URLSearchParams(searchParams);
                          newSearchParams.delete('selected');
                          const newQuery = newSearchParams.toString();
                          router.push(newQuery ? `/?${newQuery}` : '/', { scroll: false });
                        }}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                        title="Clear selection"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-sm text-blue-700 font-medium">{selectedPerson.name}</p>
                  </div>
                  <PersonDetails
                    person={selectedPerson}
                    allPersons={persons}
                    onPersonClick={handlePersonClick}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Desktop Empty State */}
        {currentView === 'overview' && !selectedPerson && (
          <div className="hidden lg:block lg:w-80 xl:w-96">
            <div className="sticky top-[140px] lg:top-[200px]">
              <div className="text-center bg-gray-50 rounded-xl p-8 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Person Details</h3>
                <p className="text-gray-600 mb-4">
                  Click on any person in the timeline to see detailed information about them.
                </p>
                <p className="text-sm text-gray-500">
                  Includes family relationships, biblical references, and biographical information.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Color Legend */}
      <div className="bg-white rounded-xl p-6 mb-12 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-center mb-4 text-gray-800">Person Color Guide</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Divine</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-200 border border-purple-400 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Patriarchs</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-200 border border-red-400 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Kings</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-200 border border-green-400 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Prophets</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-200 border border-indigo-400 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Apostles</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-pink-200 border border-pink-400 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Women</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Other Men</span>
          </div>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-xs text-gray-600">
          <div className="flex items-center">
            <span className="text-orange-600 mr-1">⭐</span>
            <span>Created by God</span>
          </div>
          <div className="flex items-center">
            <span className="text-cyan-600 mr-1">↗️</span>
            <span>Translated (taken up)</span>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-16 bg-gray-50 rounded-xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Biblical History Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{events.length}</div>
            <div className="text-gray-700 font-medium">Major Events</div>
            <div className="text-sm text-gray-500 mt-1">From Creation to Early Church</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">{persons.length}</div>
            <div className="text-gray-700 font-medium">Biblical Figures</div>
            <div className="text-sm text-gray-500 mt-1">Patriarchs, Kings, Prophets, Apostles</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{regions.length}</div>
            <div className="text-gray-700 font-medium">Geographic Regions</div>
            <div className="text-sm text-gray-500 mt-1">From Eden to Roman Empire</div>
          </div>
        </div>
        <div className="text-center mt-8">
          <p className="text-gray-600 text-lg">
            <strong>Total Timespan:</strong> Approximately 4,000+ years of biblical history
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}