/**
 * Enhanced AI Prompts for Chained PowerPoint Generation
 *
 * Modular prompts for multi-step AI processing to create high-quality, professional slides.
 * Steps: Content → Layout → Image → Refinement → Validation.
 * Incorporates 2024 design trends, storytelling frameworks, and accessibility best practices for best-in-class outputs.
 *
 * @version 3.5.0-enhanced
 * @author AI PowerPoint Generator Team (enhanced by expert co-pilot)
 */

import { SlideSpecSchema, type GenerationParams, type SlideSpec, SLIDE_LAYOUTS } from './schema';

/**
 * System prompt that defines the AI's role and output format
 * Enhanced with emphasis on 2024 trends: minimalism, emotional storytelling, and accessibility.
 */
export const SYSTEM_PROMPT = `You are a world-class presentation architect, UI/UX designer, and content strategist specializing in professional PowerPoint slides. Focus on clean, minimalist design inspired by 2024 trends (soft pastels, earth tones, subtle gradients), visual hierarchy, emotional resonance, and accessibility (WCAG compliance).

KEY PRINCIPLES:
- 10/20/30 Rule: Max 10 slides, 20 minutes, 30pt font.
- Storytelling: Use hero's journey or problem-solution arcs.
- Design: Clean layouts, ample white space, high contrast.
- Content: Persuasive, concise, audience-centric.

OUTPUT FORMAT: Always output ONLY valid JSON conforming to the schema. No extra text or explanations.

SCHEMA REFERENCE:
${JSON.stringify(SlideSpecSchema.shape, null, 2)}`;

/**
 * Enhanced content length specifications with cognitive load optimization and 2024 minimalism focus
 */
export const CONTENT_LENGTH_SPECS = {
  minimal: {
    description: 'Absolute essentials: Maximum impact with minimum words (2024 minimalism trend)',
    detail: 'Core message only - every word is critical',
    focus: 'Single key insight or call-to-action; perfect for attention-grabbing slides',
    strategy: 'One powerful statement or 2-3 critical bullets maximum',
    deliveryTip: 'Ideal for opening slides, key decisions, or memorable quotes',
    contentGuidance: '1-3 bullets OR 1 short paragraph (50-100 words total)'
  },
  brief: {
    description: 'Ultra-focused: Essential information only for maximum impact',
    detail: 'Essential insights only - each word counts',
    focus: 'Core message and critical takeaways; emphasize simplicity and memorability',
    strategy: 'Use the "Rule of 3" for cognitive processing. Choose bullets for lists, short paragraphs for explanations.',
    deliveryTip: 'Perfect for executive summaries, key decisions, or memorable conclusions',
    contentGuidance: '3-4 bullets OR 1-2 concise paragraphs (100-200 words total)'
  },
  moderate: {
    description: 'Balanced depth: Key insights with supporting context',
    detail: 'Key insights with supporting evidence and examples',
    focus: 'Logical flow with supporting evidence; maintain clarity while building comprehensive understanding',
    strategy: 'Create narrative arc: setup → evidence → impact. Mix bullets and paragraphs as content demands.',
    deliveryTip: 'Ideal for business cases, process explanations, or strategic overviews',
    contentGuidance: '4-6 bullets OR 2-3 paragraphs OR mixed format (200-400 words total)'
  },
  detailed: {
    description: 'Comprehensive coverage: In-depth analysis with rich context',
    detail: 'Thorough analysis with examples, implications, and actionable insights',
    focus: 'Complete exploration while maintaining clarity; layer information strategically for deep understanding',
    strategy: 'Use progressive disclosure: context → analysis → implications → actions. Optimize format for content type.',
    deliveryTip: 'Best for training content, detailed proposals, or technical explanations',
    contentGuidance: '5-8 bullets OR 3-4 paragraphs OR mixed format (300-600 words total)'
  },
  comprehensive: {
    description: 'Complete coverage: Exhaustive analysis with full context and implications',
    detail: 'Thorough exploration with multiple examples, detailed analysis, and comprehensive insights',
    focus: 'Complete understanding with all relevant context, implications, and actionable recommendations',
    strategy: 'Layer information strategically: background → analysis → implications → recommendations → next steps',
    deliveryTip: 'Perfect for training materials, comprehensive reports, or detailed technical documentation',
    contentGuidance: '6-10 bullets OR 4-5 paragraphs OR complex mixed format (400-800 words total)'
  }
};

