/**
 * Responsive Utilities
 * Provides consistent responsive breakpoints and helper functions
 */

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const getBreakpoint = (): keyof typeof BREAKPOINTS => {
  const width = window.innerWidth;
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

export const isMobile = (): boolean => window.innerWidth < BREAKPOINTS.md;
export const isTablet = (): boolean => 
  window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
export const isDesktop = (): boolean => window.innerWidth >= BREAKPOINTS.lg;

/**
 * Responsive spacing classes
 */
export const SPACING = {
  container: 'px-4 sm:px-5 md:px-6 lg:px-8',
  section: 'mb-6 sm:mb-8 md:mb-10',
  card: 'p-4 sm:p-5 md:p-6',
  button: 'px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3',
  input: 'px-3 py-2 sm:px-4 sm:py-2.5 md:px-4 md:py-3',
} as const;

/**
 * Responsive text sizes
 */
export const TEXT_SIZES = {
  h1: 'text-2xl sm:text-3xl md:text-4xl',
  h2: 'text-xl sm:text-2xl md:text-3xl',
  h3: 'text-lg sm:text-xl md:text-2xl',
  body: 'text-sm sm:text-base',
  small: 'text-xs sm:text-sm',
} as const;

/**
 * Responsive grid classes
 */
export const GRID = {
  cards1: 'grid grid-cols-1',
  cards2: 'grid grid-cols-1 sm:grid-cols-2',
  cards3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  cards4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  cards6: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
} as const;

/**
 * Touch-friendly minimum sizes
 */
export const TOUCH = {
  minButton: 'min-h-[44px] min-w-[44px]',
  minInput: 'min-h-[44px]',
  minIcon: 'w-5 h-5 sm:w-6 sm:h-6',
} as const;
