# AI PowerPoint Generator

A streamlined web application that uses AI to generate professional PowerPoint presentations with an intuitive three-step workflow for maximum control and customization.

## ✨ Features

### **Simple 3-Step Workflow**
1. **Input & Parameters** - Describe your slide with audience and tone settings
2. **AI Preview** - Review and refine the generated content
3. **Download** - Get your professional PowerPoint file instantly

### **Smart AI Controls**
- **Audience Targeting**: General, Executives, Technical, Sales, Investors, Students
- **Tone Selection**: Professional, Casual, Persuasive, Educational, Inspiring
- **Content Length**: Brief, Moderate, or Detailed content generation
- **Professional Themes**: Multiple color schemes and layouts
- **AI Images**: Optional DALL-E generated images for visual impact

### **Professional Output**
- Multiple layout types (Title, Bullets, Two-Column, Charts, etc.)
- Brand color customization
- Speaker notes and source citations
- High-quality PowerPoint (.pptx) files
- Compatible with PowerPoint, Keynote, and Google Slides

## 🏗️ Architecture

### Backend (Firebase Functions + TypeScript)
- **Firebase Cloud Functions** - Serverless backend hosting
- **OpenAI GPT-4o** - Latest AI model for content generation
- **PptxGenJS** - Professional PowerPoint file creation
- **DALL-E 3** - AI image generation
- **Zod** - Runtime schema validation

### Frontend (React + TypeScript)
- **React 19** - Modern React with latest features
- **Vite** - Lightning-fast development and builds
- **TypeScript** - Full type safety throughout
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key
- Firebase CLI (installed automatically)

### Installation

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd ai-ppt-gen
   ./setup-local-dev.sh
   ```

2. **Add Your OpenAI API Key**
   ```bash
   # Edit functions/.env and add your key
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start Development**
   ```bash
   ./start-dev.sh
   ```

4. **Open Application**
   - Frontend: http://localhost:5173
   - Firebase Emulators: http://localhost:4000

## 📖 Usage Guide

### Step 1: Input & Configure
- Enter your slide description or topic
- Select target audience (executives, technical, etc.)
- Choose tone (professional, casual, persuasive, etc.)
- Set content length (brief, moderate, detailed)
- Configure design preferences and colors
- Optionally enable AI-generated images

### Step 2: Preview & Edit
- Review the AI-generated slide structure
- Edit title, content, and layout as needed
- Adjust bullet points and formatting
- Add speaker notes or source citations
- Preview the final design

### Step 3: Generate & Download
- Generate professional PowerPoint file
- Download .pptx file instantly
- Compatible with PowerPoint, Keynote, and Google Slides
- Includes professional formatting and brand colors

## API Endpoints

### `POST /draft`
Generate slide structure for preview/editing
```json
{
  "prompt": "Quarterly sales results...",
  "audience": "executives",
  "tone": "professional",
  "contentLength": "moderate",
  "design": {
    "theme": "light",
    "brand": {
      "primary": "#3b82f6",
      "secondary": "#64748b"
    }
  },
  "withImage": false
}
```

### `POST /generate`
Generate PowerPoint from slide specification
```json
{
  "title": "Q3 Sales Results",
  "layout": "title-bullets",
  "bullets": ["25% revenue growth", "Key achievements", "Future outlook"],
  "design": { "theme": "light", "brand": { "primary": "#3b82f6" } }
}
```

## Customization

### Brand Colors
- Primary: Main accent color for titles and highlights
- Secondary: Supporting color for text and elements
- Automatic contrast adjustment for readability

### Layout Types
- **Title**: Simple title-only slides
- **Title-Bullets**: Title with bullet points
- **Two-Column**: Side-by-side content
- **Image-Right**: Content with image placeholder
- **Quote**: Centered quote display
- **Chart**: Data visualization

## Testing

### Comprehensive Workflow Test
```bash
node test-workflow.js
```

### AI Prompt Testing
```bash
# Test all scenarios
node test-prompts.js

# Test specific scenario
node test-prompts.js executive-brief
node test-prompts.js technical-detailed
```

Tests cover:
- Draft generation with parameters
- PowerPoint file creation
- Multiple layout types
- API error handling
- Prompt quality assessment
- Response time monitoring

## AI Prompt Management

All AI prompts are centralized in `backend/src/prompts.ts` for easy modification without touching code files.

### Key Components:
- **SYSTEM_PROMPT**: Defines AI role and output format
- **AUDIENCE_GUIDANCE**: Content adaptation for different audiences
- **TONE_SPECIFICATIONS**: Style guidelines for different tones
- **CONTENT_LENGTH_SPECS**: Detail level specifications

### Improving Prompts:
1. Edit `backend/src/prompts.ts`
2. Test changes with `node test-prompts.js`
3. Server automatically reloads with hot-reload
4. See `backend/PROMPTS_GUIDE.md` for detailed guidance

## Production Deployment

### Build Backend
```bash
cd backend
npm run build
npm start
```

### Build Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenAI for GPT-4 API
- PptxGenJS for PowerPoint generation
- React team for the excellent framework
- All contributors and testers