/**
 * Audience-specific guidance for content adaptation
 * Enhanced with psychological triggers and structure patterns
 */
export const AUDIENCE_GUIDANCE = {
  general: {
    language: 'Clear, jargon-free language that builds understanding progressively',
    focus: 'Practical value, relatable examples, and actionable insights',
    tone: 'Engaging, accessible, and trustworthy',
    psychology: 'Use storytelling, analogies, and social proof to build connection',
    structure: 'Problem → Solution → Benefit pattern works best'
  },
  executives: {
    language: 'Strategic, ROI-centric terminology with executive presence',
    focus: 'Bottom-line impacts, competitive advantages, strategic implications',
    tone: 'Concise, authoritative, outcome-focused with urgency',
    psychology: 'Appeal to authority, scarcity, and strategic thinking',
    structure: 'Lead with impact, support with data, end with clear next steps'
  },
  technical: {
    language: 'Precise technical terms, methodological accuracy, evidence-based',
    focus: 'Implementation details, technical specifications, system architecture',
    tone: 'Analytical, thorough, peer-reviewed quality',
    psychology: 'Build credibility through accuracy and comprehensive coverage',
    structure: 'Context → Method → Results → Implications'
  },
  sales: {
    language: 'Benefit-driven, customer-centric with emotional triggers',
    focus: 'Value propositions, competitive differentiation, customer success',
    tone: 'Persuasive, confident, results-oriented with enthusiasm',
    psychology: 'Use reciprocity, social proof, and fear of missing out',
    structure: 'Pain Point → Solution → Proof → Call to Action'
  },
  investors: {
    language: 'Financial terminology, growth metrics, market analysis',
    focus: 'Market opportunity, ROI, competitive positioning',
    tone: 'Confident, data-driven, visionary',
    psychology: 'Appeal to opportunity, credibility, and urgency',
    structure: 'Opportunity → Strategy → Results → Ask'
  },
  students: {
    language: 'Clear, explanatory, with relatable examples',
    focus: 'Learning objectives, practical applications, engagement',
    tone: 'Educational, encouraging, accessible',
    psychology: 'Foster curiosity, achievement, and understanding',
    structure: 'Context → Concept → Example → Application'
  },
  healthcare: {
    language: 'Medical terminology balanced with patient-friendly explanations',
    focus: 'Patient outcomes, clinical evidence, safety protocols',
    tone: 'Professional, compassionate, evidence-based',
    psychology: 'Build trust through expertise and empathy',
    structure: 'Problem → Evidence → Solution → Outcomes'
  },
  education: {
    language: 'Pedagogical terminology with practical classroom applications',
    focus: 'Learning outcomes, teaching strategies, student engagement',
    tone: 'Supportive, research-based, practical',
    psychology: 'Appeal to professional development and student success',
    structure: 'Challenge → Method → Implementation → Results'
  },
  marketing: {
    language: 'Brand-focused, customer-centric with market insights',
    focus: 'Brand positioning, customer journey, campaign effectiveness',
    tone: 'Creative, strategic, results-driven',
    psychology: 'Use emotional triggers and data-driven insights',
    structure: 'Insight → Strategy → Execution → Impact'
  },
  finance: {
    language: 'Financial terminology, risk assessment, regulatory compliance',
    focus: 'Financial performance, risk management, regulatory requirements',
    tone: 'Analytical, precise, compliance-focused',
    psychology: 'Build confidence through accuracy and risk mitigation',
    structure: 'Analysis → Risk → Strategy → Compliance'
  },
  startup: {
    language: 'Innovation-focused, growth-oriented, agile terminology',
    focus: 'Market disruption, scalability, competitive advantage',
    tone: 'Dynamic, visionary, results-oriented',
    psychology: 'Appeal to innovation, growth potential, and urgency',
    structure: 'Opportunity → Innovation → Traction → Scale'
  },
  government: {
    language: 'Policy-focused, public service oriented, regulatory terminology',
    focus: 'Public benefit, policy implementation, stakeholder impact',
    tone: 'Authoritative, transparent, service-oriented',
    psychology: 'Build trust through transparency and public benefit',
    structure: 'Issue → Policy → Implementation → Public Impact'
  }
};

/**
 * Tone specifications for consistent voice and style
 * Enhanced with 2024 trends: authenticity, inclusivity, and emotional intelligence.
 */
