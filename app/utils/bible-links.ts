/**
 * Utility functions for generating Bible.com links
 */

// Helper function to convert biblical book names to Bible.com book codes
const BOOK_CODE_MAP: Record<string, string> = {
  // Old Testament
  'Genesis': 'GEN',
  'Exodus': 'EXO', 
  'Leviticus': 'LEV',
  'Numbers': 'NUM',
  'Deuteronomy': 'DEU',
  'Joshua': 'JOS',
  'Judges': 'JDG',
  'Ruth': 'RUT',
  '1 Samuel': '1SA',
  '2 Samuel': '2SA',
  '1 Kings': '1KI',
  '2 Kings': '2KI',
  '1 Chronicles': '1CH',
  '2 Chronicles': '2CH',
  'Ezra': 'EZR',
  'Nehemiah': 'NEH',
  'Esther': 'EST',
  'Job': 'JOB',
  'Psalms': 'PSA',
  'Proverbs': 'PRO',
  'Ecclesiastes': 'ECC',
  'Song of Solomon': 'SNG',
  'Isaiah': 'ISA',
  'Jeremiah': 'JER',
  'Lamentations': 'LAM',
  'Ezekiel': 'EZK',
  'Daniel': 'DAN',
  'Hosea': 'HOS',
  'Joel': 'JOL',
  'Amos': 'AMO',
  'Obadiah': 'OBA',
  'Jonah': 'JON',
  'Micah': 'MIC',
  'Nahum': 'NAM',
  'Habakkuk': 'HAB',
  'Zephaniah': 'ZEP',
  'Haggai': 'HAG',
  'Zechariah': 'ZEC',
  'Malachi': 'MAL',
  
  // New Testament
  'Matthew': 'MAT',
  'Mark': 'MRK',
  'Luke': 'LUK',
  'John': 'JHN',
  'Acts': 'ACT',
  'Romans': 'ROM',
  '1 Corinthians': '1CO',
  '2 Corinthians': '2CO',
  'Galatians': 'GAL',
  'Ephesians': 'EPH',
  'Philippians': 'PHP',
  'Colossians': 'COL',
  '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH',
  '1 Timothy': '1TI',
  '2 Timothy': '2TI',
  'Titus': 'TIT',
  'Philemon': 'PHM',
  'Hebrews': 'HEB',
  'James': 'JAS',
  '1 Peter': '1PE',
  '2 Peter': '2PE',
  '1 John': '1JN',
  '2 John': '2JN',
  '3 John': '3JN',
  'Jude': 'JUD',
  'Revelation': 'REV'
};

/**
 * Generate a Bible.com URL for a biblical book
 * @param bookName - Name of the biblical book (e.g., "Genesis", "Matthew")
 * @param chapter - Optional chapter number
 * @param verse - Optional verse number
 * @returns URL to Bible.com for the specified book/chapter/verse
 */
export function getBibleBookUrl(bookName: string, chapter?: number, verse?: number): string {
  // Handle book names with chapter ranges (e.g., "Genesis 1-8", "1 Kings 12-22")
  const cleanBookName = bookName.replace(/\s+\d+.*$/, '').trim();
  
  const bookCode = BOOK_CODE_MAP[cleanBookName];
  if (!bookCode) {
    // If we can't find the book code, return a general Bible.com search
    return `https://www.bible.com/search/bible?q=${encodeURIComponent(bookName)}`;
  }
  
  let url = `https://www.bible.com/bible/1/${bookCode}`;
  
  if (chapter) {
    url += `.${chapter}`;
    if (verse) {
      url += `.${verse}`;
    }
  }
  
  return url;
}

/**
 * Parse a book string that might contain chapter ranges and return appropriate URL
 * @param bookString - Book string like "Genesis 1-8" or "1 Kings 12-22"
 * @returns URL to Bible.com or null if not a biblical book
 */
export function parseBibleBookString(bookString: string): string | null {
  // Check if this is a non-biblical book entry
  if (bookString.toLowerCase().includes('historical period') || 
      bookString.toLowerCase().includes('no canonical') ||
      bookString.toLowerCase().includes('apocrypha')) {
    return null; // Don't create links for non-biblical content
  }

  // Check if it contains a chapter range
  const rangeMatch = bookString.match(/^(.+?)\s+(\d+)-(\d+)$/);
  if (rangeMatch) {
    const [, bookName, startChapter] = rangeMatch;
    // For ranges, link to the starting chapter
    return getBibleBookUrl(bookName.trim(), parseInt(startChapter));
  }
  
  // Check if it contains a single chapter
  const chapterMatch = bookString.match(/^(.+?)\s+(\d+)$/);
  if (chapterMatch) {
    const [, bookName, chapter] = chapterMatch;
    return getBibleBookUrl(bookName.trim(), parseInt(chapter));
  }
  
  // Just a book name
  return getBibleBookUrl(bookString);
}

/**
 * Get a display name for a book that's suitable for showing in the UI
 * @param bookString - Book string like "Genesis 1-8" or "Matthew"
 * @returns Formatted display name
 */
export function getBookDisplayName(bookString: string): string {
  return bookString;
}