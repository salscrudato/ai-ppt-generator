/**
 * Enhanced AI Prompts for Chained PowerPoint Generation
 * 
 * Modular prompts for multi-step AI processing to create high-quality slides.
 * Steps: Content → Layout → Image → Refinement.
 * Modify these to fine-tune without code changes.
 *
 * @version 3.2.0-enhanced
 * @author AI PowerPoint Generator Team (enhanced by expert co-pilot)
 */

import { SlideSpecSchema, type GenerationParams, type SlideSpec, SLIDE_LAYOUTS } from './schema';

export interface PromptInput extends GenerationParams {} // Alias for consistency

/**
 * System prompt that defines the AI's role and output format
 */
export const SYSTEM_PROMPT = `You are a world-class presentation architect, UI/UX designer, and content strategist with expertise in creating professional, impactful slides. Focus on clean design, visual hierarchy, and emotional resonance.

OUTPUT FORMAT: Always output ONLY valid JSON conforming to the schema. No extra text.

SCHEMA REFERENCE:
${JSON.stringify(SlideSpecSchema.shape, null, 2)}`;

/**
 * Enhanced content length specifications with cognitive load optimization
 */
export const CONTENT_LENGTH_SPECS = {
  minimal: {
    description: 'Absolute essentials: Maximum impact with minimum words',
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
 */
export const TONE_SPECIFICATIONS = {
  professional: {
    style: 'Polished, confident, and authoritative',
    language: 'Formal, precise, with industry-specific terminology',
    approach: 'Evidence-based with clear logical flow',
    triggers: 'Credibility, authority, trust',
    bulletStyle: 'Use concise, impact-driven phrases'
  },
  casual: {
    style: 'Friendly, approachable, conversational',
    language: 'Simple, relatable, everyday language',
    approach: 'Story-driven with human connection',
    triggers: 'Relatability, engagement, warmth',
    bulletStyle: 'Use conversational, action-oriented phrases'
  },
  persuasive: {
    style: 'Compelling, action-oriented, emotionally engaging',
    language: 'Benefit-driven, urgent, with power words',
    approach: 'Problem-solution-benefit with strong calls to action',
    triggers: 'Urgency, desire, trust',
    bulletStyle: 'Use action verbs, focus on benefits'
  },
  educational: {
    style: 'Structured, informative, guiding with progressive complexity',
    language: 'Explanatory, logical flow with clear definitions',
    approach: 'Step-by-step buildup with questions and knowledge checks',
    triggers: 'Curiosity, achievement, mastery, and practical application',
    bulletStyle: 'Use sequential language, include "how to" elements'
  },
  inspiring: {
    style: 'Motivational, uplifting, visionary with transformational energy',
    language: 'Aspirational, emotionally resonant with future-focused imagery',
    approach: 'Vision-driven with transformational messaging and possibility',
    triggers: 'Hope, aspiration, identity, and collective purpose',
    bulletStyle: 'Use aspirational language, paint vivid future states'
  },
  authoritative: {
    style: 'Expert, commanding, definitive with unquestionable expertise',
    language: 'Precise, technical, with industry authority and credibility',
    approach: 'Fact-based with expert insights and proven methodologies',
    triggers: 'Expertise, credibility, proven results',
    bulletStyle: 'Use definitive statements, cite expertise and results'
  },
  friendly: {
    style: 'Warm, approachable, supportive with personal connection',
    language: 'Conversational, inclusive, with personal touches',
    approach: 'Relationship-focused with empathy and understanding',
    triggers: 'Connection, trust, support',
    bulletStyle: 'Use inclusive language, personal examples'
  },
  urgent: {
    style: 'Time-sensitive, action-oriented, compelling with immediate focus',
    language: 'Direct, immediate, with time-based triggers',
    approach: 'Problem-focused with immediate action requirements',
    triggers: 'Urgency, scarcity, immediate action',
    bulletStyle: 'Use action verbs, time-sensitive language'
  },
  confident: {
    style: 'Assured, decisive, strong with unwavering conviction',
    language: 'Definitive, clear, with strong positioning',
    approach: 'Solution-focused with proven track record',
    triggers: 'Confidence, success, proven results',
    bulletStyle: 'Use strong, definitive statements'
  },
  analytical: {
    style: 'Data-driven, logical, systematic with methodical approach',
    language: 'Precise, evidence-based, with analytical terminology',
    approach: 'Research-based with systematic analysis and conclusions',
    triggers: 'Logic, evidence, systematic thinking',
    bulletStyle: 'Use data points, logical progression, evidence-based statements'
  }
};

/**
 * Advanced storytelling frameworks for content structure
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
  }
};

/**
 * Comprehensive layout selection guide with psychological impact and content format guidance
 */
export const LAYOUT_SELECTION_GUIDE = {
  'title': 'Maximum impact statements, emotional moments, key transitions. Psychology: Creates focus and emphasis through isolation.',
  'title-bullets': 'Scannable lists, processes, benefits, action items. Psychology: Leverages cognitive chunking and parallel processing. Use bullets field.',
  'title-paragraph': 'Narrative explanations, stories, complex concepts, context-setting. Psychology: Enables deep understanding through storytelling. Use paragraph field.',
  'two-column': 'Comparisons, before/after, complementary concepts. Psychology: Enables comparative analysis and decision-making. Use left/right fields.',
  'mixed-content': 'Complex topics requiring both scannable points and narrative explanation. Psychology: Accommodates different learning preferences simultaneously.',
  'image-right': 'Visual storytelling, emotional connection, product showcases. Psychology: Combines visual and verbal processing for memory. Use right.imagePrompt.',
  'image-left': 'Visual storytelling with text emphasis, process illustrations. Psychology: Visual context supports text comprehension. Use left.imagePrompt.',
  'image-full': 'Emotional impact, brand moments, visual statements. Psychology: Maximum visual impact and emotional resonance. Use right.imagePrompt.',
  'quote': 'Testimonials, authority statements, inspirational messages. Psychology: Leverages social proof and emotional resonance. Use paragraph field.',
  'chart': 'Data stories, trend analysis, quantitative insights. Psychology: Provides concrete evidence and logical support. Use chart field.',
  'comparison-table': 'Feature comparisons, option analysis, decision matrices. Psychology: Enables systematic comparison and decision-making. Use comparisonTable field.',
  'timeline': 'Process flows, project phases, historical progression. Psychology: Shows progression and builds anticipation. Use timeline field.',
  'process-flow': 'Step-by-step procedures, methodologies, workflows. Psychology: Breaks complexity into manageable steps. Use processSteps field.',
  'before-after': 'Transformation stories, improvement showcases, change impact. Psychology: Demonstrates value through contrast. Use left/right fields.',
  'problem-solution': 'Challenge identification and resolution, value propositions. Psychology: Creates tension and resolution. Use left/right fields.',
  'data-visualization': 'Complex data presentation, analytical insights, research findings. Psychology: Makes data accessible and actionable. Use chart field.',
  'testimonial': 'Customer success stories, social proof, credibility building. Psychology: Leverages social validation and trust. Use quote layout.',
  'team-intro': 'Team presentations, expertise showcasing, credibility building. Psychology: Builds personal connection and trust. Use two-column layout.',
  'contact-info': 'Contact details, next steps, follow-up information. Psychology: Facilitates action and connection. Use bullets or paragraph.',
  'thank-you': 'Appreciation, conclusion, memorable endings. Psychology: Creates positive final impression. Use title or quote layout.',
  'agenda': 'Meeting structure, presentation outline, expectation setting. Psychology: Provides roadmap and reduces anxiety. Use bullets field.',
  'section-divider': 'Topic transitions, section breaks, presentation flow. Psychology: Provides mental breaks and organization. Use title layout.'
};

/**
 * Step 1: Enhanced core content generation prompt with comprehensive guidance
 */
export function generateContentPrompt(input: PromptInput): string {
  const contentSpec = CONTENT_LENGTH_SPECS[input.contentLength || 'moderate'];
  const audienceSpec = AUDIENCE_GUIDANCE[input.audience || 'general'];
  const toneSpec = TONE_SPECIFICATIONS[input.tone || 'professional'];

  // Get presentation type specific guidance
  const presentationGuidance = input.presentationType && input.presentationType !== 'general' ?
    PRESENTATION_TYPE_GUIDANCE[input.presentationType as keyof typeof PRESENTATION_TYPE_GUIDANCE] : null;

  const industryGuidance = input.industry && input.industry !== 'general' ?
    INDUSTRY_GUIDANCE[input.industry as keyof typeof INDUSTRY_GUIDANCE] : null;

  return `Generate comprehensive slide content based on: "${input.prompt}".

AUDIENCE PROFILE:
- Focus: ${audienceSpec.focus}
- Language: ${audienceSpec.language}
- Psychology: ${audienceSpec.psychology}
- Structure: ${audienceSpec.structure}

TONE & STYLE:
- Style: ${toneSpec.style}
- Language: ${toneSpec.language}
- Approach: ${toneSpec.approach}
- Bullet Style: ${toneSpec.bulletStyle}

CONTENT SPECIFICATIONS:
- Length: ${contentSpec.detail}
- Strategy: ${contentSpec.strategy}
- Guidance: ${contentSpec.contentGuidance}

${presentationGuidance ? `
PRESENTATION TYPE GUIDANCE (${input.presentationType}):
- Structure: ${presentationGuidance.structure}
- Emphasis: ${presentationGuidance.emphasis}
- Psychology: ${presentationGuidance.psychology}` : ''}

${industryGuidance ? `
INDUSTRY CONTEXT (${input.industry}):
- Terminology: ${industryGuidance.terminology}
- Focus: ${industryGuidance.focus}
- Examples: ${industryGuidance.examples}
- Tone: ${industryGuidance.tone}` : ''}

QUALITY REQUIREMENTS:
- Create compelling, memorable title (10-80 characters)
- Generate content that matches audience psychology and tone
- Include speaker notes for presentation delivery
- Add credible sources when applicable
- Ensure content is scannable and impactful

OUTPUT: JSON with title, bullets/paragraph, notes, sources. Focus on persuasion, clarity, and emotional resonance.`;
}

/**
 * Step 2: Enhanced layout refinement prompt with comprehensive layout support
 */
export function generateLayoutPrompt(_input: PromptInput, partialSpec: Partial<SlideSpec>): string {
  const availableLayouts = SLIDE_LAYOUTS.join(', ');

  return `Optimize layout and structure for this content: ${JSON.stringify(partialSpec)}.

AVAILABLE LAYOUTS: ${availableLayouts}

LAYOUT SELECTION CRITERIA:
- Content type and complexity
- Audience cognitive preferences
- Visual hierarchy requirements
- Information density optimization

LAYOUT GUIDANCE:
Use simple, proven layouts for most content:
- title-paragraph: For explanatory content, stories, and detailed information
- title-bullets: For lists, key points, and structured information
- two-column: For comparisons and side-by-side content
- chart: Only when specific data visualization is requested
- quote: Only for testimonials or inspirational quotes

AVOID complex layouts (timeline, process-flow, comparison-table) unless explicitly requested in the prompt.

DESIGN PRINCIPLES:
- Visual hierarchy: Most important content first
- White space: Ensure readability and focus
- F-pattern flow: Left-to-right, top-to-bottom scanning
- Cognitive load: Balance information density
- Accessibility: Clear contrast and readable fonts

CONTENT OPTIMIZATION:
- If data/numbers are present, consider chart, data-visualization, or comparison-table layouts
- If process/steps are described, consider timeline or process-flow layouts
- If comparing options, use comparison-table or before-after layouts
- If telling a story, use appropriate narrative layouts

ENHANCED FEATURES:
- Add chart configuration for data visualization
- Include timeline items for chronological content
- Create comparison tables for side-by-side analysis
- Define process steps for sequential content
- Add metrics for quantitative information

OUTPUT: Complete JSON specification with optimized layout, enhanced content structure, and appropriate specialized fields (chart, timeline, comparisonTable, processSteps, etc.).`;
}

/**
 * Step 3: Enhanced image generation prompt with style and context awareness
 */
export function generateImagePrompt(input: PromptInput, partialSpec: Partial<SlideSpec>): string {
  const imageStyle = input.imageStyle || 'professional';
  const brandContext = input.design?.brand ? JSON.stringify(input.design.brand) : 'corporate professional';

  return `Generate or refine imagePrompt for this slide: ${JSON.stringify(partialSpec)}.

IMAGE REQUIREMENTS:
- Style: ${imageStyle} (realistic, illustration, abstract, professional, minimal)
- Brand alignment: ${brandContext}
- Composition: Rule of thirds, balanced, high visual impact
- Quality: High-resolution, presentation-ready
- Accessibility: Clear contrast, readable elements

CONTENT ALIGNMENT:
- Must amplify and support the slide message
- Should evoke appropriate emotional response
- Relevant to audience: ${input.audience}
- Matches presentation tone: ${input.tone}

TECHNICAL SPECIFICATIONS:
- DALL-E 3 optimized prompt (20-400 characters)
- Professional photography or illustration style
- Appropriate for business/professional context
- Diverse and inclusive representation when showing people
- Avoid text overlays (text will be added separately)

LAYOUT CONSIDERATIONS:
- Consider slide layout: ${partialSpec.layout || 'title-paragraph'}
- Image placement: right column, left column, or full background
- Ensure image complements rather than competes with text

OUTPUT: Add optimized imagePrompt to appropriate field (right.imagePrompt, left.imagePrompt, etc.) in JSON output.`;
}

/**
 * Step 4: Enhanced final refinement prompt with comprehensive quality assurance
 */
export function generateRefinementPrompt(input: PromptInput, partialSpec: Partial<SlideSpec>): string {
  const qualityLevel = input.qualityLevel || 'standard';

  return `Perform comprehensive final refinement on this slide spec: ${JSON.stringify(partialSpec)}.

QUALITY LEVEL: ${qualityLevel} (standard, high, premium)

REFINEMENT CRITERIA:

TITLE OPTIMIZATION:
- Magnetic and benefit-driven
- Clear value proposition
- Appropriate length (10-80 characters)
- Emotional resonance for ${input.audience} audience

CONTENT ENHANCEMENT:
- Minimize cognitive load, maximize impact
- Ensure single main idea clarity
- Optimize for ${input.tone} tone
- Match ${input.contentLength} length requirements
- Apply ${input.audience} psychology principles

LAYOUT VALIDATION:
- Confirm optimal layout choice for content type
- Ensure visual hierarchy and flow
- Validate specialized fields (chart, timeline, etc.)
- Check content distribution and balance

DESIGN INTEGRATION:
- Apply theme/brand guidelines
- Ensure contrast and readability
- Optimize for presentation display
- Consider accessibility requirements

QUALITY ASSURANCE:
- 6-second test: Key message immediately clear
- Cognitive load: Information density appropriate
- Emotional impact: Resonates with intended audience
- Action clarity: Next steps or takeaways evident
- Professional polish: Ready for high-stakes presentation

FINAL VALIDATION:
- All required fields populated correctly
- Content aligns with original prompt intent
- Layout supports content effectively
- Professional presentation standards met

OUTPUT: Polished, presentation-ready JSON specification that exceeds professional standards.`;
}

/**
 * Industry-specific content guidance for specialized presentations
 */
export const INDUSTRY_GUIDANCE = {
  technology: {
    terminology: 'Use technical terms appropriately, explain complex concepts clearly',
    focus: 'Innovation, scalability, technical architecture, user experience',
    examples: 'Include technical diagrams, performance metrics, user adoption data',
    tone: 'Forward-thinking, data-driven, solution-oriented'
  },
  healthcare: {
    terminology: 'Balance medical terminology with accessible language',
    focus: 'Patient outcomes, clinical evidence, safety protocols, compliance',
    examples: 'Include clinical data, patient testimonials, regulatory compliance',
    tone: 'Professional, compassionate, evidence-based'
  },
  finance: {
    terminology: 'Use financial terminology, risk assessment language',
    focus: 'ROI, risk management, compliance, market analysis',
    examples: 'Include financial projections, risk assessments, market data',
    tone: 'Analytical, precise, confidence-building'
  },
  education: {
    terminology: 'Use pedagogical terms, learning-focused language',
    focus: 'Learning outcomes, engagement strategies, assessment methods',
    examples: 'Include learning metrics, student feedback, curriculum alignment',
    tone: 'Supportive, research-based, practical'
  },
  startup: {
    terminology: 'Use growth-oriented, agile terminology',
    focus: 'Market opportunity, traction, scalability, competitive advantage',
    examples: 'Include growth metrics, market validation, competitive analysis',
    tone: 'Dynamic, ambitious, data-driven'
  }
};

/**
 * Presentation-type-specific structuring guidance
 */
export const PRESENTATION_TYPE_GUIDANCE = {
  pitch: {
    structure: 'Problem → Solution → Market → Traction → Ask',
    emphasis: 'Compelling narrative, clear value proposition, strong call-to-action',
    timing: 'Concise, impactful, memorable',
    psychology: 'Build excitement, demonstrate opportunity, create urgency'
  },
  report: {
    structure: 'Executive Summary → Analysis → Findings → Recommendations',
    emphasis: 'Data-driven insights, clear conclusions, actionable recommendations',
    timing: 'Comprehensive, detailed, methodical',
    psychology: 'Build credibility through data, logical progression'
  },
  training: {
    structure: 'Objectives → Content → Practice → Assessment',
    emphasis: 'Clear learning objectives, practical examples, skill development',
    timing: 'Progressive complexity, interactive elements',
    psychology: 'Encourage learning, build confidence, practical application'
  },
  proposal: {
    structure: 'Need → Solution → Benefits → Implementation → Investment',
    emphasis: 'Clear value proposition, detailed implementation plan, ROI focus',
    timing: 'Thorough, persuasive, professional',
    psychology: 'Build trust, demonstrate value, minimize risk perception'
  }
};

/**
 * Advanced quality validation system
 */
export const QUALITY_VALIDATION_CRITERIA = {
  cognitive: {
    name: 'Cognitive Load Assessment',
    checks: [
      'Single main idea clearly communicated',
      'Information hierarchy is obvious',
      'Text density allows 6-second comprehension',
      'Visual elements support rather than compete'
    ]
  },
  persuasion: {
    name: 'Persuasion Effectiveness',
    checks: [
      'Clear value proposition or benefit',
      'Emotional resonance with target audience',
      'Credible evidence or social proof',
      'Compelling call-to-action or next step'
    ]
  },
  design: {
    name: 'Design Excellence',
    checks: [
      'Layout optimizes visual flow',
      'Typography hierarchy guides attention',
      'Color usage reinforces brand and mood',
      'WhiteસWhite space creates breathing room'
    ]
  },
  delivery: {
    name: 'Speaker Support',
    checks: [
      'Speaker notes provide strategic guidance',
      'Content supports 60-90 second delivery',
      'Smooth transitions to next topics',
      'Audience engagement opportunities identified'
    ]
  }
};

/**
 * Enhanced validation prompt with scoring system
 */
export const VALIDATION_PROMPT = `QUALITY ASSESSMENT: Evaluate this slide specification against world-class presentation standards.

INPUT SPEC: [Insert JSON here]

EVALUATION FRAMEWORK:

1. COGNITIVE EXCELLENCE (Weight: 30%)
   □ Single, clear main message (no competing ideas)
   □ 6-second comprehension test passed
   □ Information hierarchy is intuitive
   □ Cognitive load is optimized

2. PERSUASION MASTERY (Weight: 25%)
   □ Clear value proposition or benefit
   □ Emotional resonance with audience
   □ Credible evidence or authority
   □ Compelling next action

3. DESIGN SOPHISTICATION (Weight: 25%)
   □ Layout maximizes visual impact
   □ Typography creates clear hierarchy
   □ Brand consistency maintained
   □ Professional aesthetic achieved

4. DELIVERY EMPOWERMENT (Weight: 20%)
   □ Speaker notes provide strategic insights
   □ Content supports optimal timing
   □ Transition hooks included
   □ Audience engagement planned

SCORING: Rate each category 1-10. Provide specific, actionable improvements.
OUTPUT: Structured JSON with scores, strengths, and enhancement recommendations.`;

// Export the validation prompt as quality assessment prompt for compatibility
export const QUALITY_ASSESSMENT_PROMPT = VALIDATION_PROMPT;