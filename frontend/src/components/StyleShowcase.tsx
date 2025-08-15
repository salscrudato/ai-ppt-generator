/**
 * Style Showcase Component
 * 
 * Demonstrates the comprehensive styling system including:
 * - Reusable component styles
 * - Theme switching capabilities
 * - Responsive design patterns
 * - Accessibility features
 * 
 * This component serves as both a demo and a reference for developers.
 * 
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { themeManager } from '../utils/themeManager';
import { useResponsive } from '../utils/responsiveUtils';
import { STYLE_UTILS } from '../constants/styleConstants';

const StyleShowcase: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState(themeManager.getCurrentTheme());
  const { deviceInfo, getResponsiveClasses, generateResponsiveClasses } = useResponsive();
  
  const handleThemeChange = (themeId: string) => {
    themeManager.applyTheme(themeId);
    setCurrentTheme(themeId);
  };

  const responsiveClasses = getResponsiveClasses();

  return (
    <div className="container-app py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">
          Style System Showcase
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Comprehensive demonstration of our design system including themes, components, and responsive patterns.
        </p>
      </div>

      {/* Device Info */}
      <div className="card-default p-6">
        <h2 className="text-xl font-semibold mb-4">Current Device Info</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Type:</span>
            <span className="ml-2">
              {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
            </span>
          </div>
          <div>
            <span className="font-medium">Breakpoint:</span>
            <span className="ml-2">{deviceInfo.currentBreakpoint}</span>
          </div>
          <div>
            <span className="font-medium">Touch:</span>
            <span className="ml-2">{deviceInfo.isTouchDevice ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="font-medium">Viewport:</span>
            <span className="ml-2">{deviceInfo.viewportWidth}×{deviceInfo.viewportHeight}</span>
          </div>
        </div>
      </div>

      {/* Theme Switcher */}
      <div className="card-default p-6">
        <h2 className="text-xl font-semibold mb-4">Theme Switcher</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {themeManager.getAvailableThemes().map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={STYLE_UTILS.cn(
                'card-theme p-4 text-left transition-all duration-200',
                currentTheme === theme.id 
                  ? 'ring-2 ring-primary-500 bg-primary-50' 
                  : 'hover:shadow-md'
              )}
              style={{
                backgroundColor: theme.colors['theme-surface'],
                borderColor: theme.colors['theme-border'],
              }}
            >
              <div className="space-y-2">
                <div className="font-medium" style={{ color: theme.colors['theme-text'] }}>
                  {theme.name}
                </div>
                <div className="flex space-x-1">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors['theme-primary'] }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors['theme-secondary'] }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors['theme-accent'] }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Button Showcase */}
      <div className="card-default p-6">
        <h2 className="text-xl font-semibold mb-4">Button Components</h2>
        <div className="space-y-6">
          {/* Primary Buttons */}
          <div>
            <h3 className="text-lg font-medium mb-3">Primary Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary btn-sm">Small</button>
              <button className="btn-primary">Default</button>
              <button className="btn-primary btn-lg">Large</button>
              <button className="btn-primary" disabled>Disabled</button>
            </div>
          </div>

          {/* Secondary Buttons */}
          <div>
            <h3 className="text-lg font-medium mb-3">Secondary Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <button className="btn-secondary btn-sm">Small</button>
              <button className="btn-secondary">Default</button>
              <button className="btn-secondary btn-lg">Large</button>
              <button className="btn-secondary" disabled>Disabled</button>
            </div>
          </div>

          {/* Other Button Types */}
          <div>
            <h3 className="text-lg font-medium mb-3">Other Button Types</h3>
            <div className="flex flex-wrap gap-3">
              <button className="btn-accent">Accent</button>
              <button className="btn-ghost">Ghost</button>
              <button className="btn-success">Success</button>
              <button className="btn-danger">Danger</button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Showcase */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Card Components</h2>
        
        <div className={responsiveClasses.grid}>
          <div className="card-default p-6">
            <h3 className="text-lg font-semibold mb-2">Default Card</h3>
            <p className="text-slate-600">
              This is a default card with standard styling and hover effects.
            </p>
          </div>

          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold mb-2">Elevated Card</h3>
            <p className="text-slate-600">
              This card has enhanced shadows and more prominent hover effects.
            </p>
          </div>

          <div className="card-interactive p-6">
            <h3 className="text-lg font-semibold mb-2">Interactive Card</h3>
            <p className="text-slate-600">
              This card is designed for interactive elements with click feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Form Showcase */}
      <div className="card-default p-6">
        <h2 className="text-xl font-semibold mb-4">Form Components</h2>
        <div className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Default Input
            </label>
            <input 
              type="text" 
              className="input-base w-full" 
              placeholder="Enter text here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Success State
            </label>
            <input 
              type="text" 
              className="input-base input-success w-full" 
              value="Valid input"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Error State
            </label>
            <input 
              type="text" 
              className="input-base input-error w-full" 
              value="Invalid input"
              readOnly
            />
            <p className="field-error-message">This field has an error</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Textarea
            </label>
            <textarea 
              className="textarea-base w-full h-24" 
              placeholder="Enter longer text here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select
            </label>
            <select className="select-base w-full">
              <option>Choose an option</option>
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Grid Showcase */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Responsive Grid System</h2>
        
        <div className="grid-auto-fit">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="card-default p-4 text-center">
              <div className="text-lg font-semibold text-primary-600">Item {i + 1}</div>
              <p className="text-sm text-slate-600 mt-2">
                Auto-fit grid item that adapts to screen size
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="card-default p-6">
        <h2 className="text-xl font-semibold mb-4">Accessibility Features</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Focus Management</h3>
            <div className="flex gap-3">
              <button className="btn-primary focus-visible-ring">
                Focus Visible Ring
              </button>
              <button className="btn-secondary focus-visible-ring-inset">
                Inset Ring
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Touch Targets</h3>
            <div className="flex gap-3">
              <button className="btn-primary touch-target">
                Touch Friendly
              </button>
              <button className="btn-secondary touch-target-lg">
                Large Touch Target
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Screen Reader Content</h3>
            <button className="btn-primary">
              Button with hidden text
              <span className="sr-only">for screen readers only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Classes Demo */}
      <div className="card-default p-6">
        <h2 className="text-xl font-semibold mb-4">Responsive Classes</h2>
        <div className="space-y-4">
          <div className={generateResponsiveClasses({
            base: 'bg-primary-100 p-4 rounded-lg',
            md: 'bg-primary-200 p-6',
            lg: 'bg-primary-300 p-8'
          })}>
            <p className="text-primary-800 font-medium">
              This box changes color and padding based on screen size
            </p>
          </div>

          <div className="responsive-flex">
            <span className="font-medium">Responsive Flex:</span>
            <span>Stacks on mobile, side-by-side on desktop</span>
          </div>

          <div className="mobile-only">
            <p className="text-sm text-slate-600">This text only shows on mobile</p>
          </div>

          <div className="desktop-only">
            <p className="text-sm text-slate-600">This text only shows on desktop</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleShowcase;
