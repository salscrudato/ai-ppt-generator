# Contributing to AI PowerPoint Generator

Thank you for your interest in contributing to the AI PowerPoint Generator! This guide will help you get started with development, testing, and contributing to this professional presentation platform.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (recommended: use nvm for version management)
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Git** for version control
- **OpenAI API Key** for AI functionality

### Development Setup

1. **Clone and Install**:
```bash
git clone https://github.com/salscrudato/ai-ppt-generator.git
cd ai-ppt-generator

# Install root dependencies
npm install

# Install function dependencies
cd functions
npm install
cd ..
```

2. **Environment Configuration**:
```bash
# Create functions/.env
cd functions
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ORG_ID=your_org_id_here
NODE_ENV=development
EOF
cd ..
```

3. **Start Development**:
```bash
# Terminal 1: Start Firebase emulators
npm run dev:functions

# Terminal 2: Start React frontend (if working on frontend)
npm start
```

4. **Verify Setup**:
```bash
# Run tests to ensure everything works
cd functions
npm test
```

## 🏗️ Architecture Overview

### Project Structure
```
functions/src/
├── core/                    # Core system components
│   ├── theme/              # Theme system and design tokens
│   │   ├── tokens.ts       # Design token definitions
│   │   ├── themes.ts       # Theme configurations
│   │   └── utilities.ts    # Color and typography utilities
│   ├── layout/             # Layout engine
│   │   ├── primitives.ts   # Basic layout building blocks
│   │   ├── grid.ts         # 12-column grid system
│   │   └── spacing.ts      # Consistent spacing utilities
│   └── compose/            # Presentation orchestration
├── slides/                 # Slide generators
│   ├── title.ts           # Title slide generator
│   ├── bullets.ts         # Bullet slide generator
│   ├── twoColumn.ts       # Two-column layout generator
│   ├── metrics.ts         # Metrics dashboard generator
│   └── index.ts           # Slide generator registry
├── index.ts               # Main API endpoints
├── llm.ts                 # OpenAI integration
├── pptGenerator.ts        # PowerPoint file generation
├── schema.ts              # Zod validation schemas
├── prompts.ts             # AI prompt engineering
├── professionalThemes.ts  # Legacy theme system
└── styleValidator.ts      # Quality validation
```

### Key Concepts

#### Design Tokens
All visual properties are defined through design tokens:
```typescript
interface ThemeTokens {
  palette: ColorPalette;      // Colors with semantic meanings
  typography: TypographyScale; // Font sizes, weights, line heights
  spacing: SpacingScale;      // Consistent spacing values
  layout: LayoutConstraints;  // Slide dimensions and margins
}
```

#### Layout Primitives
Slides are built using composable primitives:
```typescript
interface Box {
  x: number; y: number; width: number; height: number;
  padding?: SpacingConfig; margin?: SpacingConfig;
}

interface TextBlock extends Box {
  text: string; fontSize: number; color: string;
  align: 'left' | 'center' | 'right'; wrap: boolean;
}
```

#### Slide Generators
Each slide type has a dedicated generator function:
```typescript
function buildTitleSlide(
  config: TitleSlideConfig,
  theme: ThemeTokens
): SlideBuildResult {
  // Generate layout specification
  // Validate against design standards
  // Return structured result with metadata
}
```

## 🧪 Testing Guidelines

### Test Structure
```
functions/test/
├── slides/                 # Slide generator tests
│   └── slideGenerators.test.ts
├── integration.test.ts     # End-to-end tests
└── setup.ts               # Test configuration
```

### Running Tests
```bash
cd functions

# Run all tests
npm test

# Run specific test file
npm test -- slideGenerators.test.ts

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests

#### Unit Tests for Slide Generators
```typescript
describe('Title Slide Generator', () => {
  it('should create a professional title slide', () => {
    const config: TitleSlideConfig = {
      title: 'Professional Presentation',
      subtitle: 'Excellence in Design'
    };

    const result = buildTitleSlide(config, neutralTheme);

    expect(result.layout.content).toHaveLength(2);
    expect(result.metadata.errors).toHaveLength(0);
    expect(result.metadata.shapeCount).toBe(2);
  });
});
```

#### Validation Tests
```typescript
it('should validate layout positioning', () => {
  const result = buildTitleSlide(config, theme);
  const validation = validateSlideBuildResult(result, theme);

  expect(validation.isValid).toBe(true);
  expect(validation.score).toBeGreaterThan(70);
});
```

### Test Quality Standards
- **Coverage Target**: 85%+ line coverage
- **Quality Validation**: All generated slides must score 70+
- **Performance**: Tests should complete within 30 seconds
- **Reliability**: Tests must be deterministic and repeatable

## 🎨 Adding New Slide Types

### Step 1: Create Slide Generator

Create a new file in `functions/src/slides/`:

```typescript
// functions/src/slides/newType.ts
import { ThemeTokens } from '../core/theme/tokens';
import { LayoutSpec, SlideBuildResult, createTextBlock } from '../core/layout/primitives';

