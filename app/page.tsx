import { Suspense } from 'react';
import { promises as fs } from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { BiblicalTimeline } from './components/BiblicalTimeline';

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

interface AncestryData {
  biblical_persons: BiblicalPerson[];
}

interface EventsData {
  biblical_events: BiblicalEvent[];
  locations: Record<string, string>;
}

interface RegionsData {
  biblical_regions: BiblicalRegion[];
}


export default async function Home() {
  // Read and parse all YAML files
  const ancestryPath = path.join(process.cwd(), 'data', 'claude', 'ancestry.yaml');
  const regionsPath = path.join(process.cwd(), 'data', 'claude', 'regions.yaml');
  const eventsPath = path.join(process.cwd(), 'data', 'claude', 'events.yaml');
  
  const ancestryContents = await fs.readFile(ancestryPath, 'utf8');
  const regionsContents = await fs.readFile(regionsPath, 'utf8');
  const eventsContents = await fs.readFile(eventsPath, 'utf8');
  
  const ancestryData = yaml.load(ancestryContents) as AncestryData;
  const regionsData = yaml.load(regionsContents) as RegionsData;
  const eventsData = yaml.load(eventsContents) as EventsData;

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <BiblicalTimeline 
        events={eventsData.biblical_events}
        persons={ancestryData.biblical_persons}
        regions={regionsData.biblical_regions}
      />
    </Suspense>
  );
}