'use client';

import { useState, useEffect } from 'react';

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

// Helper function to get family relationships
function getPersonRelationships(person: BiblicalPerson, allPersons: BiblicalPerson[]) {
  const getPersonById = (id: string) => allPersons.find(p => p.id === id);
  
  // Parents
  const parents = person.parents?.map(id => getPersonById(id)).filter((p): p is BiblicalPerson => p !== undefined) || [];
  
  // Spouses
  const spouses = person.spouses?.map(id => getPersonById(id)).filter((p): p is BiblicalPerson => p !== undefined) || [];
  
  // Children (people who have this person as parent)
  const children = allPersons.filter(p => p.parents?.includes(person.id));
  
  // Siblings (people who share at least one parent)
  const siblings = person.parents ? allPersons.filter(p => 
    p.id !== person.id && 
    p.parents?.some(parentId => person.parents?.includes(parentId))
  ) : [];
  
  // Ancestors (going up the family tree)
  const ancestors: BiblicalPerson[] = [];
  const visited = new Set<string>();
  
  function collectAncestors(personId: string, depth: number = 0) {
    if (depth > 10 || visited.has(personId)) return; // Prevent infinite loops
    visited.add(personId);
    
    const currentPerson = getPersonById(personId);
    if (currentPerson?.parents) {
      currentPerson.parents.forEach(parentId => {
        const parent = getPersonById(parentId);
        if (parent && !ancestors.find(a => a.id === parent.id)) {
          ancestors.push(parent);
          collectAncestors(parentId, depth + 1);
        }
      });
    }
  }
  
  if (person.parents) {
    person.parents.forEach(parentId => collectAncestors(parentId));
  }
  
  return { parents, spouses, children, siblings, ancestors };
}

export function PersonPopover({ 
  person, 
  allPersons, 
  children 
}: { 
  person: BiblicalPerson; 
  allPersons: BiblicalPerson[];
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const relationships = getPersonRelationships(person, allPersons);

  const showPopover = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(true);
  };

  const hidePopover = () => {
    const id = setTimeout(() => {
      setIsVisible(false);
    }, 100); // Small delay to allow mouse to reach popover
    setTimeoutId(id);
  };

  const cancelHide = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showPopover}
      onMouseLeave={hidePopover}
    >
      {children}
      
      {isVisible && (
        <div 
          className="w-80 p-4 bg-white border border-gray-300 rounded-lg shadow-2xl"
          onMouseEnter={cancelHide}
          onMouseLeave={hidePopover}
          style={{ 
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999
          }}
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="border-b border-gray-200 pb-2">
              <h3 className="font-bold text-lg text-gray-800">{person.name}</h3>
              {person.names && person.names.length > 0 && (
                <div className="text-sm text-gray-600">
                  Also known as: {person.names.map(n => n.name).join(', ')}
                </div>
              )}
              {person.age && (
                <div className="text-sm text-gray-600">Age: {person.age}</div>
              )}
              {(person.birth_date || person.death_date) && (
                <div className="text-sm text-gray-600">
                  {person.birth_date && <span>Born: {person.birth_date}</span>}
                  {person.birth_date && person.death_date && <span> • </span>}
                  {person.death_date && <span>Died: {person.death_date}</span>}
                </div>
              )}
              {(person.created || person.translated) && (
                <div className="text-sm text-gray-600">
                  {person.created && <span className="mr-2">⭐ Created by God</span>}
                  {person.translated && <span>↗️ Translated (taken up)</span>}
                </div>
              )}
            </div>

            {/* Ancestors */}
            {relationships.ancestors.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Notable Ancestors:</h4>
                <div className="text-xs text-gray-600">
                  {relationships.ancestors.slice(0, 4).map(ancestor => ancestor.name).join(' → ')}
                  {relationships.ancestors.length > 4 && ` (+${relationships.ancestors.length - 4} more)`}
                </div>
              </div>
            )}

            {/* Parents */}
            {relationships.parents.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Parents:</h4>
                <div className="flex flex-wrap gap-1">
                  {relationships.parents.map(parent => (
                    <span key={parent.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {parent.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Spouses */}
            {relationships.spouses.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Spouses:</h4>
                <div className="flex flex-wrap gap-1">
                  {relationships.spouses.map(spouse => (
                    <span key={spouse.id} className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">
                      {spouse.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Siblings */}
            {relationships.siblings.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Siblings:</h4>
                <div className="flex flex-wrap gap-1">
                  {relationships.siblings.slice(0, 6).map(sibling => (
                    <span key={sibling.id} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      {sibling.name}
                    </span>
                  ))}
                  {relationships.siblings.length > 6 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{relationships.siblings.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Children */}
            {relationships.children.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Children:</h4>
                <div className="flex flex-wrap gap-1">
                  {relationships.children.slice(0, 6).map(child => (
                    <span key={child.id} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {child.name}
                    </span>
                  ))}
                  {relationships.children.length > 6 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{relationships.children.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Biblical References */}
            {person.references && person.references.length > 0 && (
              <div className="border-t border-gray-200 pt-2">
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Biblical References:</h4>
                <div className="flex flex-wrap gap-1">
                  {person.references.slice(0, 3).map((ref, index) => (
                    <a
                      key={index}
                      href={getBibleUrl(ref)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      {ref.replace('.KJV', '')}
                    </a>
                  ))}
                  {person.references.length > 3 && (
                    <span className="text-xs text-gray-500">+{person.references.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}