export interface NewTypeSlideConfig {
  title: string;
  // ... other configuration properties
}

export function buildNewTypeSlide(
  config: NewTypeSlideConfig,
  theme: ThemeTokens
): SlideBuildResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    // Create layout elements using primitives
    const content = [
      // ... build slide content
    ];

    const layout: LayoutSpec = {
      content,
      background: { color: theme.palette.background }
    };

    return {
      layout,
      metadata: {
        usedText: config.title.length,
        overflowText: 0,
        shapeCount: content.length,
        warnings,
        errors
      }
    };
  } catch (error) {
    // Handle errors gracefully with fallback
    errors.push(`Failed to build slide: ${error.message}`);
    return createFallbackSlide(config, theme, warnings, errors);
  }
}
```

### Step 2: Add Schema Validation

Update `functions/src/schema.ts`:

```typescript
export const NewTypeSlideConfigSchema = z.object({
  type: z.literal('newType'),
  title: VALIDATION_PATTERNS.title,
  // ... other validation rules
});

// Add to union type
export const SlideConfigSchema = z.discriminatedUnion('type', [
  TitleSlideConfigSchema,
  BulletSlideConfigSchema,
  TwoColumnSlideConfigSchema,
  MetricsSlideConfigSchema,
  NewTypeSlideConfigSchema  // Add here
]);
```

### Step 3: Register Generator

Update `functions/src/slides/index.ts`:

```typescript
// Export new types
export { buildNewTypeSlide, type NewTypeSlideConfig } from './newType';

// Add to slide type union
export type SlideType = 'title' | 'bullets' | 'twoColumn' | 'metrics' | 'newType';

// Register generator
export const slideGenerators: Record<SlideType, SlideGenerator> = {
  title: buildTitleSlide,
  bullets: buildBulletSlide,
  twoColumn: buildTwoColumnSlide,
  metrics: buildMetricsSlide,
  newType: buildNewTypeSlide  // Add here
};
```

### Step 4: Add Tests

Create tests in `functions/test/slides/`:

```typescript
describe('New Type Slide Generator', () => {
  it('should create a new type slide', () => {
    const config: NewTypeSlideConfig = {
      title: 'Test New Type',
      // ... test configuration
    };

    const result = buildNewTypeSlide(config, neutralTheme);

    expect(result).toBeDefined();
    expect(result.metadata.errors).toHaveLength(0);
    expect(result.layout.content.length).toBeGreaterThan(0);
  });

  it('should validate against quality standards', () => {
    const result = buildNewTypeSlide(config, theme);
    const validation = validateSlideBuildResult(result, theme);

    expect(validation.score).toBeGreaterThan(70);
  });
});
```

### Step 5: Add Prompt Support

Update `functions/src/prompts.ts`:

```typescript
case 'newType':
  return `${basePrompt}

**New Type Slide Requirements:**
- Title: Clear, descriptive heading
- Content: Specific requirements for this slide type
- Layout: Optimal arrangement for content type

**JSON Schema:**
{
  "type": "newType",
  "title": "string (required)",
  // ... schema definition
}

Generate a professional new type slide configuration in JSON format:`;
```

## 🎨 Theme Development

### Creating Custom Themes

1. **Define Theme Tokens**:
```typescript
const customTheme: ThemeTokens = {
  palette: {
    primary: '#your-brand-color',
    secondary: '#supporting-color',
    accent: '#accent-color',
    background: '#background-color',
    surface: '#surface-color',
    text: {
      primary: '#primary-text',
      secondary: '#secondary-text',
      inverse: '#inverse-text',
      muted: '#muted-text'
    },
    // ... semantic colors, borders, chart colors
  },
  typography: {
    fontFamilies: {
      heading: 'Your-Brand-Font, Calibri, sans-serif',
      body: 'Your-Body-Font, Calibri, sans-serif',
      mono: 'Consolas, monospace'
    },
    // ... font weights, sizes, line heights
  },
  // ... spacing, radii, shadows, layout
};
```

2. **Validate Theme**:
```typescript
// Ensure all colors meet contrast requirements
const validation = validateAccessibility(
  customTheme.palette.text.primary,
  customTheme.palette.background
);

