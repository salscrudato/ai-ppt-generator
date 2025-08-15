/**
 * Speaker Notes Generation System
 * 
 * Comprehensive system for generating professional speaker notes that provide
 * context, talking points, and presentation guidance for each slide.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { SlideSpec } from '../schema';
import { ProfessionalTheme } from '../professionalThemes';
import { ModernTheme } from './theme/modernThemes';

/**
 * Speaker notes configuration options
 */
export interface SpeakerNotesConfig {
  includeTransitions?: boolean;
  includeTimingGuidance?: boolean;
  includeEngagementTips?: boolean;
  includeAccessibilityNotes?: boolean;
  verbosityLevel?: 'concise' | 'detailed' | 'comprehensive';
  presentationContext?: string;
  audienceLevel?: 'executive' | 'technical' | 'general' | 'academic';
}

/**
 * Generate comprehensive speaker notes for a slide
 */
export function generateSpeakerNotes(
  spec: SlideSpec,
  slideIndex: number,
  totalSlides: number,
  config: SpeakerNotesConfig = {}
): string {
  const {
    includeTransitions = true,
    includeTimingGuidance = true,
    includeEngagementTips = false,
    includeAccessibilityNotes = true,
    verbosityLevel = 'detailed',
    presentationContext = '',
    audienceLevel = 'general'
  } = config;

  let notes: string[] = [];

  // Add slide context and overview
  notes.push(generateSlideOverview(spec, slideIndex, totalSlides));

  // Add main talking points
  notes.push(generateTalkingPoints(spec, verbosityLevel));

  // Add transition guidance
  if (includeTransitions && slideIndex < totalSlides - 1) {
    notes.push(generateTransitionGuidance(spec, slideIndex, totalSlides));
  }

  // Add timing guidance
  if (includeTimingGuidance) {
    notes.push(generateTimingGuidance(spec, slideIndex, totalSlides));
  }

  // Add engagement tips
  if (includeEngagementTips) {
    notes.push(generateEngagementTips(spec, audienceLevel));
  }

  // Add accessibility notes
  if (includeAccessibilityNotes) {
    const accessibilityNotes = generateAccessibilityNotes(spec);
    if (accessibilityNotes) {
      notes.push(accessibilityNotes);
    }
  }

  // Add sources if present
  if (spec.sources?.length) {
    notes.push(`\n📚 SOURCES:\n${spec.sources.map(source => `• ${source}`).join('\n')}`);
  }

  return notes.filter(note => note.trim()).join('\n\n');
}

/**
 * Generate slide overview and context
 */
function generateSlideOverview(spec: SlideSpec, slideIndex: number, totalSlides: number): string {
  const slideNumber = slideIndex + 1;
  const progressPercent = Math.round((slideNumber / totalSlides) * 100);
  
  let overview = `🎯 SLIDE ${slideNumber} OF ${totalSlides} (${progressPercent}% complete)\n`;
  overview += `📋 Layout: ${spec.layout.toUpperCase()}\n`;
  overview += `🎨 Focus: ${spec.title}`;

  // Add layout-specific context
  switch (spec.layout) {
    case 'title':
    case 'hero':
      overview += '\n💡 This is your opening slide - set the tone and capture attention.';
      break;
    case 'section-divider':
      overview += '\n💡 This is a section break - pause and prepare for the next topic.';
      break;
    case 'thank-you':
    case 'contact-info':
      overview += '\n💡 This is your closing slide - summarize key takeaways and next steps.';
      break;
    default:
      overview += '\n💡 This is a content slide - deliver key information clearly and confidently.';
  }

  return overview;
}

/**
 * Generate main talking points based on slide content
 */
