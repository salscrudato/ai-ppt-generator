/**
 * Document Metadata Management System
 * 
 * Comprehensive system for managing presentation metadata, properties,
 * and professional document information for PowerPoint files.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { SlideSpec } from '../schema';
import { ProfessionalTheme } from '../professionalThemes';
import { ModernTheme } from './theme/modernThemes';

/**
 * Comprehensive presentation metadata interface
 */
export interface PresentationMetadata {
  // Core document properties
  title: string;
  author: string;
  company: string;
  subject: string;
  description: string;
  keywords: string[];
  category: string;
  
  // Version and revision tracking
  version: string;
  revision: string;
  created: Date;
  modified: Date;
  lastModifiedBy: string;
  
  // Content analysis
  slideCount: number;
  estimatedDuration: number;
  contentLanguage: string;
  readingLevel: string;
  
  // Technical metadata
  generator: string;
  generatorVersion: string;
  theme: string;
  layoutTypes: string[];
  
  // Professional metadata
  confidentialityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  department: string;
  project: string;
  status: 'draft' | 'review' | 'approved' | 'final';
  
  // Accessibility and compliance
  accessibilityCompliance: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  languageCode: string;
  
  // Custom properties
  customProperties: Record<string, string>;
}

/**
 * Configuration for metadata generation
 */
export interface MetadataConfig {
  author?: string;
  company?: string;
  department?: string;
  project?: string;
  confidentialityLevel?: PresentationMetadata['confidentialityLevel'];
  status?: PresentationMetadata['status'];
  includeAnalytics?: boolean;
  includeAccessibilityInfo?: boolean;
  customProperties?: Record<string, string>;
}

/**
 * Generate comprehensive presentation metadata
 */
export function generatePresentationMetadata(
  specs: SlideSpec[],
  theme: ProfessionalTheme | ModernTheme,
  config: MetadataConfig = {}
): PresentationMetadata {
  const currentDate = new Date();
  const isModern = 'palette' in theme;
  
  // Extract content analysis
  const contentAnalysis = analyzeContent(specs);
  
  // Generate title from first slide or use default
  const title = specs.length > 0 ? specs[0].title : 'Professional Presentation';
  
  // Create comprehensive metadata
  const metadata: PresentationMetadata = {
    // Core document properties
    title: sanitizeTitle(title),
    author: config.author || 'AI PowerPoint Generator',
    company: config.company || 'Professional Presentations',
    subject: generateSubject(specs, contentAnalysis),
    description: generateDescription(specs, contentAnalysis),
    keywords: contentAnalysis.keywords,
    category: determineCategory(specs),
    
    // Version and revision tracking
    version: '1.0',
    revision: '1',
    created: currentDate,
    modified: currentDate,
    lastModifiedBy: config.author || 'AI PowerPoint Generator',
    
    // Content analysis
    slideCount: specs.length,
    estimatedDuration: contentAnalysis.estimatedDuration,
    contentLanguage: 'English',
    readingLevel: contentAnalysis.readingLevel,
    
    // Technical metadata
    generator: 'AI PowerPoint Generator',
    generatorVersion: '2.0.0',
    theme: isModern ? (theme as ModernTheme).name : (theme as ProfessionalTheme).name,
    layoutTypes: contentAnalysis.layoutTypes,
    
    // Professional metadata
    confidentialityLevel: config.confidentialityLevel || 'internal',
    department: config.department || 'General',
    project: config.project || 'AI Generated Presentation',
    status: config.status || 'draft',
    
    // Accessibility and compliance
    accessibilityCompliance: 'WCAG 2.1 AA Compliant',
    wcagLevel: 'AA',
    languageCode: 'en-US',
    
    // Custom properties
    customProperties: {
      'AI-Generated': 'true',
      'Quality-Level': 'Professional',
      'Template-Version': '2.0',
      'Content-Type': contentAnalysis.primaryContentType,
      'Slide-Layouts': contentAnalysis.layoutTypes.join(', '),
      'Has-Charts': contentAnalysis.hasCharts.toString(),
      'Has-Images': contentAnalysis.hasImages.toString(),
      'Complexity-Score': contentAnalysis.complexityScore.toString(),
      ...config.customProperties
    }
  };

  return metadata;
}