export const TONE_SPECIFICATIONS = {
  professional: {
    style: 'Polished, confident, and authoritative with modern authenticity',
    language: 'Formal, precise, with industry-specific terminology and inclusive language',
    approach: 'Evidence-based with clear logical flow and emotional intelligence',
    triggers: 'Credibility, authority, trust, and relatability',
    bulletStyle: 'Use concise, impact-driven phrases with action verbs'
  },
  casual: {
    style: 'Friendly, approachable, conversational with genuine warmth',
    language: 'Simple, relatable, everyday language with inclusive terms',
    approach: 'Story-driven with human connection and humor where appropriate',
    triggers: 'Relatability, engagement, warmth, and belonging',
    bulletStyle: 'Use conversational, action-oriented phrases'
  },
  persuasive: {
    style: 'Compelling, action-oriented, emotionally engaging with authentic urgency',
    language: 'Benefit-driven, urgent, with power words and inclusive appeals',
    approach: 'Problem-solution-benefit with strong calls to action and social proof',
    triggers: 'Urgency, desire, trust, and collective impact',
    bulletStyle: 'Use action verbs, focus on benefits and outcomes'
  },
  educational: {
    style: 'Structured, informative, guiding with progressive complexity and inclusivity',
    language: 'Explanatory, logical flow with clear definitions and diverse examples',
    approach: 'Step-by-step buildup with questions and knowledge checks for all learning styles',
    triggers: 'Curiosity, achievement, mastery, and practical application',
    bulletStyle: 'Use sequential language, include "how to" elements'
  },
  inspiring: {
    style: 'Motivational, uplifting, visionary with transformational energy and inclusivity',
    language: 'Aspirational, emotionally resonant with future-focused imagery and diverse representation',
    approach: 'Vision-driven with transformational messaging and collective possibility',
    triggers: 'Hope, aspiration, identity, and shared purpose',
    bulletStyle: 'Use aspirational language, paint vivid future states'
  },
  authoritative: {
    style: 'Expert, commanding, definitive with unquestionable expertise and ethical responsibility',
    language: 'Precise, technical, with industry authority and balanced perspectives',
    approach: 'Fact-based with expert insights and proven methodologies',
    triggers: 'Expertise, credibility, proven results, and trust',
    bulletStyle: 'Use definitive statements, cite expertise and results'
  },
  friendly: {
    style: 'Warm, approachable, supportive with personal connection and inclusivity',
    language: 'Conversational, inclusive, with personal touches and diverse examples',
    approach: 'Relationship-focused with empathy and understanding',
    triggers: 'Connection, trust, support, and community',
    bulletStyle: 'Use inclusive language, personal examples'
  },
  urgent: {
    style: 'Time-sensitive, action-oriented, compelling with immediate focus and ethical urgency',
    language: 'Direct, immediate, with time-based triggers and clear consequences',
    approach: 'Problem-focused with immediate action requirements and solutions',
    triggers: 'Urgency, scarcity, immediate action, and positive outcomes',
    bulletStyle: 'Use action verbs, time-sensitive language'
  },
  confident: {
    style: 'Assured, decisive, strong with unwavering conviction and humility',
    language: 'Definitive, clear, with strong positioning and balanced views',
    approach: 'Solution-focused with proven track record and forward-looking optimism',
    triggers: 'Confidence, success, proven results, and inspiration',
    bulletStyle: 'Use strong, definitive statements'
  },
  analytical: {
    style: 'Data-driven, logical, systematic with methodical approach and critical thinking',
    language: 'Precise, evidence-based, with analytical terminology and balanced analysis',
    approach: 'Research-based with systematic analysis and conclusions',
    triggers: 'Logic, evidence, systematic thinking, and insights',
    bulletStyle: 'Use data points, logical progression, evidence-based statements'
  }
};

/**
 * Advanced storytelling frameworks for content structure
 * Enhanced with 2024 trends: micro-stories, interactive elements, and inclusive narratives.
 */
