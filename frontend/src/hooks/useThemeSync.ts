/**
 * Enhanced Theme Synchronization Hook
 *
 * Provides centralized theme management with synchronization across components
 * Features:
 * - Cross-component theme synchronization
 * - Real-time sync status monitoring
 * - Debug logging for troubleshooting
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useThemeContext } from '../contexts/ThemeContext';

interface ThemeSyncOptions {
  /** Initial theme ID */
  initialThemeId?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Auto-sync with context */
  autoSync?: boolean;
}

interface ThemeSyncState {
  /** Current theme ID */
  themeId: string;
  /** Previous theme ID */
  previousThemeId: string | null;
  /** Whether sync is in progress */
  isSyncing: boolean;
  /** Last sync timestamp */
  lastSyncTime: Date | null;
  /** Sync status */
  syncStatus: 'synced' | 'out-of-sync' | 'syncing' | 'error';
}

interface ThemeSyncActions {
  /** Set theme and sync across components */
  setTheme: (themeId: string, source?: string) => void;
  /** Force sync with context */
  forceSync: () => void;
  /** Reset to default theme */
  resetTheme: () => void;
}

export type ThemeSyncReturn = ThemeSyncState & ThemeSyncActions;

const DEFAULT_THEME_ID = 'corporate-blue';

export function useThemeSync(options: ThemeSyncOptions = {}): ThemeSyncReturn {
  const {
    initialThemeId,
    debug = false,
    autoSync = true
  } = options;

  // Get theme context
  const { themeId: contextThemeId, setThemeId: setContextThemeId } = useThemeContext();
  
  // Internal state
  const [state, setState] = useState<ThemeSyncState>(() => ({
    themeId: initialThemeId || contextThemeId || DEFAULT_THEME_ID,
    previousThemeId: null,
    isSyncing: false,
    lastSyncTime: null,
    syncStatus: 'synced'
  }));

  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // Debug logging helper
  const debugLog = useCallback((message: string, data?: any) => {
    if (debug) {
      console.log(`🎨 ThemeSync: ${message}`, data || '');
    }
  }, [debug]);

  // Update sync status
  const updateSyncStatus = useCallback((status: ThemeSyncState['syncStatus']) => {
    if (!mountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      syncStatus: status,
      lastSyncTime: new Date()
    }));
  }, []);

  // Set theme with synchronization
  const setTheme = useCallback((themeId: string, source = 'manual') => {
    if (!mountedRef.current) return;
    
    debugLog(`Setting theme to ${themeId}`, { source, current: state.themeId });
    
    setState(prev => ({
      ...prev,
      previousThemeId: prev.themeId,
      themeId,
      isSyncing: true,
      syncStatus: 'syncing'
    }));

    // Clear any existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Sync with context after a brief delay to batch updates
    syncTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      
      try {
        if (autoSync && contextThemeId !== themeId) {
          setContextThemeId(themeId);
          debugLog(`Synced with context`, { themeId, source });
        }
        
        setState(prev => ({
          ...prev,
          isSyncing: false,
          syncStatus: 'synced',
          lastSyncTime: new Date()
        }));
      } catch (error) {
        debugLog(`Sync error`, { error, themeId });
        setState(prev => ({
          ...prev,
          isSyncing: false,
          syncStatus: 'error'
        }));
      }
    }, 100);
  }, [state.themeId, contextThemeId, setContextThemeId, autoSync, debugLog]);



  // Force sync with context
  const forceSync = useCallback(() => {
    if (!mountedRef.current) return;
    
    debugLog('Force sync requested', { contextThemeId, currentThemeId: state.themeId });
    
    if (contextThemeId && contextThemeId !== state.themeId) {
      setTheme(contextThemeId, 'force-sync');
    } else {
      updateSyncStatus('synced');
    }
  }, [contextThemeId, state.themeId, setTheme, debugLog, updateSyncStatus]);

  // Reset to default theme
  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME_ID, 'reset');
  }, [setTheme]);

  // Auto-sync with context changes
  useEffect(() => {
    if (!autoSync || !contextThemeId) return;
    
    if (contextThemeId !== state.themeId && !state.isSyncing) {
      debugLog('Context theme changed, auto-syncing', { 
        contextThemeId, 
        currentThemeId: state.themeId 
      });
      
      setState(prev => ({
        ...prev,
        previousThemeId: prev.themeId,
        themeId: contextThemeId,
        syncStatus: 'synced',
        lastSyncTime: new Date()
      }));
    }
  }, [contextThemeId, state.themeId, state.isSyncing, autoSync, debugLog]);

  // Monitor sync status
  useEffect(() => {
    if (!autoSync) return;
    
    const isOutOfSync = contextThemeId && contextThemeId !== state.themeId && !state.isSyncing;
    
    if (isOutOfSync && state.syncStatus !== 'out-of-sync') {
      debugLog('Themes out of sync detected', {
        contextThemeId,
        currentThemeId: state.themeId
      });
      updateSyncStatus('out-of-sync');
    } else if (!isOutOfSync && state.syncStatus === 'out-of-sync') {
      updateSyncStatus('synced');
    }
  }, [contextThemeId, state.themeId, state.isSyncing, state.syncStatus, autoSync, debugLog, updateSyncStatus]);

  return {
    ...state,
    setTheme,
    forceSync,
    resetTheme
  };
}


