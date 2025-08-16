/**
 * ThemeCarousel Component Tests
 * 
 * Tests for the new carousel-based theme selection component,
 * specifically focusing on fixing the multiple selection bug.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ThemeCarousel from '../ThemeCarousel';

// Mock the API client
vi.mock('../../utils/apiClient', () => ({
  api: {
    getThemePresets: vi.fn()
  }
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => children
}));

const mockThemes = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    category: 'corporate',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#60A5FA',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: { primary: '#1E293B', secondary: '#64748B' }
    }
  },
  {
    id: 'creative-purple',
    name: 'Creative Purple',
    category: 'creative',
    colors: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#A78BFA',
      background: '#FFFFFF',
      surface: '#FAF5FF',
      text: { primary: '#1E293B', secondary: '#64748B' }
    }
  },
  {
    id: 'modern-green',
    name: 'Modern Green',
    category: 'modern',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#34D399',
      background: '#FFFFFF',
      surface: '#F0FDF4',
      text: { primary: '#1E293B', secondary: '#64748B' }
    }
  }
];

describe('ThemeCarousel', () => {
  const mockOnSelect = vi.fn();
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock successful API response
    const { api } = require('../../utils/apiClient');
    api.getThemePresets.mockResolvedValue({
      success: true,
      data: { themes: mockThemes }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', async () => {
    render(<ThemeCarousel onSelect={mockOnSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('Choose Your Theme')).toBeInTheDocument();
    });
  });

  it('should load and display themes', async () => {
    render(<ThemeCarousel onSelect={mockOnSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('Corporate Blue')).toBeInTheDocument();
      expect(screen.getByText('Creative Purple')).toBeInTheDocument();
      expect(screen.getByText('Modern Green')).toBeInTheDocument();
    });
  });

  it('should enforce single selection - only one theme selected at a time', async () => {
    render(<ThemeCarousel onSelect={mockOnSelect} selectedId="corporate-blue" />);
    
    await waitFor(() => {
      const corporateCard = screen.getByLabelText(/Selected Corporate Blue theme/);
      expect(corporateCard).toBeInTheDocument();
      expect(corporateCard).toHaveAttribute('aria-checked', 'true');
    });

    // Verify only one theme is marked as selected
    const selectedThemes = screen.queryAllByLabelText(/Selected .* theme/);
    expect(selectedThemes).toHaveLength(1);
    
    // Verify other themes are not selected
    const unselectedThemes = screen.queryAllByLabelText(/Select .* theme/);
    expect(unselectedThemes).toHaveLength(mockThemes.length - 1);
  });

  it('should handle theme selection correctly', async () => {
    render(<ThemeCarousel onSelect={mockOnSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('Creative Purple')).toBeInTheDocument();
    });

    // Click on Creative Purple theme
    const creativeCard = screen.getByLabelText(/Select Creative Purple theme/);
    fireEvent.click(creativeCard);

    expect(mockOnSelect).toHaveBeenCalledWith('creative-purple');
  });

  it('should allow deselection when clicking on already selected theme', async () => {
    render(<ThemeCarousel onSelect={mockOnSelect} selectedId="corporate-blue" />);
    
    await waitFor(() => {
      const selectedCard = screen.getByLabelText(/Selected Corporate Blue theme/);
      expect(selectedCard).toBeInTheDocument();
    });

    // Click on already selected theme to deselect
    const selectedCard = screen.getByLabelText(/Selected Corporate Blue theme/);
    fireEvent.click(selectedCard);

    expect(mockOnSelect).toHaveBeenCalledWith('');
  });

  it('should display category filters when showCategories is true', async () => {
    render(<ThemeCarousel onSelect={mockOnSelect} showCategories={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Corporate')).toBeInTheDocument();
      expect(screen.getByText('Creative')).toBeInTheDocument();
      expect(screen.getByText('Modern')).toBeInTheDocument();
    });
  });

  it('should filter themes by category', async () => {
    render(<ThemeCarousel onSelect={mockOnSelect} showCategories={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Corporate Blue')).toBeInTheDocument();
      expect(screen.getByText('Creative Purple')).toBeInTheDocument();
      expect(screen.getByText('Modern Green')).toBeInTheDocument();
    });

    // Click on Corporate category
    fireEvent.click(screen.getByText('Corporate'));

    await waitFor(() => {
      expect(screen.getByText('Corporate Blue')).toBeInTheDocument();
      expect(screen.queryByText('Creative Purple')).not.toBeInTheDocument();
      expect(screen.queryByText('Modern Green')).not.toBeInTheDocument();
    });
  });

  it('should display navigation arrows', async () => {
    render(<ThemeCarousel onSelect={mockOnSelect} />);
    
    await waitFor(() => {
      const prevButton = screen.getByRole('button', { name: /previous/i });
      const nextButton = screen.getByRole('button', { name: /next/i });
      
      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const { api } = require('../../utils/apiClient');
    api.getThemePresets.mockResolvedValue({
      success: false,
      error: 'Network error'
    });

    render(<ThemeCarousel onSelect={mockOnSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load themes')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    const { api } = require('../../utils/apiClient');
    api.getThemePresets.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ThemeCarousel onSelect={mockOnSelect} />);
    
    expect(screen.getByText('Loading themes...')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', async () => {
    render(<ThemeCarousel onSelect={mockOnSelect} selectedId="corporate-blue" />);
    
    await waitFor(() => {
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('aria-label', 'Choose theme. Only one theme can be selected at a time.');
      
      const selectedTheme = screen.getByRole('radio', { checked: true });
      expect(selectedTheme).toHaveAttribute('aria-checked', 'true');
      expect(selectedTheme).toHaveAttribute('tabIndex', '0');
    });
  });

  it('should prevent multiple selections through localStorage conflicts', async () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    render(<ThemeCarousel onSelect={mockOnSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('Corporate Blue')).toBeInTheDocument();
    });

    // Click on a theme
    const themeCard = screen.getByLabelText(/Select Corporate Blue theme/);
    fireEvent.click(themeCard);

    // Verify localStorage conflicts are cleared
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('ai-ppt-theme');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('theme-selection');
  });
});
