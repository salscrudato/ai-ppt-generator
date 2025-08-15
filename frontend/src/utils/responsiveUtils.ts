/**
 * Responsive Design Utilities
 * 
 * Provides utilities for handling responsive design patterns, breakpoints,
 * and mobile-first development with Tailwind CSS integration.
 * 
 * Features:
 * - Breakpoint detection and management
 * - Mobile-first utilities
 * - Touch-friendly component helpers
 * - Responsive class generation
 * - Viewport utilities
 * 
 * @version 1.0.0
 */

/**
 * Tailwind CSS breakpoints
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Device type detection
 */
export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  currentBreakpoint: Breakpoint | 'xs';
  viewportWidth: number;
  viewportHeight: number;
}

/**
 * Responsive utilities class
 */
export class ResponsiveUtils {
  private mediaQueries: Map<Breakpoint, MediaQueryList> = new Map();
  private listeners: Map<string, (info: DeviceInfo) => void> = new Map();

  constructor() {
    this.initializeMediaQueries();
  }

  /**
   * Initialize media queries for breakpoint detection
   */
  private initializeMediaQueries(): void {
    if (typeof window === 'undefined') return;

    Object.entries(BREAKPOINTS).forEach(([breakpoint, width]) => {
      const mediaQuery = window.matchMedia(`(min-width: ${width}px)`);
      this.mediaQueries.set(breakpoint as Breakpoint, mediaQuery);
    });
  }

