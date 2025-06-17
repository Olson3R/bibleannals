/**
 * Utility functions for finding cross-references between people, events, and locations
 */

import type { BiblicalPerson, BiblicalEvent, BiblicalRegion } from '../types/biblical';

export interface CrossReferences {
  relatedPeople: BiblicalPerson[];
  relatedEvents: BiblicalEvent[];
  relatedRegions: BiblicalRegion[];
}

/**
 * Find cross-references for a person
 */
export function getPersonCrossReferences(
  person: BiblicalPerson,
  allPeople: BiblicalPerson[],
  allEvents: BiblicalEvent[],
  allRegions: BiblicalRegion[]
): CrossReferences {
  const relatedPeople: BiblicalPerson[] = [];
  const relatedEvents: BiblicalEvent[] = [];
  const relatedRegions: BiblicalRegion[] = [];

  // Find related people through family relationships
  if (person.parents) {
    person.parents.forEach(parentId => {
      const parent = allPeople.find(p => p.id === parentId);
      if (parent && !relatedPeople.find(rp => rp.id === parent.id)) {
        relatedPeople.push(parent);
      }
    });
  }

  if (person.spouses) {
    person.spouses.forEach(spouseId => {
      const spouse = allPeople.find(p => p.id === spouseId);
      if (spouse && !relatedPeople.find(rp => rp.id === spouse.id)) {
        relatedPeople.push(spouse);
      }
    });
  }

  // Find children (people who have this person as parent)
  const children = allPeople.filter(p => p.parents?.includes(person.id));
  children.forEach(child => {
    if (!relatedPeople.find(rp => rp.id === child.id)) {
      relatedPeople.push(child);
    }
  });

  // Find events this person participated in
  const participatedEvents = allEvents.filter(event => 
    event.participants.includes(person.id)
  );
  relatedEvents.push(...participatedEvents);

  // Find regions where this person is notable
  const notableRegions = allRegions.filter(region => 
    region.notable_people.includes(person.id)
  );
  relatedRegions.push(...notableRegions);

  // Find people from the same ethnicity (limit to 5)
  if (person.ethnicity) {
    const sameEthnicity = allPeople
      .filter(p => p.ethnicity === person.ethnicity && p.id !== person.id)
      .slice(0, 5);
    sameEthnicity.forEach(p => {
      if (!relatedPeople.find(rp => rp.id === p.id)) {
        relatedPeople.push(p);
      }
    });
  }

  return {
    relatedPeople: relatedPeople.slice(0, 8), // Limit to 8 related people
    relatedEvents: relatedEvents.slice(0, 6), // Limit to 6 events
    relatedRegions: relatedRegions.slice(0, 4) // Limit to 4 regions
  };
}

/**
 * Find cross-references for an event
 */
export function getEventCrossReferences(
  event: BiblicalEvent,
  allPeople: BiblicalPerson[],
  allEvents: BiblicalEvent[],
  allRegions: BiblicalRegion[]
): CrossReferences {
  const relatedPeople: BiblicalPerson[] = [];
  const relatedEvents: BiblicalEvent[] = [];
  const relatedRegions: BiblicalRegion[] = [];

  // Get all participants
  event.participants.forEach(participantId => {
    const person = allPeople.find(p => p.id === participantId);
    if (person) {
      relatedPeople.push(person);
    }
  });

  // Find the location region
  const locationRegion = allRegions.find(r => r.id === event.location);
  if (locationRegion) {
    relatedRegions.push(locationRegion);
  }

  // Find events with shared participants (limit to 5)
  const sharedParticipantEvents = allEvents
    .filter(e => 
      e.id !== event.id && 
      e.participants.some(p => event.participants.includes(p))
    )
    .slice(0, 5);
  relatedEvents.push(...sharedParticipantEvents);

  // Find events in the same location (limit to 3)
  const sameLocationEvents = allEvents
    .filter(e => 
      e.id !== event.id && 
      e.location === event.location &&
      !relatedEvents.find(re => re.id === e.id)
    )
    .slice(0, 3);
  relatedEvents.push(...sameLocationEvents);

  return {
    relatedPeople: relatedPeople.slice(0, 6), // Limit to 6 people
    relatedEvents: relatedEvents.slice(0, 8), // Limit to 8 events
    relatedRegions: relatedRegions.slice(0, 3) // Limit to 3 regions
  };
}

/**
 * Find cross-references for a region
 */
export function getRegionCrossReferences(
  region: BiblicalRegion,
  allPeople: BiblicalPerson[],
  allEvents: BiblicalEvent[],
  allRegions: BiblicalRegion[]
): CrossReferences {
  const relatedPeople: BiblicalPerson[] = [];
  const relatedEvents: BiblicalEvent[] = [];
  const relatedRegions: BiblicalRegion[] = [];

  // Get all notable people
  region.notable_people.forEach(personId => {
    const person = allPeople.find(p => p.id === personId);
    if (person) {
      relatedPeople.push(person);
    }
  });

  // Find events that took place in this region
  const regionEvents = allEvents.filter(e => e.location === region.id);
  relatedEvents.push(...regionEvents);

  // Find regions from the same time period (limit to 4)
  const sameTimePeriodRegions = allRegions
    .filter(r => 
      r.id !== region.id && 
      r.time_period === region.time_period
    )
    .slice(0, 4);
  relatedRegions.push(...sameTimePeriodRegions);

  return {
    relatedPeople: relatedPeople.slice(0, 8), // Limit to 8 people
    relatedEvents: relatedEvents.slice(0, 6), // Limit to 6 events
    relatedRegions: relatedRegions.slice(0, 4) // Limit to 4 regions
  };
}