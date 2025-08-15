/**
 * Validated Form Input Components
 * 
 * Enhanced form components with built-in validation states, error handling,
 * and accessibility features. Provides consistent styling and behavior.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { FieldValidation, CharacterCount } from './ValidationMessage';

/**
 * Validation state for form fields
 */
export type ValidationState = 'default' | 'error' | 'warning' | 'success';

/**
 * Base props for validated form components
 */
export interface BaseValidatedProps {
  /** Field name for accessibility and validation */
  name: string;
  /** Field label */
  label?: string;
  /** Error message */
  error?: string;
  /** Warning message */
  warning?: string;
  /** Success message */
  success?: string;
  /** Info/help message */
  info?: string;
  /** Whether the field has been touched */
  touched?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Help text */
  helpText?: string;
}

/**
 * Get validation state from props
 */
function getValidationState(props: BaseValidatedProps): ValidationState {
  if (props.error) return 'error';
  if (props.warning) return 'warning';
  if (props.success) return 'success';
  return 'default';
}

/**
 * Get input styling classes based on validation state
 */
function getInputClasses(state: ValidationState, disabled?: boolean): string {
  const baseClasses = 'input transition-all duration-200';
  
  if (disabled) {
    return clsx(baseClasses, 'opacity-50 cursor-not-allowed');
  }
  
  switch (state) {
    case 'error':
      return clsx(baseClasses, 'border-red-300 focus:border-red-500 focus:ring-red-500');
    case 'warning':
      return clsx(baseClasses, 'border-amber-300 focus:border-amber-500 focus:ring-amber-500');
    case 'success':
      return clsx(baseClasses, 'border-green-300 focus:border-green-500 focus:ring-green-500');
    default:
      return clsx(baseClasses, 'border-gray-300 focus:border-blue-500 focus:ring-blue-500');
  }
}

/**
 * Validated text input component
 */
