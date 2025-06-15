// Utility functions for generating Bible study URLs

/**
 * Converts KJV references to bible.com URLs
 * @param reference - Reference like "GEN.1.1.KJV"
 * @returns URL to bible.com or empty string if invalid
 */
export function getBibleUrl(reference: string): string {
  if (!reference) return '';
  
  // Convert reference like "GEN.1.1.KJV" to bible.com format
  const cleanRef = reference.replace('.KJV', '');
  const parts = cleanRef.split('.');
  
  if (parts.length >= 3) {
    const book = parts[0];
    const chapter = parts[1];
    const verse = parts[2];
    
    // Use the abbreviation directly - bible.com can handle them
    return `https://www.bible.com/bible/1/${book}.${chapter}.${verse}`;
  }
  
  return '';
}

/**
 * Creates Bible study search URLs for regions
 * @param regionName - Name of the region to search for
 * @returns URL to bible.com search results
 */
export function getRegionStudyUrl(regionName: string): string {
  // Create a search URL for the region on bible.com
  const searchTerm = encodeURIComponent(regionName);
  return `https://www.bible.com/search/bible?q=${searchTerm}`;
}