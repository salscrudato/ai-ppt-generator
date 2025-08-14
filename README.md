# 🎯 AI PowerPoint Generator

> **Professional AI-Powered Presentation Creation Platform**
> Transform your ideas into stunning PowerPoint presentations using advanced AI technology with complete control over the creative process.

[![Version](https://img.shields.io/badge/version-3.1.0-blue.svg)](https://github.com/salscrudato/ai-ppt-generator)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-22+-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.8-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Overview

The AI PowerPoint Generator is a cutting-edge web application that leverages OpenAI's GPT-4 and DALL-E 3 to create professional presentations. Built with modern technologies and optimized for AI agent collaboration, it provides a streamlined three-step workflow that gives users complete control over their presentation creation process.

## ✨ Key Features

### **🎨 Intelligent 3-Step Workflow**
1. **📝 Input & Configuration** - Define your presentation with smart parameters
2. **👁️ AI Preview & Review** - Examine AI-generated content before committing
3. **✏️ Edit & Customize** - Fine-tune every detail to match your vision
4. **📥 Generate & Download** - Receive professional PowerPoint files instantly

### **🧠 Advanced AI Capabilities**
- **Multi-Step AI Processing**: Content → Layout → Images → Refinement pipeline
- **Audience Intelligence**: Tailored content for Executives, Technical teams, Students, etc.
- **Tone Adaptation**: Professional, Casual, Persuasive, Educational, Inspiring voices
- **Content Scaling**: Brief, Moderate, or Comprehensive detail levels
- **Smart Layout Selection**: AI automatically chooses optimal slide layouts
- **DALL-E 3 Integration**: Optional AI-generated images for visual impact

### **🎯 Professional Output**
- **22+ Layout Types**: Title, Bullets, Two-Column, Charts, Timelines, Comparisons
- **Theme System**: Professional color schemes and typography
- **Brand Customization**: Custom colors, fonts, and styling
- **Speaker Notes**: AI-generated presentation guidance
- **Source Citations**: Automatic credibility and reference tracking
- **Universal Compatibility**: Works with PowerPoint, Keynote, Google Slides

## 📁 Project Structure

```
ai-ppt-generator/
├── 📂 functions/                    # Firebase Cloud Functions Backend
│   ├── 📂 src/                     # TypeScript source code
│   │   ├── 📄 index.ts             # Main API endpoints and Express app
│   │   ├── 📄 llm.ts               # OpenAI integration and AI processing
│   │   ├── 📄 pptGenerator.ts      # PowerPoint file generation logic
│   │   ├── 📄 schema.ts            # Zod validation schemas
│   │   ├── 📄 prompts.ts           # AI prompt templates and engineering
│   │   ├── 📄 professionalThemes.ts # Theme system and styling
│   │   ├── 📄 styleValidator.ts    # Style validation and quality checks
│   │   ├── 📂 config/              # Configuration files
│   │   ├── 📂 core/                # Core business logic
│   │   ├── 📂 slides/              # Slide generation modules
│   │   └── 📂 utils/               # Utility functions
│   ├── 📂 test/                    # Jest test suite
│   │   ├── 📄 unit.test.js         # Unit tests for core functionality
│   │   ├── 📄 integration.test.js  # API integration tests
│   │   └── 📄 setup.js             # Test configuration and mocks
│   ├── 📂 scripts/                 # Build and utility scripts
│   ├── 📂 templates/               # PowerPoint templates
│   ├── 📄 package.json             # Backend dependencies and scripts
│   └── 📄 tsconfig.json            # TypeScript configuration
├── 📂 frontend/                     # React Frontend Application
│   ├── 📂 src/                     # React source code
│   │   ├── 📄 App.tsx              # Main application component
│   │   ├── 📄 main.tsx             # React application entry point
│   │   ├── 📄 types.ts             # TypeScript type definitions
│   │   ├── 📄 config.ts            # API configuration and endpoints
│   │   ├── 📂 components/          # Reusable React components
│   │   ├── 📂 layouts/             # Presentation layout definitions
│   │   ├── 📂 themes/              # Frontend theme system
│   │   └── 📂 utils/               # Frontend utility functions
│   ├── 📂 public/                  # Static assets
│   ├── 📄 package.json             # Frontend dependencies and scripts
│   ├── 📄 vite.config.ts           # Vite build configuration
│   ├── 📄 tailwind.config.js       # Tailwind CSS configuration
│   └── 📄 tsconfig.json            # TypeScript configuration
├── 📄 firebase.json                # Firebase project configuration
├── 📄 firestore.rules              # Firestore security rules
├── 📄 firestore.indexes.json       # Firestore database indexes
├── 📄 package.json                 # Root project configuration and scripts
├── 📄 test-app.js                  # Comprehensive test runner
├── 📄 setup-local-dev.sh           # Development environment setup
├── 📄 start-dev.sh                 # Development server launcher
├── 📄 CHANGELOG.md                 # Version history and changes
├── 📄 CONTRIBUTING.md              # Development and contribution guide
└── 📄 README.md                    # This documentation file
```

## 🏗️ Technical Architecture

### **🔧 Backend Stack (Firebase Functions + TypeScript)**
- **Firebase Cloud Functions** - Serverless backend with auto-scaling
- **OpenAI GPT-4** - Latest AI model for intelligent content generation
- **DALL-E 3** - AI-powered image generation and integration
- **PptxGenJS** - Professional PowerPoint file creation library
- **Zod** - Runtime schema validation and type safety
- **Express.js** - RESTful API framework with middleware
- **TypeScript** - Full type safety and enhanced developer experience

### **🎨 Frontend Stack (React + TypeScript)**
- **React 19** - Latest React with concurrent features and optimizations
- **Vite** - Lightning-fast development server and build tool
- **TypeScript** - Complete type safety across the application
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Framer Motion** - Smooth animations and micro-interactions
- **React Icons** - Comprehensive icon library for UI elements

## 🚀 Quick Start Guide

### **📋 Prerequisites**
- **Node.js 22+** - Latest LTS version recommended
- **OpenAI API Key** - Required for AI content generation
- **Git** - For version control and repository cloning
- **Modern Browser** - Chrome, Firefox, Safari, or Edge

### **⚡ Installation & Setup**

#### **1. Clone Repository**
```bash
git clone https://github.com/salscrudato/ai-ppt-generator.git
cd ai-ppt-generator
```

#### **2. Automated Setup**
```bash
# Run the automated setup script
./setup-local-dev.sh
```
*This script will:*
- ✅ Verify Node.js version compatibility
- ✅ Install Firebase CLI if needed
- ✅ Install all dependencies for both frontend and backend
- ✅ Set up development environment

#### **3. Configure OpenAI API Key**
```bash
# Create environment file
cp functions/.env.example functions/.env

# Edit the file and add your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
```

#### **4. Start Development Environment**
```bash
# Launch both frontend and backend servers
./start-dev.sh
```

#### **5. Access Application**
- 🌐 **Frontend Application**: http://localhost:5173
- 🔥 **Firebase Emulators**: http://localhost:4000
- ⚡ **Functions API**: http://localhost:5001

## 📖 Comprehensive Usage Guide

### **🎯 Step-by-Step Workflow**

#### **Step 1: Input & Configuration**
1. **📝 Describe Your Presentation**
   - Enter your slide topic or detailed description
   - Be specific about key points you want to cover
   - Include any important context or background information

2. **👥 Select Target Audience**
   - **Executives**: High-level strategic content with key metrics
   - **Technical**: Detailed technical information with specifications
   - **Sales**: Persuasive content focused on benefits and ROI
   - **Students**: Educational content with clear explanations
   - **Investors**: Financial focus with growth projections
   - **General**: Balanced content suitable for mixed audiences

3. **🎨 Choose Presentation Tone**
   - **Professional**: Formal, authoritative, business-appropriate
   - **Casual**: Relaxed, conversational, approachable
   - **Persuasive**: Compelling, action-oriented, influential
   - **Educational**: Informative, clear, instructional
   - **Inspiring**: Motivational, uplifting, visionary

4. **📏 Set Content Depth**
   - **Brief**: Concise, high-level overview (3-5 key points)
   - **Moderate**: Balanced detail with supporting information
   - **Comprehensive**: Detailed analysis with examples and context

#### **Step 2: AI Preview & Review**
- 🤖 **AI Processing**: Multi-step content generation pipeline
- 👁️ **Content Review**: Examine AI-generated title, layout, and content
- ✅ **Quality Check**: Verify accuracy and relevance
- 🔄 **Iteration Option**: Regenerate if needed

#### **Step 3: Edit & Customize**
- ✏️ **Content Editing**: Modify title, bullets, paragraphs
- 🎨 **Layout Adjustment**: Change slide layout if needed
- 📝 **Speaker Notes**: Add presentation guidance
- 🔗 **Source Citations**: Include references and credibility

#### **Step 4: Generate & Download**
- 🚀 **PowerPoint Creation**: Professional .pptx file generation
- 📥 **Instant Download**: Receive file immediately
- 🔄 **Universal Compatibility**: Works with PowerPoint, Keynote, Google Slides
- 🎨 **Professional Formatting**: Includes themes, colors, and styling

## 🔌 API Reference

### **Core Endpoints**

#### **`GET /health`** - Service Health Check
```bash
curl http://localhost:5001/plsfixthx-ai/us-central1/api/health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "3.3.2-enhanced-fixed",
  "service": "AI PowerPoint Generator",
  "environment": "development"
}
```

#### **`POST /draft`** - Generate Slide Draft
Creates AI-generated slide content for preview and editing.

**Request:**
```json
{
  "prompt": "Quarterly sales results showing 25% growth with key achievements",
  "audience": "executives",
  "tone": "professional",
  "contentLength": "moderate",
  "withImage": false,
  "design": {
    "theme": "corporate-blue",
    "brand": {
      "primary": "#3b82f6",
      "secondary": "#64748b"
    }
  }
}
```

**Response:**
```json
{
  "title": "Q3 Sales Results",
  "layout": "title-bullets",
  "bullets": [
    "25% revenue growth year-over-year",
    "Exceeded targets in all key markets",
    "Strong customer acquisition metrics",
    "Positive outlook for Q4"
  ],
  "notes": "Emphasize the consistent growth trend...",
  "sources": ["Internal sales data", "Market analysis"]
}
```

#### **`POST /generate`** - Create PowerPoint File
Generates final .pptx file from slide specification.

**Request:**
```json
{
  "spec": {
    "title": "Q3 Sales Results",
    "layout": "title-bullets",
    "bullets": ["25% revenue growth", "Key achievements", "Future outlook"],
    "design": { "theme": "corporate-blue" }
  },
  "withImage": false,
  "themeId": "corporate-blue"
}
```

**Response:** Binary .pptx file download

## 🎨 Customization & Themes

### **🎯 Professional Theme System**
The application includes a comprehensive theme system with carefully crafted color palettes:

#### **Corporate Themes**
- **Corporate Blue**: Professional blue with clean typography
- **Finance Navy**: Deep navy for financial presentations
- **Consulting Charcoal**: Sophisticated gray for consulting decks

#### **Creative Themes**
- **Creative Purple**: Vibrant purple for innovative presentations
- **Marketing Magenta**: Bold magenta for marketing materials
- **Vibrant Coral**: Energetic coral for dynamic content

#### **Specialized Themes**
- **Education Green**: Calming green for educational content
- **Healthcare Teal**: Trustworthy teal for healthcare presentations
- **Startup Orange**: Energetic orange for startup pitches

### **🎨 Brand Customization**
- **Primary Color**: Main accent color for titles and highlights
- **Secondary Color**: Supporting color for text and elements
- **Accent Color**: Call-to-action and emphasis elements
- **Typography**: Professional font pairings optimized for readability
- **Automatic Contrast**: Ensures WCAG accessibility compliance

### **📐 Layout Types (22+ Available)**

#### **Basic Layouts**
- **Title**: Clean title-only slides for section breaks
- **Title-Bullets**: Classic bullet point presentations
- **Title-Paragraph**: Narrative content with flowing text

#### **Advanced Layouts**
- **Two-Column**: Side-by-side content comparison
- **Image-Right/Left**: Content with AI-generated images
- **Quote**: Centered inspirational quotes
- **Chart**: Data visualization with multiple chart types
- **Timeline**: Chronological process flows
- **Comparison Table**: Feature and option comparisons
- **Before-After**: Transformation showcases
- **Problem-Solution**: Structured problem-solving format

## 🧪 Testing & Quality Assurance

### **🔍 Comprehensive Test Suite**

#### **Application Workflow Test**
```bash
# Run complete end-to-end workflow test
node test-app.js
```
*Tests the entire user journey from input to PowerPoint generation*

#### **Backend API Tests**
```bash
# Unit tests for core functionality
cd functions && npm test

# Integration tests for API endpoints
cd functions && npm run test:integration
```

#### **Frontend Component Tests**
```bash
# React component and UI tests
cd frontend && npm test

# Run tests in watch mode during development
cd frontend && npm run test:watch
```

### **🎯 Test Coverage Areas**
- ✅ **AI Content Generation**: Prompt processing and response quality
- ✅ **PowerPoint Creation**: File generation and formatting
- ✅ **API Endpoints**: Request/response validation and error handling
- ✅ **Layout Systems**: All 22+ layout types and theme applications
- ✅ **User Interface**: Component behavior and user interactions
- ✅ **Performance**: Response times and memory usage optimization
- ✅ **Error Handling**: Graceful failure and recovery scenarios

## 🤖 AI Agent Development Guide

### **🎯 Optimized for AI Collaboration**
This codebase is specifically designed for AI agent development and iteration:

#### **Core Architecture Principles**
- **Clean Structure**: Logical file organization with clear separation of concerns
- **Type Safety**: Full TypeScript implementation with explicit interfaces
- **Comprehensive Documentation**: Every module includes detailed AI-readable comments
- **Modular Design**: Single-responsibility modules for easy understanding and modification
- **Consistent Patterns**: Standardized naming conventions and code patterns throughout

#### **Key Files for AI Agents**
- **`functions/src/index.ts`**: Main API endpoints and request handling
- **`functions/src/llm.ts`**: OpenAI integration and AI processing logic
- **`functions/src/pptGenerator.ts`**: PowerPoint file generation engine
- **`functions/src/prompts.ts`**: AI prompt templates and engineering
- **`functions/src/schema.ts`**: Zod validation schemas and type definitions
- **`functions/src/professionalThemes.ts`**: Theme system and styling
- **`frontend/src/App.tsx`**: Main React application component
- **`frontend/src/types.ts`**: Shared TypeScript type definitions

#### **AI Prompt Management**
All AI prompts are centralized in `functions/src/prompts.ts`:
- **SYSTEM_PROMPT**: Defines AI role and output format
- **AUDIENCE_GUIDANCE**: Content adaptation for different audiences
- **TONE_SPECIFICATIONS**: Style and voice guidelines
- **CONTENT_LENGTH_SPECS**: Detail level specifications
- **LAYOUT_SELECTION**: Smart layout recommendation logic

#### **Development Workflow for AI Agents**
1. **Understand Structure**: Review this README and explore the codebase
2. **Run Tests**: Use `npm run test` to validate current functionality
3. **Make Changes**: Edit relevant files with proper TypeScript types
4. **Test Changes**: Run tests and use `npm run dev` for live testing
5. **Validate**: Ensure all tests pass and functionality works as expected

## 🚀 Production Deployment

### **📦 Build Process**

#### **Backend Build**
```bash
cd functions
npm run build          # Compile TypeScript to JavaScript
npm run test          # Run all tests before deployment
```

#### **Frontend Build**
```bash
cd frontend
npm run build         # Create optimized production build
npm run preview       # Preview production build locally
```

#### **Complete Deployment**
```bash
# Build everything and deploy to Firebase
npm run build
firebase deploy

# Deploy specific services
firebase deploy --only functions    # Backend API only
firebase deploy --only hosting     # Frontend only
```

### **🔧 Environment Configuration**

#### **Production Environment Variables**
```bash
# Set production OpenAI API key
firebase functions:config:set openai.api_key="your_production_key"

# View current configuration
firebase functions:config:get
```

#### **Local Development Environment**
```bash
# functions/.env (for local development)
OPENAI_API_KEY=your_development_key_here
NODE_ENV=development
```

### **📊 Performance Monitoring**
- **Firebase Performance**: Automatic performance tracking
- **Error Reporting**: Comprehensive error logging and alerts
- **Usage Analytics**: API endpoint usage and response time monitoring
- **Cost Tracking**: OpenAI API usage and cost optimization

## 🤝 Contributing & Development

### **🔧 Development Workflow**
1. **Fork & Clone**: Fork the repository and clone your fork
2. **Setup Environment**: Run `./setup-local-dev.sh` for automated setup
3. **Create Branch**: Create a feature branch from `main`
4. **Develop**: Make changes with comprehensive testing
5. **Test**: Run full test suite with `node test-app.js`
6. **Document**: Update documentation and comments for AI consumption
7. **Submit PR**: Create pull request with detailed description

### **📋 Contribution Guidelines**
- **Code Style**: Follow existing TypeScript and React patterns
- **Testing**: Add tests for all new functionality
- **Documentation**: Update README and inline comments
- **AI Optimization**: Ensure code is AI-agent friendly
- **Performance**: Consider OpenAI API cost implications
- **Security**: Follow security best practices for API keys

### **🎯 Areas for Contribution**
- **New Layout Types**: Additional PowerPoint slide layouts
- **Theme Expansion**: More professional color schemes
- **AI Improvements**: Enhanced prompt engineering
- **Performance**: Optimization and caching strategies
- **Accessibility**: WCAG compliance improvements
- **Internationalization**: Multi-language support

## 📄 License & Credits

### **License**
MIT License - see [LICENSE](LICENSE) file for complete details.

### **Credits**
- **OpenAI**: GPT-4 and DALL-E 3 AI models
- **Firebase**: Cloud hosting and serverless functions
- **PptxGenJS**: PowerPoint file generation library
- **React & Vite**: Modern frontend development stack
- **Tailwind CSS**: Utility-first CSS framework

### **Version History**
- **v3.3.2**: Enhanced AI processing with multi-step pipeline
- **v3.1.0**: Optimized user experience and performance
- **v2.0.0**: Complete TypeScript rewrite with modern stack
- **v1.0.0**: Initial release with basic AI generation

---

**🚀 Ready to create amazing presentations with AI?**
[Get Started](#-quick-start-guide) • [View API Docs](#-api-reference) • [Contribute](#-contributing--development)

- OpenAI for GPT-4 API
- PptxGenJS for PowerPoint generation
- React team for the excellent framework
- All contributors and testers
