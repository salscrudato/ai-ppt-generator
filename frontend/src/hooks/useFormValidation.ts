/**
 * Form Validation Hook
 * 
 * Provides real-time form validation with Zod schemas, error management,
 * and form state handling. Ensures data integrity and user feedback.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { useState, useCallback, useEffect } from 'react';
import {
  ClientGenerationParamsSchema,
  validateGenerationParams,
  validateField,
  type ClientGenerationParams,
  type ValidationResult
} from '../validation/clientSchema';
import type { GenerationParams } from '../types';

/**
 * Form validation state
 */
export interface FormValidationState {
  /** Whether the entire form is valid */
  isValid: boolean;
  /** Whether the form has been touched/modified */
  isDirty: boolean;
  /** Whether validation is currently running */
  isValidating: boolean;
  /** Field-specific error messages */
  fieldErrors: Record<string, string>;
  /** All validation errors grouped by field */
  errors: Record<string, string[]>;
  /** Fields that have been touched by the user */
  touchedFields: Set<string>;
  /** Whether the form can be submitted */
  canSubmit: boolean;
}

/**
 * Form validation actions
 */
export interface FormValidationActions {
  /** Validate the entire form */
  validateForm: (data: unknown) => ValidationResult<ClientGenerationParams>;
  /** Validate a single field */
  validateSingleField: (field: string, value: unknown) => void;
  /** Mark a field as touched */
  touchField: (field: string) => void;
  /** Clear all validation errors */
  clearErrors: () => void;
  /** Clear errors for a specific field */
  clearFieldError: (field: string) => void;
  /** Reset validation state */
  reset: () => void;
  /** Set custom error for a field */
  setFieldError: (field: string, error: string) => void;
}

/**
 * Hook return type
 */
export interface UseFormValidationReturn {
  validation: FormValidationState;
  actions: FormValidationActions;
}

/**
 * Initial validation state
 */
const initialState: FormValidationState = {
  isValid: false,
  isDirty: false,
  isValidating: false,
  fieldErrors: {},
  errors: {},
  touchedFields: new Set(),
  canSubmit: false
};

/**
 * Form validation hook for GenerationParams
 * 
 * @param initialData - Initial form data
 * @param validateOnChange - Whether to validate on every change (default: true)
 * @param validateOnTouch - Whether to validate when field is touched (default: true)
 * @returns Validation state and actions
 */
