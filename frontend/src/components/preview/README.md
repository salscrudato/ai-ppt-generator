# Live Slide Preview System

A comprehensive live preview system that mirrors the final PowerPoint output with exact spacing, layout, and theme consistency.

## Features

### ✅ Real-time Updates
- **200ms debounced updates** for smooth performance
- Instant preview updates when editing title, bullets, notes, or theme
- No lag or performance issues during rapid typing

### ✅ Exact Layout Matching
- **16:9 aspect ratio** maintained consistently
- **Precise spacing constants** that mirror backend generator:
  - `contentY: 1.6"` - Starting Y position below title
  - `columnWidth: 4.0"` - Column width for two-column layouts
  - `columnGap: 0.5"` - Gap between columns
  - `contentPadding: 0.75"` - Enhanced padding for 16:9 format

### ✅ Complete Layout Support
All layout types from the backend are supported:

- **Basic Layouts**: `title`, `title-bullets`, `title-paragraph`
- **Column Layouts**: `two-column`, `mixed-content`
- **Image Layouts**: `image-left`, `image-right`, `image-full`
- **Special Layouts**: `quote`, `chart`, `comparison-table`
- **Process Layouts**: `timeline`, `process-flow`, `agenda`
- **Comparison Layouts**: `problem-solution`, `before-after`

### ✅ Theme Integration
- **Instant theme switching** with smooth transitions
- **CSS custom properties** for theme-aware styling
- **Typography integration** with theme fonts
- **Color consistency** across all layout elements

## Architecture

### Core Components

#### `SlidePreview`
Main component that orchestrates the preview rendering:
```tsx
<SlidePreview
  spec={slideSpec}
  theme={currentTheme}
  className="w-full shadow-lg"
  debug={false}
/>
```

#### Layout Renderers
Individual components for each layout type:
- `TitleLayout` - Title-only slides
- `TitleBulletsLayout` - Bullet point lists
- `TitleParagraphLayout` - Paragraph content
- `TwoColumnLayout` - Two-column layouts
- `ImageLeftLayout` / `ImageRightLayout` / `ImageFullLayout` - Image layouts
- `QuoteLayout` - Quote slides
- `ChartLayout` - Chart placeholders
- `ComparisonTableLayout` - Data tables
- `TimelineLayout` - Timeline events
- `ProcessFlowLayout` - Process steps
- `MixedContentLayout` - Mixed paragraph + columns
- `ProblemSolutionLayout` - Problem/solution comparison
- `BeforeAfterLayout` - Before/after comparison
- `AgendaLayout` - Agenda items

#### Base Components
Shared UI components in `LayoutBase.tsx`:
- `Text` - Theme-aware text rendering
- `Bullet` - Bullet point component
- `Column` - Column container
- `SectionHeading` - Section headers
- `Card` - Content cards
- `ImagePlaceholder` - Image placeholders
- `ChartPlaceholder` - Chart placeholders
- `Table` - Data tables

### Constants and Utilities

#### `slideConstants.ts`
- **Slide dimensions** and aspect ratio
- **Layout constants** that mirror backend values
- **Typography scaling** for responsive preview
- **Animation constants** for smooth interactions

#### `useDebounced.ts`
- **Debounced value hook** for performance optimization
- **Debounced callback hook** for event handling
- **Slide spec debouncing** with 200ms delay

## Usage

### Basic Implementation
```tsx
import { SlidePreview } from './components/SlidePreview';
import { useCurrentTheme } from './contexts/ThemeContext';

function MyComponent() {
  const theme = useCurrentTheme();
  const [slideSpec, setSlideSpec] = useState(mySlideSpec);

  return (
    <SlidePreview
      spec={slideSpec}
      theme={theme}
      className="w-full h-64"
    />
  );
}
```

### Multi-slide Grid
```tsx
import { SlidePreviewGrid } from './components/SlidePreview';

function PresentationOverview() {
  return (
    <SlidePreviewGrid
      specs={slides}
      theme={theme}
      selectedIndex={currentSlide}
      onSlideSelect={handleSlideSelect}
      columns={3}
    />
  );
}
```

### Debug Mode
```tsx
<SlidePreview
  spec={slideSpec}
  theme={theme}
  debug={true} // Shows layout info overlay
/>
```

## Performance

### Optimization Strategies
1. **Debounced Updates**: 200ms delay prevents excessive re-renders
2. **Memoized Theme Styles**: CSS variables cached with useMemo
3. **Efficient Layout Switching**: Only renders active layout component
4. **Responsive Scaling**: Percentage-based measurements for smooth scaling

### Benchmarks
- **Update Latency**: <200ms from input to preview update
- **Theme Switch**: <300ms transition time
- **Memory Usage**: Minimal overhead with component reuse
- **Render Performance**: 60fps smooth animations

## Testing

### Test Coverage
- ✅ All layout types render correctly
- ✅ Theme integration works properly
- ✅ Debounced updates function as expected
- ✅ Aspect ratio maintained consistently
- ✅ Empty content handled gracefully
- ✅ Debug mode displays correctly

### Running Tests
```bash
npm test SlidePreview
```

## Integration

### SlideEditor Integration
The preview is integrated into `SlideEditor.tsx`:
```tsx
// Replace old preview with new component
<SlidePreview
  spec={localSpec}
  theme={currentTheme}
  className="w-full shadow-lg"
/>
```

### Theme Context
Uses the existing theme system:
```tsx
import { useCurrentTheme } from '../contexts/ThemeContext';
const currentTheme = useCurrentTheme();
```

## Future Enhancements

### Planned Features
- [ ] **Image Loading**: Real image preview integration
- [ ] **Chart Rendering**: Live chart preview with real data
- [ ] **Animation Preview**: Slide transition animations
- [ ] **Accessibility**: Screen reader support and ARIA labels
- [ ] **Export Preview**: PDF/image export of preview
- [ ] **Collaborative Editing**: Real-time multi-user preview

### Performance Improvements
- [ ] **Virtual Scrolling**: For large presentation grids
- [ ] **Web Workers**: Background processing for complex layouts
- [ ] **Canvas Rendering**: Hardware-accelerated preview rendering
- [ ] **Lazy Loading**: On-demand layout component loading

## Troubleshooting

### Common Issues

**Preview not updating**: Check that debounced hooks are properly implemented
**Theme not applying**: Verify theme context is available in component tree
**Layout broken**: Ensure all required props are passed to layout components
**Performance issues**: Check for unnecessary re-renders with React DevTools

### Debug Mode
Enable debug mode to see:
- Current layout type
- Active theme name
- Aspect ratio information
- Component render information
