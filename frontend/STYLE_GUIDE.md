# Style Guide - AI PowerPoint Generator

## Overview

This style guide outlines the design system, coding standards, and best practices for maintaining consistency across the AI PowerPoint Generator application.

## Table of Contents

1. [Design System](#design-system)
2. [Component Styling](#component-styling)
3. [Responsive Design](#responsive-design)
4. [Accessibility](#accessibility)
5. [Code Standards](#code-standards)
6. [Theme Management](#theme-management)

## Design System

### Color Palette

Our design system uses a comprehensive color palette with theme-specific variations:

#### Primary Colors
- **Primary**: `#4f46e5` (Indigo-600) - Main brand color
- **Secondary**: `#64748b` (Slate-600) - Supporting color
- **Accent**: `#ec4899` (Pink-500) - Highlight color

#### Semantic Colors
- **Success**: `#10b981` (Emerald-500)
- **Warning**: `#f59e0b` (Amber-500)
- **Error**: `#ef4444` (Red-500)
- **Info**: `#3b82f6` (Blue-500)

#### Theme-Specific Colors
Each theme (Corporate, Creative, Academic, etc.) has its own color palette defined in `styleConstants.ts`.

### Typography

#### Font Families
- **Primary**: Inter (Headings and UI)
- **Secondary**: Inter (Body text)
- **Monospace**: JetBrains Mono (Code)

#### Font Scales
```css
xs: 0.75rem    (12px)
sm: 0.875rem   (14px)
base: 1rem     (16px)
lg: 1.125rem   (18px)
xl: 1.25rem    (20px)
2xl: 1.5rem    (24px)
3xl: 1.875rem  (30px)
4xl: 2.25rem   (36px)
```

### Spacing System

Based on a 4px grid system:
```css
1: 0.25rem  (4px)
2: 0.5rem   (8px)
3: 0.75rem  (12px)
4: 1rem     (16px)
6: 1.5rem   (24px)
8: 2rem     (32px)
```

## Component Styling

### Using Reusable Classes

Instead of repeating Tailwind classes, use our predefined component classes:

#### Cards
```tsx
// ✅ Good
<div className="card-default">Content</div>
<div className="card-elevated">Content</div>
<div className="card-interactive">Content</div>

// ❌ Avoid
<div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">Content</div>
```

#### Buttons
```tsx
// ✅ Good
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
<button className="btn-ghost">Ghost Button</button>

// ❌ Avoid
<button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
  Primary Action
</button>
```

#### Form Elements
```tsx
// ✅ Good
<input className="input-base" />
<input className="input-base input-error" />
<textarea className="textarea-base" />

// ❌ Avoid
<input className="block w-full px-3 py-2 border border-gray-300 rounded-lg" />
```

### Custom Component Classes

When creating new reusable patterns, add them to `components.css`:

```css
.my-custom-component {
  @apply bg-white rounded-lg shadow-sm p-4 border border-slate-200;
}

.my-custom-component:hover {
  @apply shadow-md border-slate-300;
}
```

## Responsive Design

### Mobile-First Approach

Always start with mobile styles and enhance for larger screens:

```tsx
// ✅ Good - Mobile first
<div className="flex flex-col md:flex-row gap-4 md:gap-6">

// ❌ Avoid - Desktop first
<div className="flex flex-row gap-6 md:flex-col md:gap-4">
```

### Responsive Utilities

Use our responsive utility classes:

```tsx
// Container classes
<div className="container-app">     {/* Standard container */}
<div className="container-narrow">  {/* Narrow container */}
<div className="container-wide">    {/* Wide container */}

// Grid classes
<div className="grid-auto-fit">     {/* Auto-fitting grid */}
<div className="responsive-grid">   {/* Responsive grid */}

// Flex classes
<div className="responsive-flex">   {/* Responsive flex */}
<div className="mobile-stack">      {/* Stack on mobile */}
```

### Breakpoint Guidelines

- **Mobile**: 320px - 767px (focus on touch interactions)
- **Tablet**: 768px - 1023px (hybrid interactions)
- **Desktop**: 1024px+ (mouse/keyboard interactions)

## Accessibility

### Focus Management

Always include proper focus indicators:

```tsx
// ✅ Good
<button className="btn-primary focus-visible-ring">
  Accessible Button
</button>

// ❌ Avoid
<button className="btn-primary focus:outline-none">
  Inaccessible Button
</button>
```

### Touch Targets

Ensure minimum touch target sizes:

```tsx
// ✅ Good
<button className="btn-primary touch-target">
  Touch Friendly
</button>

// ❌ Avoid
<button className="text-xs p-1">
  Too Small
</button>
```

### Screen Reader Support

Include screen reader content when needed:

```tsx
// ✅ Good
<button aria-label="Close dialog">
  <XIcon />
  <span className="sr-only">Close</span>
</button>

// ❌ Avoid
<button>
  <XIcon />
</button>
```

## Code Standards

### Class Name Organization

Organize Tailwind classes logically:

```tsx
// ✅ Good - Grouped by purpose
<div className={`
  // Layout
  flex items-center justify-between
  // Spacing
  p-4 gap-3
  // Appearance
  bg-white rounded-lg shadow-sm
  // States
  hover:shadow-md focus:ring-2
  // Responsive
  md:p-6 lg:gap-4
`}>

// ❌ Avoid - Random order
<div className="hover:shadow-md bg-white p-4 flex rounded-lg items-center shadow-sm md:p-6 justify-between gap-3 focus:ring-2 lg:gap-4">
```

### Conditional Classes

Use utility functions for conditional classes:

```tsx
import { STYLE_UTILS } from '../constants/styleConstants';

// ✅ Good
<div className={STYLE_UTILS.cn(
  'btn-base',
  variant === 'primary' && 'btn-primary',
  variant === 'secondary' && 'btn-secondary',
  disabled && 'opacity-50 cursor-not-allowed'
)}>

// ❌ Avoid
<div className={`btn-base ${variant === 'primary' ? 'btn-primary' : ''} ${variant === 'secondary' ? 'btn-secondary' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
```

### Component Structure

Follow consistent component structure:

```tsx
// ✅ Good structure
interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({ 
  prop1, 
  prop2,
  ...props 
}) => {
  // Hooks
  const [state, setState] = useState();
  
  // Computed values
  const computedValue = useMemo(() => {}, []);
  
  // Event handlers
  const handleClick = useCallback(() => {}, []);
  
  // Render
  return (
    <div className="component-wrapper">
      {/* Component content */}
    </div>
  );
};

export default Component;
```

## Theme Management

### Using Theme Colors

Access theme colors through CSS custom properties:

```css
/* ✅ Good - Use theme variables */
.themed-component {
  background-color: var(--theme-primary);
  color: var(--theme-text);
  border-color: var(--theme-border);
}

/* ❌ Avoid - Hardcoded colors */
.themed-component {
  background-color: #1e40af;
  color: #1e293b;
  border-color: #e2e8f0;
}
```

### Theme Switching

Use the theme manager for dynamic theme switching:

```tsx
import { themeManager } from '../utils/themeManager';

// Switch themes
themeManager.applyTheme('corporate');
themeManager.applyTheme('creative');

// Get current theme
const currentTheme = themeManager.getCurrentTheme();

// Get available themes
const themes = themeManager.getAvailableThemes();
```

### Theme-Specific Styling

Apply theme-specific styles using CSS classes:

```css
/* Theme-specific overrides */
.theme-corporate .special-component {
  @apply bg-corporate-surface border-corporate-border;
}

.theme-creative .special-component {
  @apply bg-creative-surface border-creative-border;
}
```

## Best Practices

### Performance

1. **Minimize CSS Bundle Size**: Use only necessary Tailwind classes
2. **Optimize Images**: Use appropriate formats and sizes
3. **Lazy Load**: Implement lazy loading for non-critical components

### Maintainability

1. **Consistent Naming**: Use descriptive, consistent class names
2. **Documentation**: Document complex styling decisions
3. **Reusability**: Create reusable components and utilities

### Testing

1. **Visual Regression**: Test styling changes across themes
2. **Accessibility**: Test with screen readers and keyboard navigation
3. **Responsive**: Test on various screen sizes and devices

## Tools and Automation

### ESLint Rules

Our ESLint configuration includes:
- Tailwind CSS class ordering
- Accessibility checks
- React best practices
- TypeScript strict rules

### Prettier Configuration

Automatic code formatting with:
- Tailwind class sorting
- Consistent indentation
- Line length optimization

### VS Code Extensions

Recommended extensions:
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- Accessibility Insights

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [Design Tokens](https://design-tokens.github.io/community-group/)

---

For questions or suggestions about this style guide, please reach out to the development team.
