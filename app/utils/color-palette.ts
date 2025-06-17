// Color palette utility for consistent light/dark mode colors across periods

export interface ColorScheme {
  background: string;
  border: string;
  text: string;
  textSecondary: string;
}

export interface PeriodColorPalette {
  light: ColorScheme;
  dark: ColorScheme;
}

// Define a consistent color palette for periods
export const periodColorPalette: PeriodColorPalette[] = [
  // Green - Creation & Nature
  {
    light: {
      background: 'bg-emerald-100',
      border: 'border-emerald-400',
      text: 'text-emerald-900',
      textSecondary: 'text-emerald-700'
    },
    dark: {
      background: 'dark:bg-emerald-900/30',
      border: 'dark:border-emerald-600',
      text: 'dark:text-emerald-100',
      textSecondary: 'dark:text-emerald-200'
    }
  },
  // Blue - Waters & Covenant
  {
    light: {
      background: 'bg-blue-100',
      border: 'border-blue-400',
      text: 'text-blue-900',
      textSecondary: 'text-blue-700'
    },
    dark: {
      background: 'dark:bg-blue-900/30',
      border: 'dark:border-blue-600',
      text: 'dark:text-blue-100',
      textSecondary: 'dark:text-blue-200'
    }
  },
  // Amber - Desert & Bondage
  {
    light: {
      background: 'bg-amber-100',
      border: 'border-amber-400',
      text: 'text-amber-900',
      textSecondary: 'text-amber-700'
    },
    dark: {
      background: 'dark:bg-amber-900/30',
      border: 'dark:border-amber-600',
      text: 'dark:text-amber-100',
      textSecondary: 'dark:text-amber-200'
    }
  },
  // Orange - Journey & Wilderness
  {
    light: {
      background: 'bg-orange-100',
      border: 'border-orange-400',
      text: 'text-orange-900',
      textSecondary: 'text-orange-700'
    },
    dark: {
      background: 'dark:bg-orange-900/30',
      border: 'dark:border-orange-600',
      text: 'dark:text-orange-100',
      textSecondary: 'dark:text-orange-200'
    }
  },
  // Purple - Judges & Transition
  {
    light: {
      background: 'bg-purple-100',
      border: 'border-purple-400',
      text: 'text-purple-900',
      textSecondary: 'text-purple-700'
    },
    dark: {
      background: 'dark:bg-purple-900/30',
      border: 'dark:border-purple-600',
      text: 'dark:text-purple-100',
      textSecondary: 'dark:text-purple-200'
    }
  },
  // Red - Kingdom & Power
  {
    light: {
      background: 'bg-red-100',
      border: 'border-red-400',
      text: 'text-red-900',
      textSecondary: 'text-red-700'
    },
    dark: {
      background: 'dark:bg-red-900/30',
      border: 'dark:border-red-600',
      text: 'dark:text-red-100',
      textSecondary: 'dark:text-red-200'
    }
  },
  // Pink - Division & Conflict
  {
    light: {
      background: 'bg-pink-100',
      border: 'border-pink-400',
      text: 'text-pink-900',
      textSecondary: 'text-pink-700'
    },
    dark: {
      background: 'dark:bg-pink-900/30',
      border: 'dark:border-pink-600',
      text: 'dark:text-pink-100',
      textSecondary: 'dark:text-pink-200'
    }
  },
  // Indigo - Exile & Return
  {
    light: {
      background: 'bg-indigo-100',
      border: 'border-indigo-400',
      text: 'text-indigo-900',
      textSecondary: 'text-indigo-700'
    },
    dark: {
      background: 'dark:bg-indigo-900/30',
      border: 'dark:border-indigo-600',
      text: 'dark:text-indigo-100',
      textSecondary: 'dark:text-indigo-200'
    }
  },
  // Slate - Silent Period
  {
    light: {
      background: 'bg-slate-100',
      border: 'border-slate-400',
      text: 'text-slate-900',
      textSecondary: 'text-slate-700'
    },
    dark: {
      background: 'dark:bg-slate-800/30',
      border: 'dark:border-slate-600',
      text: 'dark:text-slate-100',
      textSecondary: 'dark:text-slate-200'
    }
  },
  // Teal - New Testament & Life
  {
    light: {
      background: 'bg-teal-100',
      border: 'border-teal-400',
      text: 'text-teal-900',
      textSecondary: 'text-teal-700'
    },
    dark: {
      background: 'dark:bg-teal-900/30',
      border: 'dark:border-teal-600',
      text: 'dark:text-teal-100',
      textSecondary: 'dark:text-teal-200'
    }
  }
];

/**
 * Get color scheme for a period by index
 * @param periodIndex - Index of the period (0-based)
 * @returns Combined light and dark mode classes
 */
export function getPeriodColors(periodIndex: number): string {
  const colors = periodColorPalette[periodIndex % periodColorPalette.length];
  
  return [
    colors.light.background,
    colors.dark.background,
    colors.light.border,
    colors.dark.border
  ].join(' ');
}

/**
 * Get text colors for a period by index
 * @param periodIndex - Index of the period (0-based)
 * @returns Combined light and dark mode text classes
 */
export function getPeriodTextColors(periodIndex: number): {
  primary: string;
  secondary: string;
} {
  const colors = periodColorPalette[periodIndex % periodColorPalette.length];
  
  return {
    primary: `${colors.light.text} ${colors.dark.text}`,
    secondary: `${colors.light.textSecondary} ${colors.dark.textSecondary}`
  };
}

/**
 * Get background and border colors for a period by index
 * @param periodIndex - Index of the period (0-based)
 * @returns Background and border classes
 */
export function getPeriodBackgroundColors(periodIndex: number): {
  background: string;
  border: string;
} {
  const colors = periodColorPalette[periodIndex % periodColorPalette.length];
  
  return {
    background: `${colors.light.background} ${colors.dark.background}`,
    border: `${colors.light.border} ${colors.dark.border}`
  };
}