expect(validation.wcagAA).toBe(true);
```

3. **Register Theme**:
```typescript
export const themes = {
  neutral: neutralTheme,
  executive: executiveTheme,
  colorPop: colorPopTheme,
  custom: customTheme  // Add here
} as const;
```

### Theme Guidelines
- **Contrast**: All text/background combinations must meet WCAG AA (4.5:1)
- **Consistency**: Use design tokens for all visual properties
- **Accessibility**: Consider color blindness and low vision users
- **Professional**: Maintain business-appropriate color choices

## 🔧 Code Quality Standards

### TypeScript Configuration
- **Strict Mode**: Enabled for maximum type safety
- **No Any**: Avoid `any` type, use proper type definitions
- **Exhaustive Checks**: Handle all union type cases
- **Null Safety**: Proper null/undefined handling

### ESLint Rules
```json
{
  "extends": ["@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "max-lines-per-function": ["warn", 100],
    "complexity": ["warn", 10]
  }
}
```

### Code Style
- **Function Length**: Maximum 100 lines per function
- **Complexity**: Maximum cyclomatic complexity of 10
- **Documentation**: JSDoc comments for all public functions
- **Naming**: Descriptive names, avoid abbreviations

### Performance Guidelines
- **Memory**: Avoid memory leaks, clean up resources
- **Async**: Use proper async/await patterns
- **Caching**: Cache expensive operations when possible
- **Lazy Loading**: Load heavy dependencies on demand

## 📝 Documentation Standards

### JSDoc Comments
```typescript
/**
 * Build a professional title slide with proper hierarchy and spacing
 *
 * @param config - Title slide configuration including title, subtitle, and metadata
 * @param theme - Theme tokens for consistent styling and colors
 * @returns Slide build result with layout specification and metadata
 *
 * @example
 * ```typescript
 * const config = { title: 'My Presentation', subtitle: 'Professional Design' };
 * const result = buildTitleSlide(config, neutralTheme);
 * ```
 */
export function buildTitleSlide(
  config: TitleSlideConfig,
  theme: ThemeTokens
): SlideBuildResult {
  // Implementation
}
```

### README Updates
When adding new features:
1. Update feature list in main README
2. Add usage examples
3. Update API documentation
4. Include migration notes for breaking changes

## 🚀 Deployment and Release

### Pre-Release Checklist
- [ ] All tests pass (`npm test`)
- [ ] Code coverage ≥85% (`npm run test:coverage`)
- [ ] ESLint passes with 0 warnings (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Performance benchmarks meet targets
- [ ] Documentation updated
- [ ] Breaking changes documented

### Release Process
1. **Version Bump**: Update version in `package.json`
2. **Changelog**: Document changes in `CHANGELOG.md`
3. **Tag Release**: Create git tag with version
4. **Deploy**: Use Firebase CLI for production deployment
5. **Monitor**: Watch for errors and performance issues

### Deployment Commands
```bash
# Build and test
npm run build
npm test

# Deploy to staging
firebase deploy --only functions --project staging

# Deploy to production (after approval)
firebase deploy --only functions --project production
```

## 🤝 Pull Request Guidelines

### Before Submitting
1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Follow** coding standards and add tests
4. **Run** full test suite: `npm test`
5. **Update** documentation as needed

### PR Requirements
- **Description**: Clear description of changes and motivation
- **Tests**: All new code must have tests
- **Documentation**: Update relevant documentation
- **Breaking Changes**: Clearly marked and documented
- **Performance**: No significant performance regressions

### Review Process
1. **Automated Checks**: CI/CD pipeline must pass
2. **Code Review**: At least one maintainer approval required
3. **Testing**: Manual testing for complex features
4. **Performance**: Benchmark validation for performance-critical changes

## 📞 Getting Help

### Resources
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community support
- **Documentation**: Comprehensive guides and API reference
- **Code Examples**: Working examples in test files

### Contact
- **Maintainer**: Sal Scrudato (sal.scrudato@gmail.com)
- **Issues**: [GitHub Issues](https://github.com/salscrudato/ai-ppt-generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/salscrudato/ai-ppt-generator/discussions)

---

**Thank you for contributing to the AI PowerPoint Generator! Your contributions help make professional presentations accessible to everyone.**