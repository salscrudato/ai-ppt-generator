/**
 * Theme Verification Hook
 * 
 * React hook that provides real-time theme consistency verification
 * for preview components. Automatically verifies theme application
 * and provides feedback on consistency issues.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ProfessionalTheme } from '../themes/professionalThemes';
import { 
  ThemeConsistencyVerifier, 
  verifyThemeConsistency,
  type ThemeVerificationResult 
} from '../utils/themeConsistencyVerifier';

export interface UseThemeVerificationOptions {
  /** Whether to enable automatic verification */
  enabled?: boolean;
  /** Debounce delay for verification (ms) */
  debounceMs?: number;
  /** Whether to log verification results */
  debug?: boolean;
  /** Callback when verification completes */
  onVerificationComplete?: (result: ThemeVerificationResult) => void;
}

export interface ThemeVerificationState {
  /** Current verification result */
  result: ThemeVerificationResult | null;
  /** Whether verification is in progress */
  isVerifying: boolean;
  /** Last verification timestamp */
  lastVerified: Date | null;
  /** Manual verification trigger */
  verify: () => Promise<void>;
  /** Reset verification state */
  reset: () => void;
}

/**
 * Hook for theme verification in preview components
 */
export function useThemeVerification(
  theme: ProfessionalTheme | null,
  options: UseThemeVerificationOptions = {}
): ThemeVerificationState {
  const {
    enabled = true,
    debounceMs = 500,
    debug = false,
    onVerificationComplete
  } = options;

  const [result, setResult] = useState<ThemeVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastVerified, setLastVerified] = useState<Date | null>(null);
  
  const elementRef = useRef<HTMLElement | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const verifierRef = useRef<ThemeConsistencyVerifier | null>(null);

  // Update verifier when theme changes
  useEffect(() => {
    if (theme) {
      verifierRef.current = new ThemeConsistencyVerifier(theme);
      if (debug) {
        console.log('🎨 ThemeVerification: Updated verifier for theme:', theme.name);
      }
    } else {
      verifierRef.current = null;
    }
  }, [theme, debug]);

  // Manual verification function
  const verify = useCallback(async () => {
    if (!enabled || !theme || !verifierRef.current) {
      if (debug) {
        console.log('🎨 ThemeVerification: Skipping verification', {
          enabled,
          hasTheme: !!theme,
          hasVerifier: !!verifierRef.current
        });
      }
      return;
    }

    // Find the preview element
    const previewElement = document.querySelector('.slide-preview') as HTMLElement;
    if (!previewElement) {
      if (debug) {
        console.warn('🎨 ThemeVerification: No preview element found');
      }
      return;
    }

    setIsVerifying(true);
    
    try {
      if (debug) {
        console.log('🎨 ThemeVerification: Starting verification for:', theme.name);
      }

      const verificationResult = await verifyThemeConsistency(theme, previewElement);
      
      setResult(verificationResult);
      setLastVerified(new Date());
      
      if (debug) {
        console.log('🎨 ThemeVerification: Completed', {
          theme: theme.name,
          passed: verificationResult.passed,
          score: verificationResult.score,
          issues: verificationResult.issues.length
        });
      }

      // Call completion callback
      onVerificationComplete?.(verificationResult);
      
    } catch (error) {
      console.error('🎨 ThemeVerification: Error during verification:', error);
      
      // Create error result
      const errorResult: ThemeVerificationResult = {
        passed: false,
        score: 0,
        issues: [{
          severity: 'high',
          component: 'preview',
          property: 'verification',
          expected: 'successful verification',
          actual: 'error',
          message: error instanceof Error ? error.message : 'Unknown verification error'
        }],
        details: {
          background: { expected: '', actual: '', match: false, similarity: 0 },
          title: { expected: '', actual: '', match: false, similarity: 0 },
          text: { expected: '', actual: '', match: false, similarity: 0 },
          accent: { expected: '', actual: '', match: false, similarity: 0 }
        }
      };
      
      setResult(errorResult);
      onVerificationComplete?.(errorResult);
    } finally {
      setIsVerifying(false);
    }
  }, [enabled, theme, debug, onVerificationComplete]);

  // Debounced verification
  const debouncedVerify = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      verify();
    }, debounceMs);
  }, [verify, debounceMs]);

  // Auto-verify when theme changes
  useEffect(() => {
    if (enabled && theme) {
      debouncedVerify();
    }
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [theme, enabled, debouncedVerify]);

  // Reset function
  const reset = useCallback(() => {
    setResult(null);
    setIsVerifying(false);
    setLastVerified(null);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (debug) {
      console.log('🎨 ThemeVerification: Reset verification state');
    }
  }, [debug]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    result,
    isVerifying,
    lastVerified,
    verify,
    reset
  };
}

/**
 * Hook for displaying verification results in UI
 */
export function useThemeVerificationDisplay(
  verificationState: ThemeVerificationState
) {
  const { result } = verificationState;
  
  const getStatusColor = useCallback(() => {
    if (!result) return 'gray';
    if (result.passed) return 'green';
    if (result.score >= 70) return 'yellow';
    return 'red';
  }, [result]);
  
  const getStatusText = useCallback(() => {
    if (!result) return 'Not verified';
    if (result.passed) return 'Theme consistent';
    if (result.score >= 70) return 'Minor issues';
    return 'Theme issues detected';
  }, [result]);
  
  const getScoreText = useCallback(() => {
    if (!result) return '';
    return `${result.score}%`;
  }, [result]);
  
  const getIssuesSummary = useCallback(() => {
    if (!result || result.issues.length === 0) return '';
    
    const highIssues = result.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = result.issues.filter(i => i.severity === 'medium').length;
    const lowIssues = result.issues.filter(i => i.severity === 'low').length;
    
    const parts = [];
    if (highIssues > 0) parts.push(`${highIssues} high`);
    if (mediumIssues > 0) parts.push(`${mediumIssues} medium`);
    if (lowIssues > 0) parts.push(`${lowIssues} low`);
    
    return parts.join(', ') + ' issues';
  }, [result]);
  
  return {
    statusColor: getStatusColor(),
    statusText: getStatusText(),
    scoreText: getScoreText(),
    issuesSummary: getIssuesSummary(),
    hasIssues: result ? result.issues.length > 0 : false,
    isPassed: result ? result.passed : false
  };
}

/**
 * Simple hook for basic theme verification status
 */
export function useSimpleThemeVerification(theme: ProfessionalTheme | null) {
  const verification = useThemeVerification(theme, {
    enabled: true,
    debug: false,
    debounceMs: 300
  });
  
  const display = useThemeVerificationDisplay(verification);
  
  return {
    isVerified: !!verification.result,
    isPassed: display.isPassed,
    score: verification.result?.score || 0,
    statusText: display.statusText,
    verify: verification.verify
  };
}