export function useFormValidation(
  initialData?: Partial<GenerationParams>,
  validateOnChange: boolean = true,
  validateOnTouch: boolean = true
): UseFormValidationReturn {
  const [state, setState] = useState<FormValidationState>(initialState);

  /**
   * Update validation state
   */
  const updateState = useCallback((updates: Partial<FormValidationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Validate the entire form
   */
  const validateForm = useCallback((data: unknown): ValidationResult<GenerationParams> => {
    updateState({ isValidating: true });

    try {
      const result = validateGenerationParams(data);

      updateState({
        isValidating: false,
        isValid: result.success,
        fieldErrors: result.fieldErrors || {},
        errors: result.errors || {},
        canSubmit: result.success
      });

      return result;
    } catch (error) {
      console.error('Form validation error:', error);
      updateState({
        isValidating: false,
        isValid: false,
        fieldErrors: { general: 'Validation error occurred' },
        errors: { general: ['Validation error occurred'] },
        canSubmit: false
      });

      return {
        success: false,
        fieldErrors: { general: 'Validation error occurred' },
        errors: { general: ['Validation error occurred'] }
      };
    }
  }, [updateState]);

  /**
   * Validate a single field
   */
  const validateSingleField = useCallback((field: string, value: unknown) => {
    if (!validateOnChange && !state.touchedFields.has(field)) {
      return;
    }

    try {
      // Check if field exists in our schema
      const fieldSchema = FieldSchemas[field as keyof typeof FieldSchemas];
      if (!fieldSchema) {
        return;
      }

      const result = validateField(field as keyof typeof FieldSchemas, value);

      setState(prev => {
        const newFieldErrors = { ...prev.fieldErrors };
        const newErrors = { ...prev.errors };

        if (result.success) {
          // Clear errors for this field
          delete newFieldErrors[field];
          delete newErrors[field];
        } else {
          // Set errors for this field
          newFieldErrors[field] = result.fieldErrors?.[field] || 'Invalid value';
          newErrors[field] = result.errors?.[field] || ['Invalid value'];
        }

        const hasErrors = Object.keys(newFieldErrors).length > 0;

        return {
          ...prev,
          isValidating: false,
          fieldErrors: newFieldErrors,
          errors: newErrors,
          isValid: !hasErrors,
          canSubmit: !hasErrors && prev.isDirty
        };
      });
    } catch (error) {
      console.error('Field validation error:', error);
    }
  }, [validateOnChange]);

  /**
   * Mark a field as touched
   */
  const touchField = useCallback((field: string) => {
    setState(prev => {
      const newTouchedFields = new Set(prev.touchedFields);
      newTouchedFields.add(field);
      
      return {
        ...prev,
        touchedFields: newTouchedFields,
        isDirty: true
      };
    });
  }, []);

  /**
   * Clear all validation errors
   */
  const clearErrors = useCallback(() => {
    updateState({
      fieldErrors: {},
      errors: {},
      isValid: true,
      canSubmit: state.isDirty
    });
  }, [updateState, state.isDirty]);

  /**
   * Clear errors for a specific field
   */
  const clearFieldError = useCallback((field: string) => {
    setState(prev => {
      const newFieldErrors = { ...prev.fieldErrors };
      const newErrors = { ...prev.errors };
      
      delete newFieldErrors[field];
      delete newErrors[field];
      
      const hasErrors = Object.keys(newFieldErrors).length > 0;
      
      return {
        ...prev,
        fieldErrors: newFieldErrors,
        errors: newErrors,
        isValid: !hasErrors,
        canSubmit: !hasErrors && prev.isDirty
      };
    });
  }, []);

  /**
   * Reset validation state
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * Set custom error for a field
   */
  const setFieldError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      fieldErrors: {
        ...prev.fieldErrors,
        [field]: error
      },
      errors: {
        ...prev.errors,
        [field]: [error]
      },
      isValid: false,
      canSubmit: false
    }));
  }, []);

  // Remove automatic validation on mount to prevent infinite loops
  // Validation will be triggered manually when needed

  const actions: FormValidationActions = {
    validateForm,
    validateSingleField,
    touchField,
    clearErrors,
    clearFieldError,
    reset,
    setFieldError
  };

  return {
    validation: state,
    actions
  };
}

/**
 * Hook for validating a specific field with debouncing
 * 
 * @param field - Field name to validate
 * @param value - Current field value
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns Field validation state
 */
export function useFieldValidation(
  field: string,
  value: unknown,
  debounceMs: number = 300
) {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setIsValidating(true);
    
    const timer = setTimeout(() => {
      const fieldSchema = FieldSchemas[field as keyof typeof FieldSchemas];
      if (!fieldSchema) {
        setIsValidating(false);
        return;
      }

      const result = validateField(field as keyof typeof FieldSchemas, value);
      
      setError(result.fieldErrors?.[field] || null);
      setIsValid(result.success);
      setIsValidating(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [field, value, debounceMs]);

  return {
    error,
    isValidating,
    isValid
  };
}

/**
 * Hook for form submission with validation
 * 
 * @param onSubmit - Submit handler function
 * @param validation - Validation state from useFormValidation
 * @returns Submit handler and submission state
 */
export function useValidatedSubmit(
  onSubmit: (data: GenerationParams) => void | Promise<void>,
  validation: FormValidationState,
  validateForm: (data: unknown) => ValidationResult<GenerationParams>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (data: unknown) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const result = validateForm(data);
      
      if (result.success && result.data) {
        await onSubmit(result.data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validateForm, onSubmit]);

  return {
    handleSubmit,
    isSubmitting,
    canSubmit: validation.canSubmit && !isSubmitting
  };
}
