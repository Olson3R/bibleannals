// Timeline periods data with date ranges and visual styling

import type { TimelinePeriod } from '../types/biblical';

export const timelinePeriods: TimelinePeriod[] = [
  {
    name: "Creation & Pre-Flood Era",
    dateRange: "4004-2348 BC",
    description: "From Creation to Noah's Flood",
    color: "bg-green-100 border-green-400"
  },
  {
    name: "Post-Flood & Patriarchs",
    dateRange: "2348-1805 BC",
    description: "From Noah to Joseph's death",
    color: "bg-blue-100 border-blue-400"
  },
  {
    name: "Egyptian Bondage",
    dateRange: "1804-1491 BC",
    description: "Israel enslaved in Egypt",
    color: "bg-yellow-100 border-yellow-400"
  },
  {
    name: "Wilderness & Conquest",
    dateRange: "1491-1427 BC",
    description: "Exodus and conquest of Canaan",
    color: "bg-orange-100 border-orange-400"
  },
  {
    name: "Judges Period",
    dateRange: "1427-1043 BC",
    description: "Time of the Judges",
    color: "bg-purple-100 border-purple-400"
  },
  {
    name: "United Kingdom",
    dateRange: "1043-930 BC",
    description: "Reigns of Saul, David, and Solomon",
    color: "bg-red-100 border-red-400"
  },
  {
    name: "Divided Kingdom",
    dateRange: "930-586 BC",
    description: "Israel and Judah divided",
    color: "bg-pink-100 border-pink-400"
  },
  {
    name: "Exile & Return",
    dateRange: "586-430 BC",
    description: "Babylonian exile and return",
    color: "bg-indigo-100 border-indigo-400"
  },
  {
    name: "Intertestamental Period",
    dateRange: "430-6 BC",
    description: "Between Old and New Testaments",
    color: "bg-gray-100 border-gray-400"
  },
  {
    name: "New Testament Era",
    dateRange: "6 BC-60 AD",
    description: "Life of Christ and early church",
    color: "bg-emerald-100 border-emerald-400"
  }
];