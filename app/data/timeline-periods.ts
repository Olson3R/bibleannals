// Timeline periods data with date ranges and visual styling

import type { TimelinePeriod } from '../types/biblical';

export const timelinePeriods: TimelinePeriod[] = [
  {
    name: "Creation & Pre-Flood Era",
    slug: "creation-pre-flood-era",
    dateRange: "4004-2348 BC",
    description: "From Creation to Noah's Flood",
    colorIndex: 0, // Emerald - Creation & Nature
    primaryBooks: ["Genesis 1-8"]
  },
  {
    name: "Post-Flood & Patriarchs",
    slug: "post-flood-patriarchs",
    dateRange: "2348-1805 BC",
    description: "From Noah to Joseph's death",
    colorIndex: 1, // Blue - Waters & Covenant
    primaryBooks: ["Genesis 9-50"]
  },
  {
    name: "Egyptian Bondage",
    slug: "egyptian-bondage",
    dateRange: "1804-1491 BC",
    description: "Israel enslaved in Egypt",
    colorIndex: 2, // Amber - Desert & Bondage
    primaryBooks: ["Exodus 1-11"]
  },
  {
    name: "Wilderness & Conquest",
    slug: "wilderness-conquest",
    dateRange: "1491-1427 BC",
    description: "Exodus and conquest of Canaan",
    colorIndex: 3, // Orange - Journey & Wilderness
    primaryBooks: ["Exodus 12-40", "Leviticus", "Numbers", "Deuteronomy", "Joshua"]
  },
  {
    name: "Judges Period",
    slug: "judges-period",
    dateRange: "1427-1043 BC",
    description: "Time of the Judges",
    colorIndex: 4, // Purple - Judges & Transition
    primaryBooks: ["Judges", "Ruth", "1 Samuel 1-7"]
  },
  {
    name: "United Kingdom",
    slug: "united-kingdom",
    dateRange: "1043-930 BC",
    description: "Reigns of Saul, David, and Solomon",
    colorIndex: 5, // Red - Kingdom & Power
    primaryBooks: ["1 Samuel 8-31", "2 Samuel", "1 Kings 1-11", "1 Chronicles", "2 Chronicles 1-9", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"]
  },
  {
    name: "Divided Kingdom",
    slug: "divided-kingdom",
    dateRange: "930-586 BC",
    description: "Israel and Judah divided",
    colorIndex: 6, // Pink - Division & Conflict
    primaryBooks: ["1 Kings 12-22", "2 Kings", "2 Chronicles 10-36", "Isaiah", "Jeremiah", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah"]
  },
  {
    name: "Exile & Return",
    slug: "exile-return",
    dateRange: "586-430 BC",
    description: "Babylonian exile and return",
    colorIndex: 7, // Indigo - Exile & Return
    primaryBooks: ["Ezra", "Nehemiah", "Esther", "Daniel", "Ezekiel", "Haggai", "Zechariah", "Malachi"]
  },
  {
    name: "Intertestamental Period",
    slug: "intertestamental-period",
    dateRange: "430-6 BC",
    description: "Between Old and New Testaments",
    colorIndex: 8, // Slate - Silent Period
    primaryBooks: ["Historical period between testaments - no canonical biblical books"]
  },
  {
    name: "New Testament Era",
    slug: "new-testament-era",
    dateRange: "4 BC-60 AD",
    description: "Life of Christ and early church",
    colorIndex: 9, // Teal - New Testament & Life
    primaryBooks: ["Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1-2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1-2 Thessalonians", "1-2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1-2 Peter", "1-3 John", "Jude", "Revelation"]
  },
  {
    name: "Apostolic Age",
    slug: "apostolic-age",
    dateRange: "60-100 AD",
    description: "Completion of New Testament and apostolic ministry",
    colorIndex: 0, // Emerald - Growth & Foundation
    primaryBooks: ["Canonical completion of New Testament scriptures"]
  },
  {
    name: "Early Church Fathers",
    slug: "early-church-fathers",
    dateRange: "100-325 AD",
    description: "Church fathers and early Christian theology",
    colorIndex: 1, // Blue - Doctrine & Teaching
    primaryBooks: ["Writings of Clement, Ignatius, Polycarp, Justin Martyr, Irenaeus, Origen, Tertullian"]
  },
  {
    name: "Imperial Christianity",
    slug: "imperial-christianity", 
    dateRange: "325-500 AD",
    description: "Constantine's conversion and early Christian empire",
    colorIndex: 2, // Amber - Empire & Establishment
    primaryBooks: ["Council of Nicaea (325), Writings of Augustine, Jerome, Chrysostom"]
  },
  {
    name: "Medieval Period",
    slug: "medieval-period",
    dateRange: "500-1054 AD", 
    description: "Rise of papal authority and monasticism",
    colorIndex: 3, // Orange - Medieval & Monasticism
    primaryBooks: ["Writings of Gregory the Great, Bede, monasticism"]
  },
  {
    name: "Great Schism Era",
    slug: "great-schism-era",
    dateRange: "1054-1517 AD",
    description: "East-West church division and medieval scholasticism",
    colorIndex: 4, // Purple - Division & Scholasticism  
    primaryBooks: ["Aquinas, Anselm, scholastic theology"]
  },
  {
    name: "Protestant Reformation",
    slug: "protestant-reformation",
    dateRange: "1517-1648 AD",
    description: "Luther's reforms and Protestant denominations",
    colorIndex: 5, // Red - Reformation & Revival
    primaryBooks: ["Luther's 95 Theses, Calvin's Institutes, Reformation confessions"]
  },
  {
    name: "Age of Exploration & Missions",
    slug: "age-exploration-missions",
    dateRange: "1648-1800 AD", 
    description: "Global missions and religious expansion",
    colorIndex: 6, // Pink - Missions & Expansion
    primaryBooks: ["Missionary accounts, Pietist writings, Great Awakening"]
  },
  {
    name: "Modern Missions Movement",
    slug: "modern-missions-movement",
    dateRange: "1800-1900 AD",
    description: "Global evangelization and Bible translation",
    colorIndex: 7, // Indigo - Global Missions
    primaryBooks: ["William Carey, Hudson Taylor, missionary biographies"]
  },
  {
    name: "20th Century Christianity",
    slug: "twentieth-century-christianity",
    dateRange: "1900-2000 AD",
    description: "Pentecostalism, ecumenism, and global Christianity",
    colorIndex: 8, // Slate - Modern & Contemporary
    primaryBooks: ["Pentecostal movement, World Council of Churches, evangelical growth"]
  },
  {
    name: "Contemporary Era",
    slug: "contemporary-era", 
    dateRange: "2000-2025 AD",
    description: "Digital age Christianity and global missions",
    colorIndex: 9, // Teal - Digital & Global
    primaryBooks: ["Digital evangelization, global south Christianity, biblical archaeology"]
  }
];