'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface BiblicalPerson {
  id: string;
  name: string;
  names?: { name: string; reference: string }[];
  gender?: string;
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
  
  const cleanRef = reference.replace('.KJV', '');
  const parts = cleanRef.split('.');
  
  if (parts.length >= 3) {
    const book = parts[0];
    const chapter = parts[1];
    const verse = parts[2];
    
    return `https://www.bible.com/bible/1/${book}.${chapter}.${verse}`;
  }
  
  return '';
}

// Helper function to parse biblical dates and sort chronologically
function parseBiblicalDate(dateStr: string): number {
  if (!dateStr) return 0;
  
  // Handle BC dates (negative numbers)
  if (dateStr.includes('BC')) {
    const match = dateStr.match(/(\d+)/);
    return match ? -parseInt(match[1]) : 0;
  }
  
  // Handle AD dates (positive numbers)
  if (dateStr.includes('AD')) {
    const match = dateStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
  
  // Handle just numbers (assume BC if > 100, AD if < 100)
  const match = dateStr.match(/(\d+)/);
  if (match) {
    const year = parseInt(match[1]);
    return year > 100 ? -year : year;
  }
  
  return 0;
}

// Helper function to format dates for display
function formatBiblicalDate(dateStr: string): string {
  if (!dateStr) return '';
  
  const year = parseBiblicalDate(dateStr);
  if (year === 0) return dateStr;
  
  return year < 0 ? `${Math.abs(year)} BC` : `${year} AD`;
}

// Helper function to get all descendants of a person
function getDescendants(person: BiblicalPerson, allPersons: BiblicalPerson[], maxDepth: number = 3, currentDepth: number = 0): BiblicalPerson[] {
  if (currentDepth >= maxDepth) return [];
  
  const children = allPersons.filter(p => p.parents?.includes(person.id));
  const descendants = [...children];
  
  children.forEach(child => {
    descendants.push(...getDescendants(child, allPersons, maxDepth, currentDepth + 1));
  });
  
  return descendants;
}

// Helper function to get all ancestors of a person
function getAncestors(person: BiblicalPerson, allPersons: BiblicalPerson[], maxDepth: number = 3, currentDepth: number = 0): BiblicalPerson[] {
  if (currentDepth >= maxDepth || !person.parents) return [];
  
  const parents = person.parents.map(id => allPersons.find(p => p.id === id)).filter((p): p is BiblicalPerson => p !== undefined);
  const ancestors = [...parents];
  
  parents.forEach(parent => {
    ancestors.push(...getAncestors(parent, allPersons, maxDepth, currentDepth + 1));
  });
  
  return ancestors;
}

// Helper function to build family trees
function buildFamilyTree(rootPerson: BiblicalPerson, allPersons: BiblicalPerson[]) {
  const ancestors = getAncestors(rootPerson, allPersons);
  const descendants = getDescendants(rootPerson, allPersons);
  const siblings = allPersons.filter(p => 
    p.id !== rootPerson.id && 
    p.parents?.some(parentId => rootPerson.parents?.includes(parentId))
  );
  
  return {
    root: rootPerson,
    ancestors: ancestors,
    descendants: descendants,
    siblings: siblings
  };
}

function PersonNode({ 
  person, 
  onPersonClick,
  isRoot = false,
  relationship = ''
}: { 
  person: BiblicalPerson; 
  allPersons: BiblicalPerson[];
  onPersonClick: (person: BiblicalPerson) => void;
  isRoot?: boolean;
  relationship?: string;
}) {
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
  
  return (
    <div className="flex flex-col items-center space-y-2">
      {relationship && (
        <div className="text-xs text-gray-500 font-medium">{relationship}</div>
      )}
      <div
        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
          isRoot ? 'ring-4 ring-blue-300 shadow-lg' : ''
        } ${colors.bg} ${colors.border}`}
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
          {person.death_date && (
            <div className="text-xs text-gray-600">Died: {person.death_date}</div>
          )}
          {person.age && (
            <div className="text-xs text-gray-600">Age: {person.age}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function PersonDetails({ person, allPersons, onPersonClick }: {
  person: BiblicalPerson;
  allPersons: BiblicalPerson[];
  onPersonClick: (person: BiblicalPerson) => void;
}) {
  const parents = person.parents?.map(id => allPersons.find(p => p.id === id)).filter((p): p is BiblicalPerson => p !== undefined) || [];
  const children = allPersons.filter(p => p.parents?.includes(person.id));
  const spouses = person.spouses?.map(id => allPersons.find(p => p.id === id)).filter((p): p is BiblicalPerson => p !== undefined) || [];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
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
            
            {person.birth_date && (
              <div>
                <span className="font-semibold text-gray-600">Birth:</span>
                <span className="ml-2 text-gray-800">{formatBiblicalDate(person.birth_date)}</span>
              </div>
            )}
            
            {person.death_date && (
              <div>
                <span className="font-semibold text-gray-600">Death:</span>
                <span className="ml-2 text-gray-800">{formatBiblicalDate(person.death_date)}</span>
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
                  {parents.map(parent => (
                    <button
                      key={parent.id}
                      onClick={() => onPersonClick(parent)}
                      className="block text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      {parent.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {spouses.length > 0 && (
              <div>
                <span className="font-semibold text-gray-600">Spouses:</span>
                <div className="ml-2 space-y-1">
                  {spouses.map(spouse => (
                    <button
                      key={spouse.id}
                      onClick={() => onPersonClick(spouse)}
                      className="block text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      {spouse.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {children.length > 0 && (
              <div>
                <span className="font-semibold text-gray-600">Children:</span>
                <div className="ml-2 space-y-1">
                  {children.slice(0, 10).map(child => (
                    <button
                      key={child.id}
                      onClick={() => onPersonClick(child)}
                      className="block text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      {child.name}
                    </button>
                  ))}
                  {children.length > 10 && (
                    <div className="text-sm text-gray-500">+{children.length - 10} more children</div>
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

function TimelineDisplay({ 
  persons, 
  onPersonClick,
  selectedPerson 
}: { 
  persons: BiblicalPerson[];
  onPersonClick: (person: BiblicalPerson) => void;
  selectedPerson: BiblicalPerson | null;
}) {
  // Sort persons by birth date for timeline
  const sortedPersons = persons
    .filter(p => p.birth_date)
    .sort((a, b) => {
      const dateA = parseBiblicalDate(a.birth_date!);
      const dateB = parseBiblicalDate(b.birth_date!);
      return dateA - dateB;
    });

  // Group persons by approximate time periods
  const timeGroups = [
    { name: 'Creation & Early History', range: [-4000, -2000], color: 'bg-purple-100 border-purple-300' },
    { name: 'Patriarchs', range: [-2000, -1500], color: 'bg-blue-100 border-blue-300' },
    { name: 'Exodus & Judges', range: [-1500, -1000], color: 'bg-green-100 border-green-300' },
    { name: 'United Kingdom', range: [-1000, -900], color: 'bg-red-100 border-red-300' },
    { name: 'Divided Kingdom', range: [-900, -500], color: 'bg-yellow-100 border-yellow-300' },
    { name: 'Exile & Return', range: [-500, -5], color: 'bg-indigo-100 border-indigo-300' },
    { name: 'New Testament', range: [-5, 100], color: 'bg-pink-100 border-pink-300' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Biblical Timeline</h3>
      
      <div className="space-y-6">
        {timeGroups.map(group => {
          const groupPersons = sortedPersons.filter(p => {
            const year = parseBiblicalDate(p.birth_date!);
            return year >= group.range[0] && year < group.range[1];
          });

          if (groupPersons.length === 0) return null;

          return (
            <div key={group.name} className={`rounded-lg p-4 border-2 ${group.color}`}>
              <h4 className="font-semibold text-gray-800 mb-3">{group.name}</h4>
              <div className="flex flex-wrap gap-2">
                {groupPersons.map(person => (
                  <button
                    key={person.id}
                    onClick={() => onPersonClick(person)}
                    className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                      selectedPerson?.id === person.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-sm'
                    }`}
                  >
                    <div className="font-medium">{person.name}</div>
                    <div className="text-xs opacity-75">
                      {formatBiblicalDate(person.birth_date!)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FamilyTreeDisplay({ 
  familyTree, 
  allPersons, 
  onPersonClick 
}: { 
  familyTree: ReturnType<typeof buildFamilyTree>;
  allPersons: BiblicalPerson[];
  onPersonClick: (person: BiblicalPerson) => void;
}) {
  const { root, ancestors, descendants, siblings } = familyTree;
  
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="space-y-8">
        {/* Ancestors */}
        {ancestors.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Ancestors</h4>
            <div className="flex flex-wrap justify-center gap-4">
              {ancestors.slice(0, 6).map(ancestor => (
                <PersonNode
                  key={ancestor.id}
                  person={ancestor}
                  allPersons={allPersons}
                  onPersonClick={onPersonClick}
                  relationship="Ancestor"
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Current Person & Siblings */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Focus Person{siblings.length > 0 ? ' & Siblings' : ''}</h4>
          <div className="flex flex-wrap justify-center gap-6">
            {siblings.slice(0, 3).map(sibling => (
              <PersonNode
                key={sibling.id}
                person={sibling}
                allPersons={allPersons}
                onPersonClick={onPersonClick}
                relationship="Sibling"
              />
            ))}
            <PersonNode
              person={root}
              allPersons={allPersons}
              onPersonClick={onPersonClick}
              isRoot={true}
            />
          </div>
        </div>
        
        {/* Descendants */}
        {descendants.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Descendants</h4>
            <div className="flex flex-wrap justify-center gap-4">
              {descendants.slice(0, 8).map(descendant => (
                <PersonNode
                  key={descendant.id}
                  person={descendant}
                  allPersons={allPersons}
                  onPersonClick={onPersonClick}
                  relationship="Descendant"
                />
              ))}
              {descendants.length > 8 && (
                <div className="text-sm text-gray-500 self-center">
                  +{descendants.length - 8} more descendants
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AncestryTimeline({ 
  persons 
}: { 
  events: BiblicalEvent[];
  persons: BiblicalPerson[];
  regions: BiblicalRegion[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPerson, setSelectedPerson] = useState<BiblicalPerson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'family'>('timeline');
  
  // Get person from URL on load
  useEffect(() => {
    const personId = searchParams.get('person');
    if (personId) {
      const person = persons.find(p => p.id === personId);
      if (person) {
        setSelectedPerson(person);
      }
    }
  }, [searchParams, persons]);
  
  // Important biblical figures for quick access
  const keyFigures = [
    'ADAM', 'NOAH', 'ABRAHAM', 'ISAAC', 'JACOB', 'MOSES', 'DAVID', 'SOLOMON', 'JESUS', 'PETER', 'PAUL'
  ].map(id => persons.find(p => p.id === id)).filter((p): p is BiblicalPerson => p !== undefined);
  
  // Filter persons based on search
  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.names?.some(n => n.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handlePersonClick = (person: BiblicalPerson) => {
    setSelectedPerson(person);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('person', person.id);
    router.push(`/ancestry?${newSearchParams.toString()}`, { scroll: false });
  };
  
  const familyTree = selectedPerson ? buildFamilyTree(selectedPerson, persons) : null;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Biblical Ancestry Timeline</h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Explore the family trees and lineages of biblical figures, tracing relationships through generations
          from Adam to the apostles.
        </p>
      </div>

      {/* Search and Key Figures */}
      <div className="mb-8">
        <div className="max-w-md mx-auto mb-6">
          <input
            type="text"
            placeholder="Search for a person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Timeline View
            </button>
            <button
              onClick={() => setViewMode('family')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'family'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Family Tree View
            </button>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Key Biblical Figures</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {keyFigures.map(person => (
              <button
                key={person.id}
                onClick={() => handlePersonClick(person)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:shadow-md transition-shadow text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                {person.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Results ({filteredPersons.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredPersons.slice(0, 24).map(person => (
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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Timeline or Family Tree */}
        <div className="lg:col-span-2">
          {viewMode === 'timeline' ? (
            <TimelineDisplay
              persons={persons}
              onPersonClick={handlePersonClick}
              selectedPerson={selectedPerson}
            />
          ) : (
            selectedPerson && familyTree ? (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Family Tree: {selectedPerson.name}
                  </h2>
                </div>
                <FamilyTreeDisplay
                  familyTree={familyTree}
                  allPersons={persons}
                  onPersonClick={handlePersonClick}
                />
              </div>
            ) : (
              <div className="text-center bg-gray-50 rounded-xl p-8 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Person</h3>
                <p className="text-gray-600 mb-4">
                  Choose a biblical figure above to explore their family tree and relationships.
                </p>
              </div>
            )
          )}
        </div>

        {/* Person Details */}
        <div className="lg:col-span-1">
          {selectedPerson ? (
            <PersonDetails
              person={selectedPerson}
              allPersons={persons}
              onPersonClick={handlePersonClick}
            />
          ) : (
            <div className="text-center bg-gray-50 rounded-xl p-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Person Details</h3>
              <p className="text-gray-600 mb-4">
                Click on any person in the timeline or family tree to see detailed information about them.
              </p>
              <p className="text-sm text-gray-500">
                Includes family relationships, biblical references, and biographical information.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-16 bg-gray-50 rounded-xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Ancestry Database</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{persons.length}</div>
            <div className="text-gray-700 font-medium">Biblical Figures</div>
            <div className="text-sm text-gray-500 mt-1">With family relationships</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {persons.filter(p => p.parents && p.parents.length > 0).length}
            </div>
            <div className="text-gray-700 font-medium">Known Lineages</div>
            <div className="text-sm text-gray-500 mt-1">People with recorded parents</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {persons.filter(p => persons.some(child => child.parents?.includes(p.id))).length}
            </div>
            <div className="text-gray-700 font-medium">Family Founders</div>
            <div className="text-sm text-gray-500 mt-1">People with recorded children</div>
          </div>
        </div>
      </div>
    </div>
  );
}