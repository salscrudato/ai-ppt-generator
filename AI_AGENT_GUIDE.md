# 🤖 AI Agent Development Guide

## Overview
This codebase has been optimized for AI coding agents to understand, maintain, and extend. The architecture is simplified, well-documented, and follows clear patterns that make it easy for AI agents to work with.

## 🏗️ Architecture Overview

### Core Components
```
ai-ppt-generator/
├── 📂 frontend/                    # React TypeScript Frontend
│   ├── 📂 src/
│   │   ├── 📄 App.tsx             # Main application component
│   │   ├── 📄 components/         # UI components
│   │   ├── 📄 hooks/              # React hooks
│   │   ├── 📄 themes/             # Theme definitions
│   │   └── 📄 utils/              # Utility functions
├── 📂 functions/                   # Firebase Cloud Functions Backend
│   ├── 📂 src/
│   │   ├── 📄 index.ts            # Main API endpoints
│   │   ├── 📄 llm.ts              # OpenAI integration
│   │   ├── 📄 pptGenerator.ts     # PowerPoint generation
│   │   ├── 📄 schema.ts           # Data validation schemas
│   │   ├── 📄 professionalThemes.ts # Theme system
│   │   └── 📄 slides/             # Slide generation logic
└── 📄 test-basic-functionality.js # Simple test suite
```

## 🎯 Core Functionality

### PowerPoint Generation Flow
1. **User Input** → Frontend collects prompt and parameters
2. **AI Processing** → Backend uses OpenAI to generate slide content
3. **Slide Building** → Core slide builders create structured content
4. **PowerPoint Creation** → PptxGenJS generates .pptx file
5. **File Download** → User receives professional presentation

### Key API Endpoints
- `GET /health` - Service health check
- `POST /draft` - Generate slide content with AI
- `POST /generate` - Create PowerPoint file from slide spec
- `POST /themes` - Get theme recommendations
- `GET /theme-presets` - Get available themes

## 🛠️ Development Guidelines

### For AI Agents Working on This Codebase

#### 1. Understanding the Data Flow
```typescript
// Input from user
interface GenerationParams {
  prompt: string;
  audience: string;
  tone: string;
  contentLength: string;
}

// AI-generated slide specification
interface SlideSpec {
  title: string;
  layout: string;
  bullets?: string[];
  paragraph?: string;
  imagePrompt?: string;
  design?: {
    theme: string;
    backgroundStyle?: string;
  };
}

// PowerPoint generation options
interface PowerPointOptions {
  theme: ProfessionalTheme;
  includeImages?: boolean;
  includeNotes?: boolean;
  quality?: 'draft' | 'standard' | 'high';
}
```

#### 2. Key Files to Understand

**Frontend (React)**
- `App.tsx` - Main application logic and state management
- `components/PromptInput.tsx` - User input collection
- `components/SlideEditor.tsx` - Slide editing interface
- `themes/professionalThemes.ts` - Theme definitions

**Backend (Node.js/TypeScript)**
- `index.ts` - Express API endpoints and request handling
- `llm.ts` - OpenAI integration and AI processing
- `pptGenerator.ts` - Core PowerPoint generation logic
- `slides/` - Individual slide type builders

#### 3. Adding New Features

**Adding a New Slide Layout:**
1. Define the layout in `schema.ts`
2. Create a builder function in `slides/`
3. Add the layout to the slide generation logic in `pptGenerator.ts`
4. Update the frontend to support the new layout

**Adding a New Theme:**
1. Define the theme in `professionalThemes.ts`
2. Add color palette and typography settings
3. Test with existing slide layouts
4. Update theme selection logic

**Extending AI Capabilities:**
1. Modify prompts in `llm.ts`
2. Update the schema validation in `schema.ts`
3. Test with various input types
4. Ensure backward compatibility

#### 4. Testing Strategy

**Basic Functionality Test:**
```bash
npm test
```

**Manual Testing:**
1. Start development server: `npm run dev`
2. Test slide generation with various prompts
3. Verify PowerPoint file creation and download
4. Check theme application and styling

#### 5. Common Patterns

**Error Handling:**
```typescript
try {
  const result = await someOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error(`Operation failed: ${error.message}`);
}
```

**API Response Format:**
```typescript
// Success
{ success: true, data: result }

// Error
{ success: false, error: message, code: errorCode }
```

**Slide Generation Pattern:**
```typescript
function buildSlideType(spec: SlideSpec, theme: ProfessionalTheme): void {
  // 1. Validate input
  // 2. Apply theme styling
  // 3. Add content elements
  // 4. Handle edge cases
}
```

## 🚀 Quick Start for AI Agents

### 1. Understanding the Current State
- Codebase is simplified and optimized for reliability
- Complex features have been removed to focus on core functionality
- All dependencies are clearly defined and minimal

### 2. Making Changes
- Always run tests after modifications
- Follow TypeScript strict mode requirements
- Maintain backward compatibility for API endpoints
- Document any new interfaces or significant changes

### 3. Debugging
- Check browser console for frontend issues
- Check Firebase Functions logs for backend issues
- Use the health endpoint to verify service status
- Test with the basic functionality test suite

## 📚 Key Concepts

### Theme System
Themes control the visual appearance of slides including colors, fonts, and spacing. Each theme is defined with:
- Color palette (primary, secondary, accent, background)
- Typography settings (font families, sizes, weights)
- Spacing and layout constants

### Slide Specifications
All slides are defined using a common `SlideSpec` interface that includes:
- Title and content
- Layout type
- Design preferences
- Optional image generation

### AI Integration
The system uses OpenAI's GPT models to:
- Generate slide content from user prompts
- Create appropriate titles and bullet points
- Suggest relevant themes based on content
- Generate image prompts for visual elements

## 🔧 Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor API usage and costs
- Review and update AI prompts for better results
- Test with new OpenAI model versions

### Performance Optimization
- Monitor PowerPoint generation times
- Optimize image processing if needed
- Cache theme recommendations
- Minimize API calls where possible

---

This guide provides AI agents with everything needed to understand, maintain, and extend the AI PowerPoint Generator codebase effectively.