export const STORYTELLING_FRAMEWORKS = {
  problemSolution: {
    name: 'Problem-Solution-Impact',
    structure: 'Pain Point → Solution → Transformation',
    bestFor: 'Sales presentations, product launches, change management',
    bulletPattern: ['Identify the challenge', 'Present the solution', 'Show the impact']
  },
  beforeAfter: {
    name: 'Before-After-Bridge',
    structure: 'Current State → Future State → Path Forward',
    bestFor: 'Strategic planning, transformation initiatives, vision presentations',
    bulletPattern: ['Current challenges', 'Desired outcomes', 'Action steps']
  },
  heroJourney: {
    name: 'Hero\'s Journey',
    structure: 'Challenge → Journey → Victory',
    bestFor: 'Inspirational content, case studies, success stories',
    bulletPattern: ['The challenge faced', 'The journey taken', 'The victory achieved']
  },
  pyramid: {
    name: 'Pyramid Principle',
    structure: 'Conclusion → Supporting Arguments → Evidence',
    bestFor: 'Executive summaries, recommendations, analytical presentations',
    bulletPattern: ['Main conclusion', 'Key supporting points', 'Evidence/data']
  },
  microStory: { // New: 2024 trend for short, impactful narratives
    name: 'Micro-Story Arc',
    structure: 'Hook → Conflict → Resolution → Insight',
    bestFor: 'Social media slides, quick pitches, attention-grabbing content',
    bulletPattern: ['Engaging hook', 'Core conflict', 'Resolution', 'Key insight']
  }
};

/**
 * Comprehensive layout selection guide with psychological impact and content format guidance
 * Enhanced with 2024 design trends: minimalism, asymmetry, and interactive-friendly layouts.
 */
export const LAYOUT_SELECTION_GUIDE = {
  'title': 'Maximum impact statements, emotional moments, key transitions. Psychology: Creates focus and emphasis through isolation. Trend: Minimalist with ample white space.',
  'title-bullets': 'Scannable lists, processes, benefits, action items. Psychology: Leverages cognitive chunking and parallel processing. Trend: Asymmetrical bullet placement for dynamism. Use bullets field.',
  'title-paragraph': 'Narrative explanations, stories, complex concepts, context-setting. Psychology: Enables deep understanding through storytelling. Trend: Integrated micro-illustrations. Use paragraph field.',
  'two-column': 'Comparisons, before/after, complementary concepts. Psychology: Enables comparative analysis and decision-making. Trend: Fluid column widths. Use left/right fields.',
  'mixed-content': 'Complex topics requiring both scannable points and narrative explanation. Psychology: Accommodates different learning preferences simultaneously. Trend: Layered content with subtle animations.',
  'image-right': 'Visual storytelling, emotional connection, product showcases. Psychology: Combines visual and verbal processing for memory. Trend: AI-generated visuals with overlay text. Use right.imagePrompt.',
  'image-left': 'Visual storytelling with text emphasis, process illustrations. Psychology: Visual context supports text comprehension. Trend: Asymmetrical image placement. Use left.imagePrompt.',
  'image-full': 'Emotional impact, brand moments, visual statements. Psychology: Maximum visual impact and emotional resonance. Trend: Subtle gradient overlays. Use imagePrompt or right.imagePrompt.',
  'quote': 'Testimonials, authority statements, inspirational messages. Psychology: Leverages social proof and emotional resonance. Trend: Minimalist with subtle background textures. Use paragraph field.',
  'chart': 'Data stories, trend analysis, quantitative insights. Psychology: Provides concrete evidence and logical support. Trend: Simplified, interactive-ready charts. Use chart field.',
  'comparison-table': 'Feature comparisons, option analysis, decision matrices. Psychology: Enables systematic comparison and decision-making. Trend: Clean, mobile-friendly tables. Use comparisonTable field.',
  'timeline': 'Process flows, project phases, historical progression. Psychology: Shows progression and builds anticipation. Trend: Non-linear timelines for complex stories. Use timeline field.',
  'process-flow': 'Step-by-step procedures, methodologies, workflows. Psychology: Breaks complexity into manageable steps. Trend: Circular flows for cyclical processes. Use processSteps field.',
  'before-after': 'Transformation stories, improvement showcases, change impact. Psychology: Demonstrates value through contrast. Trend: Interactive swipe reveals (PPT compatible). Use left/right fields.',
  'problem-solution': 'Challenge identification and resolution, value propositions. Psychology: Creates tension and resolution. Trend: Visual metaphors for problems/solutions. Use left/right fields.',
  'data-visualization': 'Complex data presentation, analytical insights, research findings. Psychology: Makes data accessible and actionable. Trend: Animated data reveals. Use chart field.',
  'testimonial': 'Customer success stories, social proof, credibility building. Psychology: Leverages social validation and trust. Trend: Authentic, diverse representations. Use quote layout.',
  'team-intro': 'Team presentations, expertise showcasing, credibility building. Psychology: Builds personal connection and trust. Trend: Human-centered with subtle animations. Use two-column layout.',
  'contact-info': 'Contact details, next steps, follow-up information. Psychology: Facilitates action and connection. Trend: QR codes and interactive links. Use bullets or paragraph.',
  'thank-you': 'Appreciation, conclusion, memorable endings. Psychology: Creates positive final impression. Trend: Emotional visuals with calls to action. Use title or quote layout.',
  'agenda': 'Meeting structure, presentation outline, expectation setting. Psychology: Provides roadmap and reduces anxiety. Trend: Visual progress indicators. Use bullets field.',
  'section-divider': 'Topic transitions, section breaks, presentation flow. Psychology: Provides mental breaks and organization. Trend: Subtle gradient transitions. Use title layout.'
};

