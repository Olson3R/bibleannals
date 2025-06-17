// Timeline periods data with date ranges and visual styling

import type { TimelinePeriod } from '../types/biblical';

export const timelinePeriods: TimelinePeriod[] = [
  {
    name: "Creation & Pre-Flood Era",
    slug: "creation-pre-flood-era",
    dateRange: "4004-2348 BC",
    description: "From Creation to Noah's Flood",
    colorIndex: 0 // Emerald - Creation & Nature
  },
  {
    name: "Post-Flood & Patriarchs",
    slug: "post-flood-patriarchs",
    dateRange: "2348-1805 BC",
    description: "From Noah to Joseph's death",
    colorIndex: 1 // Blue - Waters & Covenant
  },
  {
    name: "Egyptian Bondage",
    slug: "egyptian-bondage",
    dateRange: "1804-1491 BC",
    description: "Israel enslaved in Egypt",
    colorIndex: 2 // Amber - Desert & Bondage
  },
  {
    name: "Wilderness & Conquest",
    slug: "wilderness-conquest",
    dateRange: "1491-1427 BC",
    description: "Exodus and conquest of Canaan",
    colorIndex: 3 // Orange - Journey & Wilderness
  },
  {
    name: "Judges Period",
    slug: "judges-period",
    dateRange: "1427-1043 BC",
    description: "Time of the Judges",
    colorIndex: 4 // Purple - Judges & Transition
  },
  {
    name: "United Kingdom",
    slug: "united-kingdom",
    dateRange: "1043-930 BC",
    description: "Reigns of Saul, David, and Solomon",
    colorIndex: 5 // Red - Kingdom & Power
  },
  {
    name: "Divided Kingdom",
    slug: "divided-kingdom",
    dateRange: "930-586 BC",
    description: "Israel and Judah divided",
    colorIndex: 6 // Pink - Division & Conflict
  },
  {
    name: "Exile & Return",
    slug: "exile-return",
    dateRange: "586-430 BC",
    description: "Babylonian exile and return",
    colorIndex: 7 // Indigo - Exile & Return
  },
  {
    name: "Intertestamental Period",
    slug: "intertestamental-period",
    dateRange: "430-6 BC",
    description: "Between Old and New Testaments",
    colorIndex: 8 // Slate - Silent Period
  },
  {
    name: "New Testament Era",
    slug: "new-testament-era",
    dateRange: "6 BC-60 AD",
    description: "Life of Christ and early church",
    colorIndex: 9 // Teal - New Testament & Life
  }
];