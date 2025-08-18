/**
 * Loading State Management Hook
 * 
 * Provides centralized loading state management with progress tracking,
 * stage-based messaging, and automatic timeout handling.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingStage {
  id: string;
  message: string;
  progress?: number;
  duration?: number; // Expected duration in ms
}

export interface LoadingState {
  isLoading: boolean;
  currentStage?: LoadingStage;
  progress: number;
  message: string;
  error?: string;
}

export interface UseLoadingStateOptions {
  /** Default timeout in milliseconds */
  defaultTimeout?: number;
  /** Whether to auto-progress through stages */
  autoProgress?: boolean;
  /** Callback when loading completes */
  onComplete?: () => void;
  /** Callback when loading fails */
  onError?: (error: string) => void;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    defaultTimeout = 30000, // 30 seconds
    autoProgress = false,
    onComplete,
    onError
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: 'Loading...'
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stagesRef = useRef<LoadingStage[]>([]);
  const currentStageIndexRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startLoading = useCallback((
    stages: LoadingStage[] = [{ id: 'default', message: 'Loading...' }],
    timeout?: number
  ) => {
    stagesRef.current = stages;
    currentStageIndexRef.current = 0;
    startTimeRef.current = Date.now();

    setState({
      isLoading: true,
      currentStage: stages[0],
      progress: 0,
      message: stages[0].message
    });

    // Set timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Operation timed out. Please try again.'
      }));
      onError?.('Operation timed out');
    }, timeout || defaultTimeout);

    // Auto-progress through stages if enabled
    if (autoProgress && stages.length > 1) {
      stages.forEach((stage, index) => {
        if (index > 0 && stage.duration) {
          setTimeout(() => {
            nextStage();
          }, stages.slice(0, index).reduce((acc, s) => acc + (s.duration || 0), 0));
        }
      });
    }
  }, [defaultTimeout, autoProgress, onError]);

  const nextStage = useCallback(() => {
    const stages = stagesRef.current;
    const currentIndex = currentStageIndexRef.current;
    
    if (currentIndex < stages.length - 1) {
      const nextIndex = currentIndex + 1;
      currentStageIndexRef.current = nextIndex;
      
      const nextStage = stages[nextIndex];
      const progress = ((nextIndex + 1) / stages.length) * 100;

      setState(prev => ({
        ...prev,
        currentStage: nextStage,
        progress,
        message: nextStage.message
      }));
    }
  }, []);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      message: message || prev.message
    }));
  }, []);

  const setStage = useCallback((stageId: string, progress?: number) => {
    const stages = stagesRef.current;
    const stageIndex = stages.findIndex(s => s.id === stageId);
    
    if (stageIndex !== -1) {
      currentStageIndexRef.current = stageIndex;
      const stage = stages[stageIndex];
      
      setState(prev => ({
        ...prev,
        currentStage: stage,
        progress: progress ?? ((stageIndex + 1) / stages.length) * 100,
        message: stage.message
      }));
    }
  }, []);

  const completeLoading = useCallback((message?: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100,
      message: message || 'Complete!',
      error: undefined
    }));

    onComplete?.();
  }, [onComplete]);

  const failLoading = useCallback((error: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
      error
    }));

    onError?.(error);
  }, [onError]);

  const resetLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState({
      isLoading: false,
      progress: 0,
      message: 'Loading...'
    });

    stagesRef.current = [];
    currentStageIndexRef.current = 0;
  }, []);

  return {
    ...state,
    stages: stagesRef.current,
    currentStageIndex: currentStageIndexRef.current,
    startLoading,
    nextStage,
    updateProgress,
    setStage,
    completeLoading,
    failLoading,
    resetLoading
  };
}

/**
 * Predefined loading stages for common operations
 */
export const LOADING_STAGES = {
  SLIDE_GENERATION: [
    { id: 'analyzing', message: '🔍 Analyzing your request and audience...', duration: 1500, progress: 5 },
    { id: 'context', message: '🧠 Understanding content context...', duration: 2000, progress: 15 },
    { id: 'generating', message: '✨ Generating professional slide content...', duration: 4500, progress: 45 },
    { id: 'enhancing', message: '📈 Enhancing with storytelling frameworks...', duration: 2500, progress: 70 },
    { id: 'optimizing', message: '🎨 Optimizing layout and design...', duration: 1500, progress: 85 },
    { id: 'finalizing', message: '✅ Finalizing slide structure...', duration: 1000, progress: 95 }
  ],

  PRESENTATION_GENERATION: [
    { id: 'preparing', message: '📋 Preparing presentation components...', duration: 1500, progress: 8 },
    { id: 'themes', message: '🎨 Applying professional themes...', duration: 2000, progress: 20 },
    { id: 'layouts', message: '📐 Optimizing layouts and typography...', duration: 2500, progress: 35 },
    { id: 'content', message: '📝 Processing content and formatting...', duration: 3500, progress: 50 },
    { id: 'charts', message: '📊 Generating charts and visualizations...', duration: 3000, progress: 65 },
    { id: 'building', message: '🔧 Building PowerPoint file...', duration: 4000, progress: 80 },
    { id: 'metadata', message: '📋 Adding speaker notes and metadata...', duration: 1500, progress: 90 },
    { id: 'optimizing', message: '⚡ Optimizing for download...', duration: 1000, progress: 98 }
  ],

  IMAGE_ENHANCEMENT: [
    { id: 'analyzing', message: '🔍 Analyzing image requirements...', duration: 1000, progress: 10 },
    { id: 'generating', message: '🎨 Generating AI-enhanced visuals...', duration: 6000, progress: 40 },
    { id: 'processing', message: '⚙️ Processing and optimizing images...', duration: 3000, progress: 70 },
    { id: 'integrating', message: '🔗 Integrating with presentation...', duration: 1500, progress: 90 }
  ],

  THEME_LOADING: [
    { id: 'fetching', message: 'Loading themes...', duration: 1500 },
    { id: 'processing', message: 'Processing theme data...', duration: 1000 },
    { id: 'ready', message: 'Themes ready!', duration: 500 }
  ],

  IMAGE_GENERATION: [
    { id: 'analyzing', message: 'Analyzing image requirements...', duration: 2000 },
    { id: 'generating', message: 'Generating images...', duration: 10000 },
    { id: 'optimizing', message: 'Optimizing images...', duration: 3000 },
    { id: 'embedding', message: 'Embedding in slide...', duration: 2000 }
  ]
};

/**
 * Hook for button loading states
 */
export function useButtonLoading() {
  const [loadingButtons, setLoadingButtons] = useState<Set<string>>(new Set());

  const setButtonLoading = useCallback((buttonId: string, loading: boolean) => {
    setLoadingButtons(prev => {
      const newSet = new Set(prev);
      if (loading) {
        newSet.add(buttonId);
      } else {
        newSet.delete(buttonId);
      }
      return newSet;
    });
  }, []);

  const isButtonLoading = useCallback((buttonId: string) => {
    return loadingButtons.has(buttonId);
  }, [loadingButtons]);

  const clearAllLoading = useCallback(() => {
    setLoadingButtons(new Set());
  }, []);

  return {
    setButtonLoading,
    isButtonLoading,
    clearAllLoading
  };
}