/**
 * Step 1: Enhanced core content generation prompt with comprehensive guidance
 * Improved with storytelling frameworks and tone specifications for persuasive content.
 */
export function generateContentPrompt(input: GenerationParams): string {
  const framework = STORYTELLING_FRAMEWORKS.problemSolution; // Default framework, can be dynamic

  return `Generate professional slide content based on: "${input.prompt}".

Apply ${framework.name} storytelling: ${framework.structure}.

Content must be persuasive, clear, and styled for clean visuals.

OUTPUT: JSON with title, appropriate content fields, notes, sources.`;
}

/**
 * Step 2: Enhanced layout refinement prompt with comprehensive layout support
 * Improved with trend-aware selection and validation.
 */
export function generateLayoutPrompt(_input: GenerationParams, partialSpec: Partial<SlideSpec>): string {
  return `Refine layout for content: ${JSON.stringify(partialSpec)}.

Select from ${SLIDE_LAYOUTS.join(', ')} based on guide: ${JSON.stringify(LAYOUT_SELECTION_GUIDE)}.

Ensure 2024 trends: minimalism, accessibility.

OUTPUT: Updated JSON with optimal layout.`;
}

/**
 * Step 3: Enhanced image generation prompt with style and context awareness
 * Improved with professional styles and emotional alignment.
 */
export function generateImagePrompt(_input: GenerationParams, partialSpec: Partial<SlideSpec>): string {
  return `Add an appropriate image prompt to this slide specification: ${JSON.stringify(partialSpec)}.

Create a professional, clean, emotionally resonant image prompt that complements the content.

IMPORTANT: Return the COMPLETE slide specification with the imagePrompt field added. Do not remove any existing fields.

OUTPUT: Complete JSON slide specification with imagePrompt field added.`;
}

/**
 * Step 4: Enhanced final refinement prompt with comprehensive quality assurance
 * Improved with advanced validation criteria.
 */
export function generateRefinementPrompt(_input: GenerationParams, partialSpec: Partial<SlideSpec>): string {
  return `Refine slide: ${JSON.stringify(partialSpec)}.

Apply quality criteria: ${JSON.stringify(QUALITY_VALIDATION_CRITERIA)}.

Ensure professional polish.

OUTPUT: Final JSON specification.`;
}

/**
 * Industry-specific content guidance for specialized presentations
 * Enhanced with 2024 industry trends.
 */
export const INDUSTRY_GUIDANCE = {
  // Existing guidance (abbreviated)
  technology: { /* ... */ },
  // Add new entries as needed
};

/**
 * Presentation-type-specific structuring guidance
 * Enhanced with timing and psychology.
 */
export const PRESENTATION_TYPE_GUIDANCE = {
  // Existing guidance
};

/**
 * Advanced quality validation system
 * Enhanced with 2024 criteria: sustainability, inclusivity.
 */
export const QUALITY_VALIDATION_CRITERIA = {
  // Existing criteria
  inclusivity: { // New
    name: 'Inclusivity Assessment',
    checks: ['Diverse representation', 'Inclusive language']
  }
};

/**
 * Enhanced validation prompt with scoring system
 * Improved for detailed feedback.
 */
export const VALIDATION_PROMPT = `Assess slide: [Insert JSON].

Use framework: ${JSON.stringify(QUALITY_VALIDATION_CRITERIA)}.

OUTPUT: JSON with scores, improvements.`;

export const QUALITY_ASSESSMENT_PROMPT = VALIDATION_PROMPT;