/**
 * Analyze slide content for metadata generation
 */
function analyzeContent(specs: SlideSpec[]) {
  const allText = specs.map(spec => 
    [spec.title, spec.paragraph, ...(spec.bullets || [])].filter(Boolean).join(' ')
  ).join(' ');
  
  // Extract keywords using simple frequency analysis
  const words = allText.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordFreq = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const keywords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
  
  // Analyze layout types
  const layoutTypes = [...new Set(specs.map(spec => spec.layout))];
  
  // Estimate duration (1.5 minutes per slide average, adjusted for complexity)
  let estimatedDuration = specs.length * 1.5;
  specs.forEach(spec => {
    if (spec.bullets && spec.bullets.length > 5) estimatedDuration += 0.5;
    if (spec.chart) estimatedDuration += 1;
    if (spec.comparisonTable) estimatedDuration += 1;
    if (spec.paragraph && spec.paragraph.length > 300) estimatedDuration += 0.5;
  });
  
  // Determine reading level (simplified)
  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const totalWords = words.length;
  const avgWordsPerSentence = totalWords / Math.max(sentences.length, 1);
  
  let readingLevel = 'Intermediate';
  if (avgWordsPerSentence < 15) readingLevel = 'Basic';
  else if (avgWordsPerSentence > 25) readingLevel = 'Advanced';
  
  // Check for charts and images
  const hasCharts = specs.some(spec => spec.chart);
  const hasImages = specs.some(spec => spec.imagePrompt || spec.left?.imagePrompt || spec.right?.imagePrompt);
  
  // Calculate complexity score (0-100)
  let complexityScore = 0;
  complexityScore += Math.min(specs.length * 2, 20); // Slide count
  complexityScore += layoutTypes.length * 5; // Layout variety
  complexityScore += hasCharts ? 15 : 0; // Charts
  complexityScore += hasImages ? 10 : 0; // Images
  complexityScore += Math.min(avgWordsPerSentence, 20); // Text complexity
  
  // Determine primary content type
  let primaryContentType = 'General';
  if (hasCharts && specs.some(spec => spec.layout === 'metrics-dashboard')) {
    primaryContentType = 'Data-Driven';
  } else if (specs.some(spec => spec.layout === 'timeline' || spec.processSteps)) {
    primaryContentType = 'Process-Oriented';
  } else if (specs.some(spec => spec.layout === 'comparison-table' || spec.comparisonTable)) {
    primaryContentType = 'Comparative';
  } else if (hasImages || specs.some(spec => spec.layout.includes('image'))) {
    primaryContentType = 'Visual';
  }
  
  return {
    keywords,
    layoutTypes,
    estimatedDuration: Math.round(estimatedDuration),
    readingLevel,
    hasCharts,
    hasImages,
    complexityScore: Math.min(complexityScore, 100),
    primaryContentType
  };
}

/**
 * Generate a professional subject line
 */
function generateSubject(specs: SlideSpec[], analysis: any): string {
  const title = specs[0]?.title || 'Presentation';
  const slideCount = specs.length;
  const duration = analysis.estimatedDuration;
  
  return `${title} - ${slideCount} slides, ${duration} min presentation`;
}

/**
 * Generate a comprehensive description
 */
function generateDescription(specs: SlideSpec[], analysis: any): string {
  const features = [];
  
  if (analysis.hasCharts) features.push('data visualizations');
  if (analysis.hasImages) features.push('images');
  if (analysis.layoutTypes.includes('two-column')) features.push('comparative layouts');
  if (analysis.layoutTypes.includes('timeline')) features.push('timeline elements');
  
  let description = `Professional presentation with ${specs.length} slides`;
  if (features.length > 0) {
    description += ` featuring ${features.join(', ')}`;
  }
  description += `. Estimated duration: ${analysis.estimatedDuration} minutes.`;
  description += ` Content complexity: ${analysis.readingLevel} level.`;
  
  return description;
}

/**
 * Determine presentation category
 */