export interface ValidatedInputProps extends BaseValidatedProps {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'url' | 'tel';
  /** Input value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum length */
  maxLength?: number;
  /** Minimum length */
  minLength?: number;
  /** Whether to show character count */
  showCharacterCount?: boolean;
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({
    name,
    label,
    type = 'text',
    value,
    onChange,
    onBlur,
    onFocus,
    placeholder,
    maxLength,
    minLength,
    showCharacterCount = false,
    error,
    warning,
    success,
    info,
    touched = false,
    required = false,
    disabled = false,
    className,
    icon,
    helpText
  }, ref) => {
    const validationState = getValidationState({ error, warning, success });
    const inputClasses = getInputClasses(validationState, disabled);

    return (
      <FieldValidation
        fieldName={name}
        error={error}
        warning={warning}
        success={success}
        info={info}
        touched={touched}
        className={className}
      >
        <div className="space-y-2">
          {label && (
            <label htmlFor={name} className="block text-sm font-semibold text-gray-900">
              {icon && <span className="mr-2">{icon}</span>}
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          <div className="relative">
            <input
              ref={ref}
              id={name}
              name={name}
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              onFocus={onFocus}
              placeholder={placeholder}
              maxLength={maxLength}
              minLength={minLength}
              required={required}
              disabled={disabled}
              className={inputClasses}
              aria-invalid={!!error}
              aria-describedby={
                [
                  helpText && `${name}-help`,
                  error && `${name}-error`,
                  warning && `${name}-warning`,
                  success && `${name}-success`,
                  info && `${name}-info`
                ].filter(Boolean).join(' ') || undefined
              }
            />
            
            {showCharacterCount && maxLength && (
              <div className="absolute top-2 right-3">
                <CharacterCount
                  current={value.length}
                  max={maxLength}
                  min={minLength}
                />
              </div>
            )}
          </div>
          
          {helpText && (
            <p id={`${name}-help`} className="text-sm text-gray-600">
              {helpText}
            </p>
          )}
        </div>
      </FieldValidation>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';

/**
 * Validated textarea component
 */
export interface ValidatedTextareaProps extends BaseValidatedProps {
  /** Textarea value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Number of rows */
  rows?: number;
  /** Maximum length */
  maxLength?: number;
  /** Minimum length */
  minLength?: number;
  /** Whether to show character count */
  showCharacterCount?: boolean;
  /** Whether to show progress bar */
  showProgress?: boolean;
}

export const ValidatedTextarea = forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(
  ({
    name,
    label,
    value,
    onChange,
    onBlur,
    onFocus,
    placeholder,
    rows = 4,
    maxLength,
    minLength,
    showCharacterCount = false,
    showProgress = false,
    error,
    warning,
    success,
    info,
    touched = false,
    required = false,
    disabled = false,
    className,
    icon,
    helpText
  }, ref) => {
    const validationState = getValidationState({ error, warning, success });
    const inputClasses = getInputClasses(validationState, disabled);

    return (
      <FieldValidation
        fieldName={name}
        error={error}
        warning={warning}
        success={success}
        info={info}
        touched={touched}
        className={className}
      >
        <div className="space-y-2">
          {label && (
            <label htmlFor={name} className="block text-sm font-semibold text-gray-900">
              {icon && <span className="mr-2">{icon}</span>}
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          <div className="relative">
            <textarea
              ref={ref}
              id={name}
              name={name}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              onFocus={onFocus}
              placeholder={placeholder}
              rows={rows}
              maxLength={maxLength}
              minLength={minLength}
              required={required}
              disabled={disabled}
              className={clsx(inputClasses, 'resize-none')}
              aria-invalid={!!error}
              aria-describedby={
                [
                  helpText && `${name}-help`,
                  error && `${name}-error`,
                  warning && `${name}-warning`,
                  success && `${name}-success`,
                  info && `${name}-info`
                ].filter(Boolean).join(' ') || undefined
              }
            />
            
            {showCharacterCount && maxLength && (
              <div className="absolute bottom-3 right-3">
                <CharacterCount
                  current={value.length}
                  max={maxLength}
                  min={minLength}
                  showProgress={showProgress}
                />
              </div>
            )}
          </div>
          
          {helpText && (
            <p id={`${name}-help`} className="text-sm text-gray-600">
              {helpText}
            </p>
          )}
        </div>
      </FieldValidation>
    );
  }
);

ValidatedTextarea.displayName = 'ValidatedTextarea';

/**
 * Validated select component
 */
export interface ValidatedSelectProps extends BaseValidatedProps {
  /** Select value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Select options */
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  /** Placeholder option */
  placeholder?: string;
}

export const ValidatedSelect = forwardRef<HTMLSelectElement, ValidatedSelectProps>(
  ({
    name,
    label,
    value,
    onChange,
    onBlur,
    onFocus,
    options,
    placeholder,
    error,
    warning,
    success,
    info,
    touched = false,
    required = false,
    disabled = false,
    className,
    icon,
    helpText
  }, ref) => {
    const validationState = getValidationState({ error, warning, success });
    const inputClasses = getInputClasses(validationState, disabled);

    return (
      <FieldValidation
        fieldName={name}
        error={error}
        warning={warning}
        success={success}
        info={info}
        touched={touched}
        className={className}
      >
        <div className="space-y-2">
          {label && (
            <label htmlFor={name} className="block text-sm font-semibold text-gray-900">
              {icon && <span className="mr-2">{icon}</span>}
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          <select
            ref={ref}
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            required={required}
            disabled={disabled}
            className={inputClasses}
            aria-invalid={!!error}
            aria-describedby={
              [
                helpText && `${name}-help`,
                error && `${name}-error`,
                warning && `${name}-warning`,
                success && `${name}-success`,
                info && `${name}-info`
              ].filter(Boolean).join(' ') || undefined
            }
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {helpText && (
            <p id={`${name}-help`} className="text-sm text-gray-600">
              {helpText}
            </p>
          )}
        </div>
      </FieldValidation>
    );
  }
);

ValidatedSelect.displayName = 'ValidatedSelect';
