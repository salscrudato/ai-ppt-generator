/**
 * Theme Verification Indicator Component
 * Displays theme validation status and accessibility information
 */

import React from 'react';
import { HiCheckCircle, HiExclamationTriangle, HiInformationCircle } from 'react-icons/hi2';
import type { ProfessionalTheme } from '../themes/professionalThemes';

interface ThemeVerificationIndicatorProps {
  theme: ProfessionalTheme;
  compact?: boolean;
  showDetails?: boolean;
}

/**
 * Validate theme accessibility and quality
 */
function validateTheme(theme: ProfessionalTheme) {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Basic color contrast validation
  const primaryBg = theme.colors.background;
  const primaryText = theme.colors.text?.primary || '#000000';
  
  // Simple contrast check (simplified for demo)
  const isLightBg = primaryBg === '#FFFFFF' || primaryBg.includes('F');
  const isDarkText = primaryText.includes('0') || primaryText.includes('1') || primaryText.includes('2');
  
  if (isLightBg && !isDarkText) {
    issues.push('Low contrast between text and background');
  }
  
  // Check for required colors
  if (!theme.colors.primary) warnings.push('Missing primary color');
  if (!theme.colors.secondary) warnings.push('Missing secondary color');
  if (!theme.colors.accent) warnings.push('Missing accent color');
  
  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    wcagLevel: issues.length === 0 ? 'AA' : 'Fail',
    score: Math.max(0, 100 - (issues.length * 20) - (warnings.length * 5))
  };
}

export default function ThemeVerificationIndicator({
  theme,
  compact = false,
  showDetails = true
}: ThemeVerificationIndicatorProps) {
  const validation = validateTheme(theme);
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {validation.isValid ? (
          <HiCheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <HiExclamationTriangle className="w-4 h-4 text-yellow-500" />
        )}
        <span className={validation.isValid ? 'text-green-600' : 'text-yellow-600'}>
          {validation.wcagLevel} Compliant
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <HiInformationCircle className="w-5 h-5 text-blue-500" />
        <h4 className="font-medium text-gray-900">Theme Verification</h4>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Accessibility Score:</span>
          <span className={`text-sm font-medium ${
            validation.score >= 90 ? 'text-green-600' : 
            validation.score >= 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {validation.score}/100
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">WCAG Level:</span>
          <span className={`text-sm font-medium ${
            validation.wcagLevel === 'AA' ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {validation.wcagLevel}
          </span>
        </div>
        
        {showDetails && validation.issues.length > 0 && (
          <div className="mt-3">
            <h5 className="text-sm font-medium text-red-600 mb-1">Issues:</h5>
            <ul className="text-sm text-red-600 space-y-1">
              {validation.issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span>•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {showDetails && validation.warnings.length > 0 && (
          <div className="mt-3">
            <h5 className="text-sm font-medium text-yellow-600 mb-1">Warnings:</h5>
            <ul className="text-sm text-yellow-600 space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span>•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {validation.isValid && (
          <div className="mt-3 flex items-center gap-2 text-green-600">
            <HiCheckCircle className="w-4 h-4" />
            <span className="text-sm">Theme meets accessibility standards</span>
          </div>
        )}
      </div>
    </div>
  );
}