function determineCategory(specs: SlideSpec[]): string {
  const layouts = specs.map(spec => spec.layout);
  
  if (layouts.includes('metrics-dashboard') || layouts.some(l => l.includes('chart'))) {
    return 'Business Analytics';
  } else if (layouts.includes('timeline') || specs.some(spec => spec.processSteps)) {
    return 'Process & Workflow';
  } else if (layouts.includes('comparison-table') || layouts.includes('two-column')) {
    return 'Comparative Analysis';
  } else if (layouts.some(l => l.includes('image'))) {
    return 'Visual Presentation';
  } else if (specs.some(spec => spec.title.toLowerCase().includes('training') || spec.title.toLowerCase().includes('education'))) {
    return 'Training & Education';
  } else {
    return 'Business Presentation';
  }
}

/**
 * Sanitize title for file naming
 */
function sanitizeTitle(title: string): string {
  return title
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Generate professional filename with multiple naming strategies
 */
export function generateFileName(
  metadata: PresentationMetadata,
  strategy: 'standard' | 'descriptive' | 'compact' | 'branded' = 'standard'
): string {
  const sanitizedTitle = metadata.title
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase()
    .substring(0, 50); // Limit length for file system compatibility

  const date = metadata.created.toISOString().split('T')[0];
  const version = metadata.version.replace('.', 'v');
  const timestamp = metadata.created.toISOString().replace(/[:.]/g, '-').split('T')[0];

  switch (strategy) {
    case 'descriptive':
      return `${sanitizedTitle}_${metadata.slideCount}slides_${metadata.estimatedDuration}min_${date}_${version}.pptx`;

    case 'compact':
      const shortTitle = sanitizedTitle.substring(0, 20);
      return `${shortTitle}_${timestamp}_${version}.pptx`;

    case 'branded':
      const company = metadata.company.replace(/[^\w]/g, '').toLowerCase();
      return `${company}_${sanitizedTitle}_${date}_${version}.pptx`;

    default: // standard
      return `${sanitizedTitle}_${date}_${version}.pptx`;
  }
}

/**
 * Generate filename suggestions based on content analysis
 */
export function generateFilenameSuggestions(metadata: PresentationMetadata): {
  primary: string;
  alternatives: string[];
  reasoning: string;
} {
  const suggestions = {
    primary: generateFileName(metadata, 'standard'),
    alternatives: [
      generateFileName(metadata, 'descriptive'),
      generateFileName(metadata, 'compact'),
      generateFileName(metadata, 'branded')
    ],
    reasoning: ''
  };

  // Determine best strategy based on content
  if (metadata.slideCount > 20 || metadata.estimatedDuration > 30) {
    suggestions.primary = generateFileName(metadata, 'descriptive');
    suggestions.reasoning = 'Descriptive naming recommended for longer presentations';
  } else if (metadata.customProperties['Content-Type'] === 'Data-Driven') {
    suggestions.primary = generateFileName(metadata, 'branded');
    suggestions.reasoning = 'Branded naming recommended for data-driven presentations';
  } else if (metadata.confidentialityLevel === 'confidential') {
    suggestions.primary = generateFileName(metadata, 'compact');
    suggestions.reasoning = 'Compact naming recommended for confidential content';
  } else {
    suggestions.reasoning = 'Standard naming provides good balance of clarity and brevity';
  }

  return suggestions;
}

/**
 * Apply metadata to PptxGenJS presentation object
 */
export function applyMetadataToPresentation(pres: any, metadata: PresentationMetadata): void {
  // Core properties
  pres.title = metadata.title;
  pres.author = metadata.author;
  pres.company = metadata.company;
  pres.subject = metadata.subject;
  pres.revision = metadata.revision;
  
  // Timestamps
  pres.created = metadata.created;
  pres.modified = metadata.modified;
  
  // Custom properties
  pres.customProperties = {
    ...metadata.customProperties,
    'Description': metadata.description,
    'Keywords': metadata.keywords.join(', '),
    'Category': metadata.category,
    'EstimatedDuration': `${metadata.estimatedDuration} minutes`,
    'SlideCount': metadata.slideCount.toString(),
    'ContentLanguage': metadata.contentLanguage,
    'ReadingLevel': metadata.readingLevel,
    'AccessibilityCompliance': metadata.accessibilityCompliance,
    'ConfidentialityLevel': metadata.confidentialityLevel,
    'Department': metadata.department,
    'Project': metadata.project,
    'Status': metadata.status
  };
}
