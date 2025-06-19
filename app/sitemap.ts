import { MetadataRoute } from 'next'
import { readFileSync } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'
import { timelinePeriods } from './data/timeline-periods'

interface BiblicalEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  participants: string[];
  references: string[];
}

interface BiblicalPerson {
  id: string;
  name: string;
  gender?: string;
  ethnicity?: string;
  age?: string;
  birth_date?: string;
  death_date?: string;
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

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bibleannals.com'
  const lastModified = new Date()

  // Load data files
  const eventsData = yaml.load(
    readFileSync(join(process.cwd(), 'data/events.yaml'), 'utf8')
  ) as { biblical_events: BiblicalEvent[] }

  const personsData = yaml.load(
    readFileSync(join(process.cwd(), 'data/people.yaml'), 'utf8')
  ) as { biblical_persons: BiblicalPerson[] }

  const regionsData = yaml.load(
    readFileSync(join(process.cwd(), 'data/regions.yaml'), 'utf8')
  ) as { biblical_regions: BiblicalRegion[] }

  const events = eventsData.biblical_events
  const persons = personsData.biblical_persons
  const regions = regionsData.biblical_regions

  const sitemap: MetadataRoute.Sitemap = [
    // Home page
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Timeline periods
    ...timelinePeriods.map(period => ({
      url: `${baseUrl}/periods/${period.slug}/`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    // Period sub-pages
    ...timelinePeriods.flatMap(period => [
      {
        url: `${baseUrl}/periods/${period.slug}/events/`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/periods/${period.slug}/people/`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/periods/${period.slug}/regions/`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }
    ]),
    // Events
    ...events.map(event => ({
      url: `${baseUrl}/events/${event.id}/`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
    // People
    ...persons.map(person => ({
      url: `${baseUrl}/people/${person.id}/`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
    // Regions
    ...regions.map(region => ({
      url: `${baseUrl}/regions/${region.id}/`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ]

  return sitemap
}