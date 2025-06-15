import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import type { BiblicalPerson, BiblicalEvent, BiblicalRegion } from '../types/biblical';

let cachedData: {
  persons: BiblicalPerson[];
  events: BiblicalEvent[];
  regions: BiblicalRegion[];
} | null = null;

export function loadTimelineData() {
  if (cachedData) {
    return cachedData;
  }

  try {
    const dataDir = join(process.cwd(), 'data', 'claude');
    
    const ancestryData = readFileSync(join(dataDir, 'ancestry.yaml'), 'utf-8');
    const eventsData = readFileSync(join(dataDir, 'events.yaml'), 'utf-8');
    const regionsData = readFileSync(join(dataDir, 'regions.yaml'), 'utf-8');
    
    const ancestryYaml = yaml.load(ancestryData) as { biblical_persons: BiblicalPerson[] };
    const eventsYaml = yaml.load(eventsData) as { biblical_events: BiblicalEvent[] };
    const regionsYaml = yaml.load(regionsData) as { biblical_regions: BiblicalRegion[] };
    
    cachedData = {
      persons: ancestryYaml.biblical_persons,
      events: eventsYaml.biblical_events,
      regions: regionsYaml.biblical_regions
    };
    
    return cachedData;
  } catch (error) {
    console.error('Error loading timeline data:', error);
    return {
      persons: [],
      events: [],
      regions: []
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

export function getTimelinePeriods() {
  return [
    {
      name: "Creation & Pre-Flood Era",
      slug: "creation-pre-flood-era",
      dateRange: "4004-2348 BC",
      color: "bg-green-100 border-green-400",
      description: "From the creation of the world to Noah's flood, spanning approximately 1,656 years"
    },
    {
      name: "Post-Flood & Patriarchs",
      slug: "post-flood-patriarchs",
      dateRange: "2348-1805 BC", 
      color: "bg-blue-100 border-blue-400",
      description: "From Noah's family repopulating the earth to the death of Joseph in Egypt"
    },
    {
      name: "Egyptian Bondage",
      slug: "egyptian-bondage",
      dateRange: "1804-1491 BC",
      color: "bg-yellow-100 border-yellow-400", 
      description: "Israel's 400+ years of slavery in Egypt until the Exodus under Moses"
    },
    {
      name: "Wilderness & Conquest",
      slug: "wilderness-conquest",
      dateRange: "1491-1427 BC",
      color: "bg-orange-100 border-orange-400",
      description: "40 years in wilderness and conquest of the Promised Land under Joshua"
    },
    {
      name: "Judges Period",
      slug: "judges-period", 
      dateRange: "1427-1043 BC",
      color: "bg-purple-100 border-purple-400",
      description: "Cycles of sin, oppression, and deliverance through judges like Gideon and Samson"
    },
    {
      name: "United Kingdom",
      slug: "united-kingdom",
      dateRange: "1043-930 BC", 
      color: "bg-red-100 border-red-400",
      description: "Israel united under kings Saul, David, and Solomon; temple built"
    },
    {
      name: "Divided Kingdom",
      slug: "divided-kingdom",
      dateRange: "930-586 BC",
      color: "bg-pink-100 border-pink-400", 
      description: "Kingdom splits into Israel and Judah; prophets warn of judgment"
    },
    {
      name: "Exile & Return",
      slug: "exile-return",
      dateRange: "586-430 BC",
      color: "bg-indigo-100 border-indigo-400",
      description: "Babylonian exile, return under Cyrus, temple rebuilt, walls restored"
    },
    {
      name: "Intertestamental Period",
      slug: "intertestamental-period",
      dateRange: "430-6 BC", 
      color: "bg-gray-100 border-gray-400",
      description: "400 years of prophetic silence; Greek and Roman influence"
    },
    {
      name: "New Testament Era",
      slug: "new-testament-era",
      dateRange: "6 BC-60 AD",
      color: "bg-emerald-100 border-emerald-400", 
      description: "Birth, life, death, and resurrection of Jesus; early church established"
    }
  ];
}

export function getPeriodBySlug(slug: string) {
  return getTimelinePeriods().find(p => p.slug === slug);
}

export function getPeriodEvents(periodName: string): BiblicalEvent[] {
  const data = loadTimelineData();
  const period = getTimelinePeriods().find(p => p.name === periodName);
  if (!period) return [];
  
  return data.events.filter(event => {
    // Same filtering logic as in TimelinePeriodCard
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
    if (period.dateRange === "6 BC-60 AD") {
      return regionDates.includes('ad') || 
             regionDates.includes('testament') ||
             region.time_period.toLowerCase().includes('testament');
    }
    
    // General filtering - this is simplified, you might want to improve this
    return true; // For now, include all regions
  });
}