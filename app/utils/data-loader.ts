import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import type { BiblicalPerson, BiblicalEvent, BiblicalRegion, TimelinePeriod, FamilyGroup } from '../types/biblical';
import { timelinePeriods } from '../data/timeline-periods';

let cachedData: {
  persons: BiblicalPerson[];
  events: BiblicalEvent[];
  regions: BiblicalRegion[];
  familyGroups: FamilyGroup[];
} | null = null;

export function loadTimelineData() {
  if (cachedData) {
    return cachedData;
  }

  try {
    const dataDir = join(process.cwd(), 'data');
    
    const ancestryData = readFileSync(join(dataDir, 'people.yaml'), 'utf-8');
    const eventsData = readFileSync(join(dataDir, 'events.yaml'), 'utf-8');
    const regionsData = readFileSync(join(dataDir, 'regions.yaml'), 'utf-8');
    
    const ancestryYaml = yaml.load(ancestryData) as { 
      biblical_persons: BiblicalPerson[]; 
      family_groups: FamilyGroup[] 
    };
    const eventsYaml = yaml.load(eventsData) as { biblical_events: BiblicalEvent[] };
    const regionsYaml = yaml.load(regionsData) as { biblical_regions: BiblicalRegion[] };
    
    cachedData = {
      persons: ancestryYaml.biblical_persons,
      events: eventsYaml.biblical_events,
      regions: regionsYaml.biblical_regions,
      familyGroups: ancestryYaml.family_groups || []
    };
    
    return cachedData;
  } catch (error) {
    console.error('Error loading timeline data:', error);
    return {
      persons: [],
      events: [],
      regions: [],
      familyGroups: []
    };
  }
}

export function getPersonById(id: string): BiblicalPerson | undefined {
  const data = loadTimelineData();
  return data.persons.find(p => p.id === id);
}

export function getEventById(id: string): BiblicalEvent | undefined {
  const data = loadTimelineData();
  return data.events.find(e => e.id === id);
}

export function getRegionById(id: string): BiblicalRegion | undefined {
  const data = loadTimelineData();
  return data.regions.find(r => r.id === id);
}

export function getTimelinePeriods(): TimelinePeriod[] {
  return timelinePeriods;
}

export function getPeriodBySlug(slug: string) {
  return getTimelinePeriods().find(p => p.slug === slug);
}

export function getPeriodEvents(periodName: string): BiblicalEvent[] {
  const data = loadTimelineData();
  const period = getTimelinePeriods().find(p => p.name === periodName);
  if (!period) return [];
  
  return data.events.filter(event => {
    // Parse event date - convert to negative for BC, positive for AD
    let eventYear = parseInt(event.date.replace(/[^\d-]/g, ''));
    if (event.date.includes('BC')) {
      eventYear = -eventYear; // BC dates are negative
    }
    // AD dates stay positive (no conversion needed)
    
    // Parse period range - assume BC for start unless specified as AD
    const [startStr, endStr] = period.dateRange.split('-');
    let startYear = parseInt(startStr.replace(/[^\d]/g, ''));
    let endYear = parseInt(endStr.replace(/[^\d]/g, ''));
    
    // Convert start year based on explicit BC/AD
    if (startStr.includes('BC')) {
      startYear = -startYear;
    }
    // For periods like "60-100 AD", if endStr has AD but startStr doesn't,
    // assume startStr is also AD
    else if (endStr.includes('AD') && !startStr.includes('BC')) {
      // Start year stays positive (AD)
    }
    // Default assumption for ancient periods - start is BC
    else if (!startStr.includes('AD') && !endStr.includes('AD')) {
      startYear = -startYear;
    }
    
    // Convert end year based on explicit BC/AD  
    if (endStr.includes('BC')) {
      endYear = -endYear;
    }
    // AD end dates stay positive
    
    // Check if event falls within the period range
    return eventYear >= startYear && eventYear <= endYear;
  });
}

export function getPeriodPeople(periodName: string): BiblicalPerson[] {
  const data = loadTimelineData();
  const events = getPeriodEvents(periodName);
  
  const participantIds = new Set<string>();
  events.forEach(event => {
    event.participants.forEach(p => participantIds.add(p));
  });
  
  return Array.from(participantIds)
    .map(id => data.persons.find(p => p.id === id))
    .filter(Boolean) as BiblicalPerson[];
}

export function getPeriodRegions(periodName: string): BiblicalRegion[] {
  const data = loadTimelineData();
  const period = getTimelinePeriods().find(p => p.name === periodName);
  if (!period) return [];
  
  return data.regions.filter(region => {
    const regionDates = region.estimated_dates.toLowerCase();
    
    // For New Testament period, specifically include NT regions
    if (period.dateRange === "4 BC-60 AD") {
      return regionDates.includes('ad') || 
             regionDates.includes('testament') ||
             region.time_period.toLowerCase().includes('testament');
    }
    
    // General filtering - this is simplified, you might want to improve this
    return true; // For now, include all regions
  });
}

// Export functions to get all data
export function getPersons(): BiblicalPerson[] {
  const data = loadTimelineData();
  return data.persons;
}

export function getEvents(): BiblicalEvent[] {
  const data = loadTimelineData();
  return data.events;
}

export function getRegions(): BiblicalRegion[] {
  const data = loadTimelineData();
  return data.regions;
}

export function getFamilyGroups(): FamilyGroup[] {
  const data = loadTimelineData();
  return data.familyGroups;
}

export function getPersonFamilyGroup(personId: string): FamilyGroup | undefined {
  const familyGroups = getFamilyGroups();
  return familyGroups.find(group => group.founder === personId);
}