function generateTalkingPoints(spec: SlideSpec, verbosityLevel: 'concise' | 'detailed' | 'comprehensive'): string {
  let talkingPoints = '🗣️ TALKING POINTS:\n';

  // Title-based talking point
  talkingPoints += `• Start with: "${spec.title}"\n`;

  // Content-based talking points
  if (spec.paragraph) {
    const sentences = spec.paragraph.split(/[.!?]+/).filter(s => s.trim());
    if (verbosityLevel === 'concise') {
      talkingPoints += `• Key message: ${sentences[0]?.trim() || spec.paragraph.substring(0, 100)}...\n`;
    } else {
      talkingPoints += `• Elaborate on: ${spec.paragraph}\n`;
    }
  }

  if (spec.bullets) {
    talkingPoints += '• Cover each bullet point:\n';
    spec.bullets.forEach((bullet, index) => {
      if (verbosityLevel === 'comprehensive') {
        talkingPoints += `  ${index + 1}. ${bullet} - Expand with examples and context\n`;
      } else {
        talkingPoints += `  ${index + 1}. ${bullet}\n`;
      }
    });
  }

  // Two-column content
  if (spec.left || spec.right) {
    talkingPoints += '• Address both sides of the comparison:\n';
    if (spec.left?.bullets) {
      talkingPoints += `  Left: ${spec.left.bullets.join(', ')}\n`;
    }
    if (spec.right?.bullets) {
      talkingPoints += `  Right: ${spec.right.bullets.join(', ')}\n`;
    }
  }

  // Chart or data content
  if (spec.chart) {
    talkingPoints += `• Explain the ${spec.chart.type} chart showing ${spec.chart.title || 'data trends'}\n`;
    talkingPoints += '• Highlight key insights and what the data means for the audience\n';
  }

  return talkingPoints;
}

/**
 * Generate transition guidance to next slide
 */
function generateTransitionGuidance(spec: SlideSpec, slideIndex: number, totalSlides: number): string {
  const transitions = [
    'Now let\'s move on to...',
    'This brings us to our next point...',
    'Building on this, we\'ll now explore...',
    'Let\'s dive deeper into...',
    'Next, I want to share...',
    'This leads us to consider...'
  ];

  const randomTransition = transitions[slideIndex % transitions.length];
  
  return `🔄 TRANSITION:\n• Use: "${randomTransition}"\n• Pause briefly before advancing to maintain audience engagement`;
}

/**
 * Generate timing guidance for the slide
 */
function generateTimingGuidance(spec: SlideSpec, slideIndex: number, totalSlides: number): string {
  let estimatedTime = 60; // Base 1 minute per slide

  // Adjust based on content complexity
  if (spec.bullets && spec.bullets.length > 5) estimatedTime += 30;
  if (spec.paragraph && spec.paragraph.length > 200) estimatedTime += 30;
  if (spec.chart) estimatedTime += 45;
  if (spec.comparisonTable) estimatedTime += 60;
  if (spec.layout === 'title') estimatedTime = 30;
  if (spec.layout === 'section-divider') estimatedTime = 15;

  const minutes = Math.floor(estimatedTime / 60);
  const seconds = estimatedTime % 60;
  const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return `⏱️ TIMING:\n• Estimated time: ${timeString}\n• Pace yourself - don't rush through key points`;
}

/**
 * Generate audience engagement tips
 */
function generateEngagementTips(spec: SlideSpec, audienceLevel: string): string {
  let tips = '👥 ENGAGEMENT TIPS:\n';

  // Layout-specific tips
  switch (spec.layout) {
    case 'title':
      tips += '• Make eye contact and smile - first impressions matter\n';
      tips += '• Ask a rhetorical question to get audience thinking\n';
      break;
    case 'two-column':
    case 'comparison-table':
      tips += '• Ask audience which side they prefer or relate to\n';
      tips += '• Use hand gestures to indicate left vs right\n';
      break;
    case 'chart':
      tips += '• Ask audience what trends they notice first\n';
      tips += '• Point to specific data points while speaking\n';
      break;
    default:
      tips += '• Pause after each bullet point for emphasis\n';
      tips += '• Ask "Does this resonate with your experience?"\n';
  }

  // Audience-specific tips
  switch (audienceLevel) {
    case 'executive':
      tips += '• Focus on business impact and ROI\n';
      tips += '• Be prepared for strategic questions\n';
      break;
    case 'technical':
      tips += '• Be ready to dive into technical details\n';
      tips += '• Encourage questions about implementation\n';
      break;
    case 'academic':
      tips += '• Reference methodology and sources\n';
      tips += '• Encourage scholarly discussion\n';
      break;
  }

  return tips;
}

