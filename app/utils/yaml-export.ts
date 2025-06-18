/**
 * Utility functions for exporting page data as YAML files
 */

interface YamlExportData {
  metadata: {
    exported_at: string;
    page_type: string;
    page_title: string;
    date_range?: string;
    filters_applied?: {
      date_range?: { min_year?: number; max_year?: number };
      advanced_filters?: Record<string, unknown>;
    };
  };
  period?: unknown;
  timeline_periods?: unknown[];
  events?: unknown[];
  people?: unknown[];
  regions?: unknown[];
  ethnicities?: string[];
  event_types?: string[];
  locations?: string[];
}

/**
 * Convert data to YAML string
 */
export function convertToYaml(data: YamlExportData): string {
  // Simple YAML serialization
  const yamlLines: string[] = [];
  
  const addValue = (key: string, value: unknown, indent = 0) => {
    const spaces = '  '.repeat(indent);
    
    if (value === null || value === undefined) {
      yamlLines.push(`${spaces}${key}: null`);
    } else if (typeof value === 'string') {
      // Escape special characters and wrap in quotes if needed
      const needsQuotes = /[:\n\r\t\[\]{}|>*&!%@`#]/.test(value) || value.trim() !== value;
      const escaped = value.replace(/"/g, '\\"');
      yamlLines.push(`${spaces}${key}: ${needsQuotes ? `"${escaped}"` : value}`);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      yamlLines.push(`${spaces}${key}: ${value}`);
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        yamlLines.push(`${spaces}${key}: []`);
      } else {
        yamlLines.push(`${spaces}${key}:`);
        value.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            yamlLines.push(`${spaces}  -`);
            Object.entries(item).forEach(([k, v]) => {
              addValue(k, v, indent + 2);
            });
          } else {
            const needsQuotes = typeof item === 'string' && /[:\n\r\t\[\]{}|>*&!%@`#]/.test(item);
            const escaped = typeof item === 'string' ? item.replace(/"/g, '\\"') : item;
            yamlLines.push(`${spaces}  - ${needsQuotes ? `"${escaped}"` : item}`);
          }
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      yamlLines.push(`${spaces}${key}:`);
      Object.entries(value).forEach(([k, v]) => {
        addValue(k, v, indent + 1);
      });
    }
  };

  // Add each top-level property
  Object.entries(data).forEach(([key, value]) => {
    addValue(key, value);
  });

  return yamlLines.join('\n');
}

/**
 * Generate filename for YAML export
 */
export function generateYamlFilename(pageType: string, pageTitle: string): string {
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const sanitizedTitle = pageTitle.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `biblical-timeline-${pageType}-${sanitizedTitle}-${timestamp}.yaml`;
}

/**
 * Download YAML file
 */
export function downloadYaml(data: YamlExportData, filename: string): void {
  const yamlContent = convertToYaml(data);
  const blob = new Blob([yamlContent], { type: 'text/yaml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to extract unique values from arrays
 */
export function extractUniqueValues<T>(
  items: T[], 
  extractor: (item: T) => string | undefined
): string[] {
  const values = new Set<string>();
  items.forEach(item => {
    const value = extractor(item);
    if (value) values.add(value);
  });
  return Array.from(values).sort();
}