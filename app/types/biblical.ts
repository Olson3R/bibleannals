// TypeScript interfaces for Bible Annals application

export interface BiblicalPerson {
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
  tags?: string[];
}

export interface FamilyGroup {
  name: string;
  founder: string;
  territory?: string;
  special_role?: string;
  characteristics: string[];
  references: string[];
}

export interface BiblicalEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  participants: string[];
  references: string[];
  tags?: string[];
}

export interface BiblicalRegion {
  id: string;
  name: string;
  description: string;
  location: string;
  time_period: string;
  estimated_dates: string;
  notable_people: string[];
  key_features?: string[];
  population_estimate?: string;
  government_type?: string;
}

export interface TimelinePeriod {
  name: string;
  slug: string;
  dateRange: string;
  description: string;
  colorIndex: number;
  primaryBooks: string[];
}

export interface SearchResults {
  persons: BiblicalPerson[];
  events: BiblicalEvent[];
  regions: BiblicalRegion[];
  periods: TimelinePeriod[];
}

export interface DateRange {
  startYear: number | null;
  endYear: number | null;
}

export type ViewType = 'overview' | 'period-events' | 'period-people' | 'period-regions' | 'event-detail' | 'person-detail' | 'region-detail';

export type Era = 'BC' | 'AD';