/**
 * Generate accessibility notes for inclusive presentations
 */
function generateAccessibilityNotes(spec: SlideSpec): string | null {
  const accessibilityNotes: string[] = [];

  // Image descriptions
  if (spec.imagePrompt || spec.left?.imagePrompt || spec.right?.imagePrompt) {
    accessibilityNotes.push('• Describe images aloud for visually impaired audience members');
  }

  // Chart descriptions
  if (spec.chart) {
    accessibilityNotes.push('• Verbally describe chart data and trends - don\'t just say "as you can see"');
  }

  // Color references
  if (spec.bullets?.some(bullet => bullet.toLowerCase().includes('red') || bullet.toLowerCase().includes('green'))) {
    accessibilityNotes.push('• Avoid relying solely on color references - use descriptive terms');
  }

  // Complex layouts
  if (spec.layout === 'two-column' || spec.comparisonTable) {
    accessibilityNotes.push('• Clearly indicate which section you\'re discussing (left/right, top/bottom)');
  }

  if (accessibilityNotes.length === 0) return null;

  return `♿ ACCESSIBILITY:\n${accessibilityNotes.join('\n')}`;
}

/**
 * Generate context-aware speaker notes based on presentation flow
 */
export function generateContextualNotes(
  specs: SlideSpec[],
  currentIndex: number,
  config: SpeakerNotesConfig = {}
): string {
  const currentSlide = specs[currentIndex];
  const previousSlide = currentIndex > 0 ? specs[currentIndex - 1] : null;
  const nextSlide = currentIndex < specs.length - 1 ? specs[currentIndex + 1] : null;

  let contextualNotes = generateSpeakerNotes(currentSlide, currentIndex, specs.length, config);

  // Add flow context
  if (previousSlide && currentIndex > 0) {
    contextualNotes += `\n\n🔗 CONNECTION TO PREVIOUS SLIDE:\n• Build on the concept of "${previousSlide.title}"`;
  }

  if (nextSlide && currentIndex < specs.length - 1) {
    contextualNotes += `\n\n➡️ PREVIEW OF NEXT SLIDE:\n• This will lead into "${nextSlide.title}"`;
  }

  return contextualNotes;
}

/**
 * Generate presentation-wide speaker notes summary
 */
export function generatePresentationSummary(specs: SlideSpec[]): string {
  const totalSlides = specs.length;
  const estimatedDuration = Math.round(totalSlides * 1.5); // 1.5 minutes per slide average
  
  const layoutCounts = specs.reduce((acc, spec) => {
    acc[spec.layout] = (acc[spec.layout] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let summary = `📊 PRESENTATION OVERVIEW:\n`;
  summary += `• Total slides: ${totalSlides}\n`;
  summary += `• Estimated duration: ${estimatedDuration} minutes\n`;
  summary += `• Slide types: ${Object.entries(layoutCounts).map(([type, count]) => `${type} (${count})`).join(', ')}\n\n`;
  
  summary += `🎯 KEY OBJECTIVES:\n`;
  summary += `• Opening: ${specs[0]?.title || 'Set the stage'}\n`;
  if (totalSlides > 2) {
    summary += `• Middle: ${specs[Math.floor(totalSlides/2)]?.title || 'Deliver core content'}\n`;
  }
  summary += `• Closing: ${specs[totalSlides-1]?.title || 'Wrap up and next steps'}\n\n`;
  
  summary += `💡 PRESENTATION TIPS:\n`;
  summary += `• Practice transitions between slides\n`;
  summary += `• Prepare for Q&A after each major section\n`;
  summary += `• Have backup slides ready for detailed questions\n`;
  summary += `• Test all technology before presenting`;

  return summary;
}