  /**
   * Get current device information
   */
  getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        currentBreakpoint: 'lg',
        viewportWidth: 1024,
        viewportHeight: 768,
      };
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Determine current breakpoint
    let currentBreakpoint: Breakpoint | 'xs' = 'xs';
    for (const [breakpoint, width] of Object.entries(BREAKPOINTS)) {
      if (viewportWidth >= width) {
        currentBreakpoint = breakpoint as Breakpoint;
      }
    }

    // Device type detection
    const isMobile = viewportWidth < BREAKPOINTS.md;
    const isTablet = viewportWidth >= BREAKPOINTS.md && viewportWidth < BREAKPOINTS.lg;
    const isDesktop = viewportWidth >= BREAKPOINTS.lg;

    return {
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
      currentBreakpoint,
      viewportWidth,
      viewportHeight,
    };
  }

  /**
   * Check if current viewport matches breakpoint
   */
  isBreakpoint(breakpoint: Breakpoint): boolean {
    const mediaQuery = this.mediaQueries.get(breakpoint);
    return mediaQuery ? mediaQuery.matches : false;
  }

  /**
   * Check if viewport is at least the specified breakpoint
   */
  isAtLeast(breakpoint: Breakpoint): boolean {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= BREAKPOINTS[breakpoint];
  }

  /**
   * Check if viewport is below the specified breakpoint
   */
  isBelow(breakpoint: Breakpoint): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < BREAKPOINTS[breakpoint];
  }

  /**
   * Generate responsive classes based on device info
   */
  getResponsiveClasses(deviceInfo?: DeviceInfo): {
    container: string;
    grid: string;
    text: string;
    spacing: string;
    button: string;
  } {
    const info = deviceInfo || this.getDeviceInfo();

    return {
      container: info.isMobile 
        ? 'container-app px-4' 
        : info.isTablet 
        ? 'container-narrow px-6' 
        : 'container-wide px-8',
      
      grid: info.isMobile 
        ? 'grid grid-cols-1 gap-4' 
        : info.isTablet 
        ? 'grid grid-cols-2 gap-6' 
        : 'grid grid-cols-3 lg:grid-cols-4 gap-6',
      
      text: info.isMobile 
        ? 'text-sm' 
        : info.isTablet 
        ? 'text-base' 
        : 'text-lg',
      
      spacing: info.isMobile 
        ? 'p-4 gap-4' 
        : info.isTablet 
        ? 'p-6 gap-6' 
        : 'p-8 gap-8',
      
      button: info.isTouchDevice 
        ? 'btn-base touch-target min-h-[44px]' 
        : 'btn-base',
    };
  }

  /**
   * Generate mobile-first responsive class string
   */
  generateResponsiveClasses(config: {
    base: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  }): string {
    const classes = [config.base];

    if (config.sm) classes.push(`sm:${config.sm}`);
    if (config.md) classes.push(`md:${config.md}`);
    if (config.lg) classes.push(`lg:${config.lg}`);
    if (config.xl) classes.push(`xl:${config.xl}`);
    if (config['2xl']) classes.push(`2xl:${config['2xl']}`);

    return classes.join(' ');
  }

  /**
   * Get touch-friendly classes for interactive elements
   */
  getTouchFriendlyClasses(isTouchDevice?: boolean): string {
    const isTouch = isTouchDevice ?? this.getDeviceInfo().isTouchDevice;
    
    return isTouch 
      ? 'min-h-[44px] min-w-[44px] touch-manipulation' 
      : '';
  }

  /**
   * Listen for breakpoint changes
   */
  onBreakpointChange(id: string, callback: (info: DeviceInfo) => void): void {
    this.listeners.set(id, callback);

    // Set up resize listener if this is the first listener
    if (this.listeners.size === 1) {
      this.setupResizeListener();
    }
  }

  /**
   * Remove breakpoint change listener
   */
  removeBreakpointListener(id: string): void {
    this.listeners.delete(id);

    // Remove resize listener if no more listeners
    if (this.listeners.size === 0) {
      this.removeResizeListener();
    }
  }

  /**
   * Setup resize listener
   */
  private setupResizeListener(): void {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const deviceInfo = this.getDeviceInfo();
      this.listeners.forEach(callback => callback(deviceInfo));
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
  }

  /**
   * Remove resize listener
   */
  private removeResizeListener(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('resize', this.setupResizeListener);
    window.removeEventListener('orientationchange', this.setupResizeListener);
  }

  /**
   * Get optimal column count for grid layouts
   */
  getOptimalColumns(itemWidth: number = 280, gap: number = 24): number {
    const deviceInfo = this.getDeviceInfo();
    const availableWidth = deviceInfo.viewportWidth - (gap * 2); // Account for container padding
    
    const columns = Math.floor(availableWidth / (itemWidth + gap));
    return Math.max(1, Math.min(columns, 6)); // Between 1 and 6 columns
  }

  /**
   * Check if drag and drop should be enabled
   */
  shouldEnableDragDrop(): boolean {
    const deviceInfo = this.getDeviceInfo();
    // Disable drag and drop on touch devices for better UX
    return !deviceInfo.isTouchDevice && deviceInfo.isDesktop;
  }

  /**
   * Get mobile-friendly navigation classes
   */
  getMobileNavClasses(): {
    container: string;
    menu: string;
    item: string;
    toggle: string;
  } {
    const deviceInfo = this.getDeviceInfo();

    return {
      container: deviceInfo.isMobile 
        ? 'fixed inset-x-0 top-0 z-50 bg-white border-b border-slate-200' 
        : 'relative bg-transparent',
      
      menu: deviceInfo.isMobile 
        ? 'absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg' 
        : 'flex items-center space-x-6',
      
      item: deviceInfo.isMobile 
        ? 'block px-4 py-3 text-base border-b border-slate-100 last:border-b-0' 
        : 'inline-flex items-center px-3 py-2 text-sm',
      
      toggle: deviceInfo.isMobile 
        ? 'block p-2 text-slate-600 hover:text-slate-900' 
        : 'hidden',
    };
  }

  /**
   * Get responsive modal classes
   */
  getModalClasses(): {
    overlay: string;
    container: string;
    content: string;
  } {
    const deviceInfo = this.getDeviceInfo();

    return {
      overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center',
      
      container: deviceInfo.isMobile 
        ? 'p-4 w-full h-full flex items-end sm:items-center' 
        : 'p-4 w-full flex items-center justify-center',
      
      content: deviceInfo.isMobile 
        ? 'bg-white rounded-t-2xl sm:rounded-2xl w-full max-h-[90vh] sm:max-w-lg sm:w-full' 
        : 'bg-white rounded-2xl shadow-large max-w-lg w-full max-h-[90vh]',
    };
  }
}

/**
 * Hook-like function for React components
 */
export function useResponsive() {
  const utils = new ResponsiveUtils();
  return {
    deviceInfo: utils.getDeviceInfo(),
    isBreakpoint: utils.isBreakpoint.bind(utils),
    isAtLeast: utils.isAtLeast.bind(utils),
    isBelow: utils.isBelow.bind(utils),
    getResponsiveClasses: utils.getResponsiveClasses.bind(utils),
    generateResponsiveClasses: utils.generateResponsiveClasses.bind(utils),
    getTouchFriendlyClasses: utils.getTouchFriendlyClasses.bind(utils),
    shouldEnableDragDrop: utils.shouldEnableDragDrop.bind(utils),
    getOptimalColumns: utils.getOptimalColumns.bind(utils),
  };
}

// Export singleton instance
export const responsiveUtils = new ResponsiveUtils();
export default responsiveUtils;
