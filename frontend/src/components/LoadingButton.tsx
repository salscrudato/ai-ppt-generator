/**
 * LoadingButton Component - DEPRECATED
 *
 * This component is deprecated. Use the main Button component with loading prop instead.
 * Kept for backward compatibility only.
 *
 * @deprecated Use Button component instead
 */

import React from 'react';
import Button, { type ButtonProps } from './Button';

// Backward compatibility interface
interface LoadingButtonProps extends ButtonProps {
  /** @deprecated Use loading prop on Button component */
  loadingText?: string;
  /** @deprecated Use size prop on Button component */
  spinnerSize?: 'xs' | 'sm' | 'md';
}

// Simplified wrapper that delegates to the main Button component
export default function LoadingButton({
  loadingText,
  spinnerSize,
  ...props
}: LoadingButtonProps) {
  // Map deprecated props to Button component props
  const buttonProps = {
    ...props,
    // Use loadingText as children when loading if provided
    children: props.loading && loadingText ? loadingText : props.children
  };

  return <Button {...buttonProps} />;
}

// Export additional components that use the main Button component
export { IconButton as LoadingIconButton } from './Button';
