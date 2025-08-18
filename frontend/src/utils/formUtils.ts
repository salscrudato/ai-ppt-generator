/**
 * Form Utilities for Consistent UI Components
 * Simplifies repetitive form elements and improves maintainability
 */

import React from 'react';

/**
 * Common input field props
 */
export interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'textarea' | 'email' | 'url';
  rows?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * Reusable input field component
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  rows = 3,
  className = '',
  disabled = false
}) => {
  const baseClasses = "input w-full";
  const inputClasses = `${baseClasses} ${className}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          className={inputClasses}
          disabled={disabled}
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={inputClasses}
          disabled={disabled}
          required={required}
        />
      )}
    </div>
  );
};

/**
 * Select field props
 */
export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * Reusable select field component
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  className = '',
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={handleChange}
        className={`input w-full ${className}`}
        disabled={disabled}
        required={required}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Common form validation utilities
 */
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }
  return null;
};

/**
 * Batch validation helper
 */
export const validateFields = (
  fields: Array<{
    value: string;
    name: string;
    validators: Array<(value: string, name: string) => string | null>;
  }>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  fields.forEach(({ value, name, validators }) => {
    for (const validator of validators) {
      const error = validator(value, name);
      if (error) {
        errors[name] = error;
        break; // Stop at first error
      }
    }
  });

  return errors;
};

/**
 * Common form state management hook
 */
export const useFormState = <T extends Record<string, any>>(initialState: T) => {
  const [state, setState] = React.useState<T>(initialState);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Set<string>>(new Set());

  const updateField = (field: keyof T, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  const touchField = (field: keyof T) => {
    setTouched(prev => new Set([...prev, field as string]));
  };

  const validateForm = (
    validationRules: Record<keyof T, Array<(value: any, name: string) => string | null>>
  ) => {
    const newErrors: Record<string, string> = {};

    Object.entries(validationRules).forEach(([field, validators]) => {
      const value = state[field as keyof T];
      for (const validator of validators) {
        const error = validator(value, field);
        if (error) {
          newErrors[field] = error;
          break;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setState(initialState);
    setErrors({});
    setTouched(new Set());
  };

  return {
    state,
    errors,
    touched,
    updateField,
    touchField,
    validateForm,
    resetForm,
    hasErrors: Object.keys(errors).length > 0,
    isFieldTouched: (field: keyof T) => touched.has(field as string)
  };
};
