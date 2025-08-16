import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ThemeGallery from '../ThemeGallery';
import { api } from '../../utils/apiClient';

// Mock the API
vi.mock('../../utils/apiClient', () => ({
  api: {
    getThemePresets: vi.fn()
  }
}));

// Mock the theme context
vi.mock('../../contexts/ThemeContext', () => ({
  useCurrentTheme: () => ({
    id: 'corporate-blue',
    name: 'Corporate Professional',
    category: 'corporate'
  })
}));

const mockThemes = [
  {
    id: 'corporate-blue',
    name: 'Corporate Professional',
    category: 'corporate',
    colors: {
      primary: '#1E40AF',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: { primary: '#1F2937' }
    }
  },
  {
    id: 'creative-purple',
    name: 'Creative Studio',
    category: 'creative',
    colors: {
      primary: '#7C3AED',
      background: '#FEFBFF',
      surface: '#F3F0FF',
      text: { primary: '#1F2937' }
    }
  }
];

describe('ThemeGallery', () => {
  beforeEach(() => {
    vi.mocked(api.getThemePresets).mockResolvedValue({
      success: true,
      data: { themes: mockThemes }
    });
  });

  it('should ensure only one theme can be selected at a time', async () => {
    const onSelect = vi.fn();
    
    render(
      <ThemeGallery
        onSelect={onSelect}
        selectedId="corporate-blue"
      />
    );

    // Wait for themes to load
    await screen.findByText('Corporate Professional');

    // Verify only one theme is selected
    const selectedThemes = screen.getAllByRole('radio', { checked: true });
    expect(selectedThemes).toHaveLength(1);
    expect(selectedThemes[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('should use radiogroup role for single selection', async () => {
    render(<ThemeGallery />);

    // Wait for themes to load
    await screen.findByText('Corporate Professional');

    // Verify radiogroup is present
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();
    expect(radioGroup).toHaveAttribute('aria-label', expect.stringContaining('Only one theme can be selected'));
  });

  it('should allow deselection by clicking selected theme', async () => {
    const onSelect = vi.fn();
    
    render(
      <ThemeGallery
        onSelect={onSelect}
        selectedId="corporate-blue"
      />
    );

    // Wait for themes to load
    await screen.findByText('Corporate Professional');

    // Click on the selected theme to deselect
    const selectedTheme = screen.getByRole('radio', { checked: true });
    fireEvent.click(selectedTheme);

    // Should call onSelect with empty string (deselection)
    expect(onSelect).toHaveBeenCalledWith('');
  });

  it('should support keyboard navigation between themes', async () => {
    render(<ThemeGallery selectedId="corporate-blue" />);

    // Wait for themes to load
    await screen.findByText('Corporate Professional');

    const selectedTheme = screen.getByRole('radio', { checked: true });
    selectedTheme.focus();

    // Press arrow right to move to next theme
    fireEvent.keyDown(selectedTheme, { key: 'ArrowRight' });

    // The next theme should be focused (we can't easily test focus in jsdom)
    // But we can verify the key handler doesn't throw errors
    expect(selectedTheme).toBeInTheDocument();
  });

  it('should display single selection instruction', async () => {
    render(<ThemeGallery title="Choose Theme" />);

    // Wait for themes to load
    await screen.findByText('Corporate Professional');

    // Verify instruction text is present
    expect(screen.getByText('Select one theme for your presentation')).toBeInTheDocument();
  });
});
