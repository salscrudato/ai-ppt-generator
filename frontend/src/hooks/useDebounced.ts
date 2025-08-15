/**
 * Debounced Value Hook
 * 
 * Provides debounced values for real-time preview updates.
 * Ensures smooth performance by limiting update frequency.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { useState, useEffect } from 'react';

/**
 * Hook that debounces a value
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
export function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that provides a debounced callback
 * 
 * @param callback - The callback function to debounce
 * @param delay - Delay in milliseconds
 * @param deps - Dependencies array
 * @returns The debounced callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T>(() => callback);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay, ...deps]);

  return debouncedCallback;
}

/**
 * Hook for debounced slide spec updates
 * 
 * @param spec - The slide specification
 * @param delay - Delay in milliseconds (default: 200ms)
 * @returns The debounced slide spec
 */
export function useDebouncedSlideSpec<T>(spec: T, delay: number = 200): T {
  return useDebounced(spec, delay);
}
