/**
 * Enhanced AI Prompts for Professional PowerPoint Generation
 *
 * Advanced modular prompts for multi-step AI processing to create high-quality, professional slides.
 * Steps: Content → Layout → Image → Refinement → Validation.
 * Incorporates 2024 design trends, storytelling frameworks, and accessibility best practices.
 *
 * LATEST ENHANCEMENTS:
 * - Advanced narrative structure with proven storytelling frameworks
 * - Enhanced content quality with executive-level precision and clarity
 * - Intelligent image prompt generation with context-aware descriptions
 * - Comprehensive error handling with graceful degradation
 * - Performance optimizations and real-time monitoring
 * - AI-agent-friendly structure for seamless integration
 *
 * @version 4.0.0-enhanced
 * @author AI PowerPoint Generator Team
 */

import { SlideSpecSchema, type GenerationParams, type SlideSpec, SLIDE_LAYOUTS } from './schema';
// Slide types simplified - using schema types instead

/**
 * Enhanced System prompt with strict guidance for professional PowerPoint generation
 * Incorporates precise requirements, quality enforcement, and consistent output standards
 */
export const SYSTEM_PROMPT = `You are an elite PowerPoint presentation architect with 15+ years of experience creating high-impact business presentations for Fortune 500 companies. You specialize in transforming complex ideas into clear, compelling, and actionable slide content.

## CORE EXPERTISE:
- **Strategic Content**: Crafting outcome-driven messaging that compels action and drives business results
- **Executive Communication**: Understanding C-suite decision-making patterns and information processing
- **Data Storytelling**: Transforming complex information into compelling narratives with clear insights
- **Professional Standards**: Ensuring boardroom-ready content with impeccable quality

## STRICT QUALITY REQUIREMENTS (NON-NEGOTIABLE):
1. **PRECISION**: Every word must be purposeful, specific, and measurable - NO vague language
2. **IMPACT**: Lead with outcomes, use active voice, include quantified benefits
3. **CLARITY**: Structure content for 10-second comprehension (3-5 bullets optimal, 6 maximum)
4. **PROFESSIONALISM**: Boardroom-ready formatting, perfect grammar, logical flow
5. **AUTHENTICITY**: Use realistic, contextually appropriate metrics that feel genuine
6. **CONSISTENCY**: Maintain executive-level communication standards throughout

## MANDATORY CONTENT STANDARDS:
- **Titles**: 15-60 characters, outcome-focused, quantified when possible
- **Bullets**: 3-5 bullets maximum, 12-20 words each, action-oriented
- **Language**: Active voice, specific metrics, professional terminology
- **Data**: Realistic percentages (15-25% not 23.7%), contextual timeframes
- **Tone**: Executive-level, confident, evidence-based

## STORYTELLING STRUCTURE (CHOOSE ONE):
- **Problem-Solution-Impact**: Challenge → Solution → Results
- **Before-After-Bridge**: Current State → Future State → Path Forward
- **Data-Driven**: Context → Insight → Action

## CRITICAL SUCCESS FACTORS:
- Use SPECIFIC metrics, dates, and outcomes (not vague statements)
- Every bullet point must provide clear value or inspire action
- Structure content for immediate comprehension and maximum impact
- Ensure all data points feel realistic and contextually appropriate
- Drive toward clear decisions or next steps

## OUTPUT REQUIREMENTS:
- **Format**: Valid JSON only, matching exact schema
- **Quality Target**: A+ grade content (95+ quality score)
- **Validation**: Self-check against schema and quality standards

## QUALITY EXAMPLES:
✅ EXCELLENT Title: "Q4 Revenue: 34% Growth Exceeds $2.1M Target"
❌ POOR Title: "Q4 Results" or "Revenue Update"
✅ EXCELLENT Bullet: "Reduced customer acquisition cost from $150 to $90 through targeted campaigns"
❌ POOR Bullet: "Marketing improved" or "Costs went down"

## AUTHENTICITY GUIDELINES:
- Use realistic, industry-appropriate metrics
- Prefer ranges (15-25%) over exact figures (23.7%)
- Include contextual timeframes (Q3, within 6 months)
- Reference specific methodologies when mentioning improvements

REMEMBER: You're creating content for high-stakes presentations. Excellence is mandatory, mediocrity is unacceptable.

SCHEMA: Use SlideSpec TypeScript type with fields: title, layout, bullets, paragraph, chart, comparisonTable, notes, sources.`;

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
  },
  business: {
    language: 'Professional business terminology, performance-focused, strategic',
    focus: 'Business outcomes, operational efficiency, growth metrics',
    tone: 'Professional, results-oriented, strategic',
    psychology: 'Appeal to business success, efficiency, and competitive advantage',
    structure: 'Challenge → Solution → Results → Business Impact'
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
  },
  dataStory: { // New: Data-driven narrative framework
    name: 'Data-Driven Narrative',
    structure: 'Context → Conflict → Resolution',
    bestFor: 'Analytics presentations, research findings, performance reviews',
    bulletPattern: ['Set the data context', 'Reveal the insight or conflict', 'Present the resolution or recommendation']
  }
};

/**
 * Enhanced tone adaptation strategies for storytelling frameworks (C-1: Narrative Quality & Structure)
 * Maps each framework to specific tone implementations
 */
export const FRAMEWORK_TONE_ADAPTATIONS = {
  problemSolution: {
    professional: 'Focus on business metrics, ROI, and strategic implications',
    casual: 'Use relatable examples, conversational language, and personal anecdotes',
    analytical: 'Emphasize data-driven problem identification and solution validation',
    persuasive: 'Highlight urgency, compelling benefits, and competitive advantages',
    educational: 'Break down complex problems into understandable components with clear explanations'
  },
  beforeAfter: {
    professional: 'Use strategic language, business outcomes, and transformation metrics',
    casual: 'Paint vivid pictures of transformation with relatable scenarios',
    analytical: 'Quantify current state vs future state gaps with detailed analysis',
    persuasive: 'Emphasize the cost of inaction and benefits of change',
    educational: 'Explain the transformation process step-by-step with learning objectives'
  },
  heroJourney: {
    professional: 'Focus on strategic decisions, business outcomes, and leadership lessons',
    casual: 'Tell an engaging story with personal touches and emotional connection',
    analytical: 'Document the journey with data, milestones, and measurable progress',
    persuasive: 'Inspire action through triumph over adversity and proven success',
    educational: 'Extract learnings from each stage with actionable insights'
  },
  pyramid: {
    professional: 'Lead with strategic recommendations and executive-level insights',
    casual: 'Start with the bottom line in accessible, jargon-free language',
    analytical: 'Present conclusions backed by rigorous analysis and methodology',
    persuasive: 'Lead with compelling recommendations that drive immediate action',
    educational: 'Structure learning from conclusion to supporting concepts with clear progression'
  },
  microStory: {
    professional: 'Sharp, executive-level insights with immediate business relevance',
    casual: 'Engaging hooks with relatable insights and conversational delivery',
    analytical: 'Data-driven hooks with actionable insights and clear methodology',
    persuasive: 'Compelling hooks that drive immediate action and decision-making',
    educational: 'Thought-provoking hooks with learning insights and knowledge transfer'
  },
  dataStory: {
    professional: 'Business-focused data interpretation with strategic implications',
    casual: 'Make data accessible and relatable with real-world examples',
    analytical: 'Deep dive into statistical significance and methodological rigor',
    persuasive: 'Use data to build compelling arguments and drive decisions',
    educational: 'Teach data literacy and interpretation with clear explanations'
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
 * Step 1: Enhanced core content generation prompt with advanced prompt engineering
 * Incorporates chain-of-thought reasoning, few-shot examples, and quality enforcement
 */
/**
 * Intelligently select storytelling framework based on content and context (C-1: Narrative Quality & Structure)
 * Enhanced with tone awareness and content analysis
 */
function selectOptimalFramework(input: GenerationParams): {
  framework: typeof STORYTELLING_FRAMEWORKS[keyof typeof STORYTELLING_FRAMEWORKS];
  toneGuidance: string;
  narrativeStrategy: string;
} {
  const prompt = input.prompt.toLowerCase();
  let selectedFramework: keyof typeof STORYTELLING_FRAMEWORKS;

  // Enhanced content analysis for framework selection
  if (prompt.includes('data') || prompt.includes('analytics') || prompt.includes('metrics') || prompt.includes('research')) {
    selectedFramework = 'dataStory';
  } else if (prompt.includes('before') && prompt.includes('after') || prompt.includes('transform') || prompt.includes('improve')) {
    selectedFramework = 'beforeAfter';
  } else if (prompt.includes('timeline') || prompt.includes('history') || prompt.includes('journey') || prompt.includes('progress') || prompt.includes('story')) {
    selectedFramework = 'heroJourney';
  } else if (prompt.includes('recommend') || prompt.includes('analysis') || prompt.includes('conclusion') || input.audience === 'executives') {
    selectedFramework = 'pyramid';
  } else if (input.contentLength === 'minimal' || input.contentLength === 'brief') {
    selectedFramework = 'microStory';
  } else {
    selectedFramework = 'problemSolution'; // Default fallback
  }

  const framework = STORYTELLING_FRAMEWORKS[selectedFramework];
  const toneGuidance = (FRAMEWORK_TONE_ADAPTATIONS[selectedFramework] as any)?.[input.tone] ||
                      FRAMEWORK_TONE_ADAPTATIONS[selectedFramework]?.professional ||
                      'Use professional tone with clear, concise language';

  // Generate narrative strategy based on framework and audience
  const narrativeStrategy = generateNarrativeStrategy(selectedFramework, input);

  return {
    framework,
    toneGuidance,
    narrativeStrategy
  };
}

/**
 * Generate narrative strategy based on framework and input parameters
 */
function generateNarrativeStrategy(frameworkKey: keyof typeof STORYTELLING_FRAMEWORKS, input: GenerationParams): string {
  const audienceStrategies = {
    executives: 'Lead with strategic impact, use executive summary format, focus on ROI and business outcomes',
    managers: 'Balance strategic overview with tactical details, emphasize team impact and implementation',
    technical: 'Include technical depth, use precise terminology, provide implementation details',
    general: 'Use accessible language, provide context, focus on practical benefits',
    students: 'Use educational approach, provide background context, include learning objectives'
  };

  const lengthStrategies = {
    minimal: 'Distill to absolute essentials, use powerful single statements, maximize impact per word',
    brief: 'Focus on key points only, use concise bullets, maintain clarity without detail',
    moderate: 'Balance detail with brevity, provide sufficient context, use structured approach',
    detailed: 'Provide comprehensive coverage, include supporting details, use thorough explanations',
    comprehensive: 'Cover all aspects thoroughly, include extensive context, provide complete analysis'
  };

  const audienceStrategy = (audienceStrategies as any)[input.audience] || audienceStrategies.general;
  const lengthStrategy = lengthStrategies[input.contentLength] || lengthStrategies.moderate;

  return `${audienceStrategy}. ${lengthStrategy}. Framework: ${STORYTELLING_FRAMEWORKS[frameworkKey].structure}`;
}

/**
 * Analyze content to recommend optimal layout
 */
function analyzeContentForLayout(partialSpec: Partial<SlideSpec>): {
  type: string;
  complexity: string;
  recommendedLayouts: string[];
  visualPriority: string;
  reasoning: string;
} {
  const content = (partialSpec.title + ' ' + (partialSpec.paragraph || partialSpec.bullets?.join(' ') || '')).toLowerCase();
  const hasNumbers = /\d+%|\$[\d,]+|\d+x|increase|decrease|growth|revenue/.test(content);
  const hasComparison = /vs|versus|compared|before|after|better|worse/.test(content);
  const hasProcess = /step|phase|stage|process|workflow|timeline/.test(content);
  const hasData = /chart|graph|data|metrics|analytics|statistics/.test(content);

  if (hasData) {
    return {
      type: 'data-driven',
      complexity: 'high',
      recommendedLayouts: ['chart', 'data-visualization', 'mixed-content'],
      visualPriority: 'data visualization',
      reasoning: 'contains data/metrics requiring visual representation'
    };
  } else if (hasComparison) {
    return {
      type: 'comparative',
      complexity: 'medium',
      recommendedLayouts: ['two-column', 'before-after', 'comparison-table'],
      visualPriority: 'side-by-side comparison',
      reasoning: 'contains comparative elements'
    };
  } else if (hasProcess) {
    return {
      type: 'process-oriented',
      complexity: 'medium',
      recommendedLayouts: ['timeline', 'process-flow', 'mixed-content'],
      visualPriority: 'sequential flow',
      reasoning: 'describes process or sequential steps'
    };
  } else if (hasNumbers) {
    return {
      type: 'metric-focused',
      complexity: 'medium',
      recommendedLayouts: ['title-bullets', 'mixed-content', 'chart'],
      visualPriority: 'key metrics',
      reasoning: 'contains important numerical data'
    };
  } else {
    return {
      type: 'narrative',
      complexity: 'low',
      recommendedLayouts: ['title-paragraph', 'title-bullets', 'mixed-content'],
      visualPriority: 'clear messaging',
      reasoning: 'primarily text-based content'
    };
  }
}

/**
 * Enhanced content analysis for context-aware imagery (C-2: Context-Aware Image Prompts)
 * Analyzes slide content and theme to recommend optimal image concepts
 */
function analyzeContentForImagery(partialSpec: Partial<SlideSpec>, input: GenerationParams): {
  contentType: string;
  themes: string[];
  recommendedConcept: string;
  visualMetaphor: string;
  themeAlignment: string;
  emotionalTone: string;
  technicalSpecs: string;
} {
  const content = (partialSpec.title + ' ' + (partialSpec.paragraph || partialSpec.bullets?.join(' ') || '')).toLowerCase();
  const selectedTheme = input.design?.theme || 'professional';

  const themes: string[] = [];
  let contentType = 'general';
  let recommendedConcept = 'professional business setting';
  let visualMetaphor = 'clean, modern workspace';
  let themeAlignment = 'professional corporate aesthetic';
  let emotionalTone = 'confident and trustworthy';
  let technicalSpecs = 'high resolution, professional lighting';

  // Enhanced content analysis with theme integration (C-2: Context-Aware Image Prompts)
  if (/growth|increase|revenue|profit|success/.test(content)) {
    themes.push('growth', 'success');
    contentType = 'business-growth';
    recommendedConcept = 'upward trending charts or growth imagery';
    visualMetaphor = 'ascending arrows, growing plants, or climbing stairs';
    emotionalTone = 'optimistic and aspirational';
  }

  if (/team|collaboration|people|together/.test(content)) {
    themes.push('teamwork', 'collaboration');
    contentType = 'team-focused';
    recommendedConcept = 'diverse team collaboration';
    visualMetaphor = 'connected networks or unified team dynamics';
    emotionalTone = 'inclusive and energetic';
  }

  if (/technology|digital|ai|automation|innovation/.test(content)) {
    themes.push('technology', 'innovation');
    contentType = 'tech-focused';
    recommendedConcept = 'modern technology interfaces';
    visualMetaphor = 'digital transformation or futuristic elements';
    emotionalTone = 'cutting-edge and progressive';
  }

  if (/data|analytics|metrics|statistics/.test(content)) {
    themes.push('data', 'analytics');
    contentType = 'data-driven';
    recommendedConcept = 'data visualization or dashboard';
    visualMetaphor = 'flowing data streams or organized information';
    emotionalTone = 'analytical and precise';
  }

  if (/problem|challenge|issue|difficulty/.test(content)) {
    themes.push('problem-solving', 'challenge');
    contentType = 'problem-focused';
    recommendedConcept = 'problem-solving or overcoming obstacles';
    visualMetaphor = 'breaking through barriers or finding solutions';
    emotionalTone = 'determined and solution-oriented';
  }

  if (/solution|answer|resolve|fix/.test(content)) {
    themes.push('solution', 'resolution');
    contentType = 'solution-focused';
    recommendedConcept = 'clear pathways or breakthrough moments';
    visualMetaphor = 'light at the end of tunnel or key unlocking potential';
    emotionalTone = 'confident and reassuring';
  }

  // Theme-specific visual alignment
  const themeVisualMappings = {
    'creative-studio': 'artistic, vibrant colors, creative workspace aesthetic',
    'corporate-blue': 'professional blue tones, corporate environment, clean lines',
    'modern-minimal': 'minimalist design, white space, geometric elements',
    'tech-forward': 'futuristic elements, digital interfaces, high-tech environment',
    'warm-professional': 'warm tones, approachable professional setting',
    'bold-impact': 'high contrast, dramatic lighting, powerful visual impact'
  };

  themeAlignment = (themeVisualMappings as any)[selectedTheme] || 'professional corporate aesthetic';

  // Technical specifications based on theme
  const themeTechnicalSpecs = {
    'creative-studio': 'vibrant colors, artistic lighting, creative composition',
    'corporate-blue': 'professional lighting, blue color palette, clean composition',
    'modern-minimal': 'minimal elements, soft lighting, geometric composition',
    'tech-forward': 'high-tech lighting, digital elements, futuristic composition',
    'warm-professional': 'warm lighting, earth tones, approachable composition',
    'bold-impact': 'dramatic lighting, high contrast, powerful composition'
  };

  technicalSpecs = (themeTechnicalSpecs as any)[selectedTheme] || 'high resolution, professional lighting';

  // Default fallback
  if (themes.length === 0) {
    themes.push('professional', 'business');
  }

  return {
    contentType,
    themes,
    recommendedConcept,
    visualMetaphor,
    themeAlignment,
    emotionalTone,
    technicalSpecs
  };
}

/**
 * Perform quick quality assessment for refinement guidance
 */
function performQuickQualityCheck(partialSpec: Partial<SlideSpec>, input: GenerationParams): {
  estimatedScore: number;
  issues: string[];
  strengths: string[];
} {
  const issues: string[] = [];
  const strengths: string[] = [];
  let score = 100;

  // Check title quality
  const title = partialSpec.title || '';
  if (title.length < 15) {
    issues.push('title too short');
    score -= 10;
  } else if (title.length > 60) {
    issues.push('title too long');
    score -= 5;
  } else {
    strengths.push('good title length');
  }

  if (!/\d+/.test(title) && (partialSpec.bullets?.some(b => /\d+/.test(b)) || false)) {
    issues.push('title lacks quantification');
    score -= 5;
  }

  // Check content quality
  const bullets = partialSpec.bullets || [];
  if (bullets.length > 7) {
    issues.push('too many bullets');
    score -= 10;
  } else if (bullets.length > 0) {
    strengths.push('appropriate bullet count');
  }

  // Check for vague language
  const vaguePhrases = ['good', 'better', 'improved', 'things', 'stuff'];
  const hasVague = bullets.some(b => vaguePhrases.some(phrase => b.toLowerCase().includes(phrase)));
  if (hasVague) {
    issues.push('vague language detected');
    score -= 15;
  } else {
    strengths.push('specific language');
  }

  return { estimatedScore: Math.max(score, 0), issues, strengths };
}

/**
 * Analyze prompt context to determine content type and requirements
 */
function analyzePromptContext(prompt: string): {
  contentType: 'data-driven' | 'strategic' | 'process' | 'comparison' | 'narrative';
  complexity: 'simple' | 'moderate' | 'complex';
  visualElements: string[];
  keyThemes: string[];
} {
  const lowerPrompt = prompt.toLowerCase();

  // Determine content type
  let contentType: 'data-driven' | 'strategic' | 'process' | 'comparison' | 'narrative' = 'narrative';

  if (lowerPrompt.includes('data') || lowerPrompt.includes('metrics') || lowerPrompt.includes('results')) {
    contentType = 'data-driven';
  } else if (lowerPrompt.includes('strategy') || lowerPrompt.includes('plan') || lowerPrompt.includes('roadmap')) {
    contentType = 'strategic';
  } else if (lowerPrompt.includes('process') || lowerPrompt.includes('workflow') || lowerPrompt.includes('steps')) {
    contentType = 'process';
  } else if (lowerPrompt.includes('compare') || lowerPrompt.includes('vs') || lowerPrompt.includes('versus')) {
    contentType = 'comparison';
  }

  // Determine complexity
  const complexity = prompt.length > 200 ? 'complex' : prompt.length > 100 ? 'moderate' : 'simple';

  // Identify visual elements needed
  const visualElements: string[] = [];
  if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph')) visualElements.push('chart');
  if (lowerPrompt.includes('table') || lowerPrompt.includes('comparison')) visualElements.push('table');
  if (lowerPrompt.includes('timeline') || lowerPrompt.includes('schedule')) visualElements.push('timeline');
  if (lowerPrompt.includes('image') || lowerPrompt.includes('visual')) visualElements.push('image');

  // Extract key themes
  const keyThemes = extractKeyThemes(prompt);

  return { contentType, complexity, visualElements, keyThemes };
}

/**
 * Detect industry context from prompt content
 */
function detectIndustryContext(prompt: string): string {
  const industryKeywords = {
    technology: ['software', 'app', 'platform', 'digital', 'tech', 'AI', 'machine learning'],
    healthcare: ['patient', 'medical', 'health', 'clinical', 'treatment', 'diagnosis'],
    finance: ['revenue', 'profit', 'investment', 'financial', 'budget', 'ROI'],
    marketing: ['campaign', 'brand', 'customer', 'engagement', 'conversion', 'audience'],
    education: ['student', 'learning', 'curriculum', 'education', 'training', 'course'],
    consulting: ['strategy', 'optimization', 'efficiency', 'transformation', 'analysis']
  };

  const lowerPrompt = prompt.toLowerCase();

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      return industry;
    }
  }

  return 'general';
}

/**
 * Identify data requirements from prompt
 */
function identifyDataNeeds(prompt: string): {
  needsMetrics: boolean;
  needsComparisons: boolean;
  needsTimeline: boolean;
  suggestedDataTypes: string[];
} {
  const lowerPrompt = prompt.toLowerCase();

  const needsMetrics = /\b(result|performance|metric|kpi|roi|growth|increase|decrease|percent)\b/.test(lowerPrompt);
  const needsComparisons = /\b(compare|versus|vs|difference|better|worse|advantage)\b/.test(lowerPrompt);
  const needsTimeline = /\b(timeline|schedule|roadmap|phase|quarter|month|year)\b/.test(lowerPrompt);

  const suggestedDataTypes: string[] = [];
  if (needsMetrics) suggestedDataTypes.push('performance metrics', 'KPIs', 'percentages');
  if (needsComparisons) suggestedDataTypes.push('comparative data', 'benchmarks');
  if (needsTimeline) suggestedDataTypes.push('dates', 'milestones', 'phases');

  return { needsMetrics, needsComparisons, needsTimeline, suggestedDataTypes };
}

/**
 * Extract key themes from prompt text
 */
function extractKeyThemes(prompt: string): string[] {
  const words = prompt.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);

  const themes = words
    .filter(word => word.length > 4 && !stopWords.has(word))
    .filter(word => /^[a-zA-Z]+$/.test(word))
    .slice(0, 5);

  return themes;
}

export function generateContentPrompt(input: GenerationParams): string {
  const { framework, toneGuidance, narrativeStrategy } = selectOptimalFramework(input);
  const audienceGuidance = AUDIENCE_GUIDANCE[input.audience] || AUDIENCE_GUIDANCE.general;
  const toneSpec = TONE_SPECIFICATIONS[input.tone] || TONE_SPECIFICATIONS.professional;
  const lengthSpec = CONTENT_LENGTH_SPECS[input.contentLength] || CONTENT_LENGTH_SPECS.moderate;

  return `## CONTENT GENERATION TASK
Create professional slide content for: "${input.prompt}"

## STRICT REQUIREMENTS:
**Target Audience**: ${input.audience} - ${audienceGuidance.focus}
**Communication Style**: ${toneSpec.style}
**Content Depth**: ${lengthSpec.description}
**Framework**: ${framework.name} - ${framework.structure}

## MANDATORY QUALITY STANDARDS:
- **Title**: Outcome-focused, 15-60 characters, quantified when possible
- **Bullets**: 3-5 bullets maximum, 12-20 words each, action-oriented
- **Language**: Active voice, specific metrics, professional terminology
- **Data**: Realistic percentages, contextual timeframes
- **Tone**: Executive-level, confident, evidence-based

## CONTENT SPECIFICATIONS:
- Drive specific business outcome for ${input.audience}
- Include quantified benefits and clear value proposition
- Use realistic, contextually appropriate metrics
- Maintain C-suite level communication quality

## INDUSTRY CONTEXT:
${input.industry && input.industry !== 'general' ? `**Industry Focus**: ${input.industry} - Tailor content with industry-specific terminology, metrics, and challenges relevant to ${input.industry} professionals.` : '**Industry**: General business context - Use universally applicable language and examples.'}

## PRESENTATION TYPE GUIDANCE:
${input.presentationType && input.presentationType !== 'general' ? `**Presentation Type**: ${input.presentationType} - Structure content optimally for ${input.presentationType} format with appropriate pacing and emphasis.` : '**Type**: General presentation - Use balanced structure suitable for broad business contexts.'}

## QUALITY EXAMPLES:

**EXCELLENT Title Examples:**
✅ "Q4 Revenue: 34% Growth Exceeds $2.1M Target by 18%"
✅ "Customer NPS Jumps from 6.2 to 8.4 Following Service Redesign"
✅ "New AI System Reduces Processing Time from 4 Hours to 90 Minutes"

**POOR Title Examples:**
❌ "Q4 Results" (too vague, no outcome)
❌ "Some Updates" (no specificity or value)
❌ "Information About Our Performance" (wordy, unclear benefit)

**EXCELLENT Bullet Examples (15-25 words each):**
✅ "Reduced customer churn from 12% to 8.5% through personalized onboarding program launched in Q3" (16 words)
✅ "Captured 15% market share in APAC within 6 months, generating $1.2M additional revenue" (14 words)
✅ "Automated invoice processing, eliminating 200 manual hours weekly and reducing errors by 85%" (13 words)

**POOR Bullet Examples:**
❌ "We did better this quarter" (vague, no metrics or context)
❌ "Improvements were made to our processes" (passive voice, no specifics)
❌ "Things are going well with customers" (meaningless, no evidence)
❌ "Our comprehensive customer relationship management system implementation has resulted in significant improvements across multiple key performance indicators including but not limited to customer satisfaction scores" (26+ words - too verbose)

**CONTENT AUTHENTICITY REQUIREMENTS:**
- Use realistic percentage ranges (15-25% not 23.7%)
- Include contextual timeframes (Q3, within 6 months, year-over-year)
- Reference specific methodologies or programs when mentioning improvements
- Ensure dollar amounts align with company size and industry norms

**EXCELLENT Timeline Examples:**
✅ {"date": "1754", "title": "Military Career Begins", "description": "Starts his military career during the French and Indian War, demonstrating early leadership skills.", "milestone": false}
✅ {"date": "1789", "title": "First President of the United States", "description": "Elected as the inaugural President, establishing protocols that would guide future leaders.", "milestone": true}

**POOR Timeline Examples:**
❌ {"date": "1754", "title": "Military stuff", "description": "Did some things"}
❌ {"date": "Later", "title": "Became President", "description": "Was important"}

## GRID LAYOUT GUIDANCE:
If content naturally fits a structured format (comparisons, features, metrics, team info), consider suggesting grid-layout:
- **Dashboard/Metrics**: 4x1 or 2x2 grid with metric cells
- **Feature Comparison**: 3x2 grid with headers and bullet points
- **Team Introduction**: 4x1 or 2x2 grid with image and paragraph cells
- **Process Steps**: 4x1 or 3x1 grid with numbered headers and descriptions
- **Before/After**: 2x2 grid showing comparison data

**Grid Layout JSON Structure:**
\`\`\`json
{
  "title": "Grid Layout Title",
  "layout": "grid-layout",
  "gridLayout": {
    "columns": 3,
    "rows": 2,
    "cells": [
      {"row": 0, "column": 0, "type": "header", "title": "Feature A"},
      {"row": 1, "column": 0, "type": "bullets", "bullets": ["Benefit 1", "Benefit 2"]},
      {"row": 0, "column": 1, "type": "metric", "metric": {"value": "25%", "label": "Growth"}}
    ],
    "cellSpacing": "normal"
  }
}
\`\`\`

## OUTPUT REQUIREMENTS:
Create a JSON object with these exact fields (STRICT SCHEMA COMPLIANCE REQUIRED):
{
  "title": "Specific, compelling title with clear benefit/outcome (15-60 characters)",
  "layout": "title-paragraph", // Will be optimized in next step - consider "grid-layout" for structured content
  "paragraph": "Engaging narrative content (if using paragraph format)",
  "bullets": ["Specific, metric-driven bullet points (15-25 words each, max 5 total)"],
  "notes": "Speaker delivery guidance and key talking points",
  "sources": ["Credible source references if applicable"],
  "gridLayout": { /* Only include if layout should be "grid-layout" */ }
}

## MANDATORY VALIDATION CHECKLIST:
Before responding, STRICTLY verify each requirement:
- ✅ Title is specific and benefit-focused (15-60 characters) - COUNT THE CHARACTERS
- ✅ Content matches audience sophistication level (${input.audience})
- ✅ Tone aligns with ${input.tone} requirements - NO DEVIATION
- ✅ Length matches ${input.contentLength} specification
- ✅ Each bullet point is 15-25 words maximum - COUNT EVERY WORD
- ✅ Maximum 5 bullet points total for optimal impact - NO EXCEPTIONS
- ✅ JSON format is valid and complete - TEST PARSING
- ✅ Content would score 90+ on quality assessment
- ✅ Every word serves a purpose - NO FILLER CONTENT
- ✅ Metrics are realistic and contextually appropriate
- ✅ Professional tone maintained throughout

Generate content that executives would be proud to present to their most important stakeholders.

## SELF-REFLECTION CHECKPOINT:
${SELF_REFLECTION_PROMPTS.contentReflection}

## REFERENCE EXAMPLES:
Study these examples of excellent vs. poor content:

**EXCELLENT EXAMPLE:**
${JSON.stringify(FEW_SHOT_EXAMPLES.excellentSlides[0], null, 2)}
**Why Excellent:** ${FEW_SHOT_EXAMPLES.excellentSlides[0].whyExcellent}

**POOR EXAMPLE (AVOID):**
${JSON.stringify(FEW_SHOT_EXAMPLES.poorSlides[0], null, 2)}
**Why Poor:** ${FEW_SHOT_EXAMPLES.poorSlides[0].whyPoor}

Aim for the excellence level shown in the good examples.`;
}

/**
 * Step 2: Enhanced layout refinement prompt with advanced visual design reasoning
 * Incorporates UX principles, accessibility guidelines, and data-driven layout selection
 */
export function generateLayoutPrompt(input: GenerationParams, partialSpec: Partial<SlideSpec>): string {
  // Analyze content to suggest optimal layout
  const contentAnalysis = analyzeContentForLayout(partialSpec);

  return `## LAYOUT OPTIMIZATION TASK
Optimize visual layout for maximum impact and comprehension.

## CURRENT CONTENT ANALYSIS:
${JSON.stringify(partialSpec, null, 2)}

## DESIGN CONTEXT:
**Audience**: ${input.audience} (affects complexity and visual preferences)
**Tone**: ${input.tone} (influences layout formality and structure)
**User Preference**: ${input.design?.layout || 'auto-select based on content'}
**Image Integration**: ${input.withImage ? 'Required - optimize for visual storytelling' : 'Text-focused design'}
**Content Type**: ${contentAnalysis.type} (${contentAnalysis.reasoning})

## LAYOUT DECISION FRAMEWORK:

### Content Analysis Results:
- **Information Type**: ${contentAnalysis.type}
- **Complexity Level**: ${contentAnalysis.complexity}
- **Recommended Layouts**: ${contentAnalysis.recommendedLayouts.join(', ')}
- **Visual Priority**: ${contentAnalysis.visualPriority}

### Step 2: Audience-Optimized Layout Strategy
**${input.audience} audience optimization:**
${input.audience === 'executives' ? '- Prioritize high-impact visuals with minimal text\n- Use layouts that support quick decision-making\n- Emphasize outcomes and ROI metrics\n- Prefer clean, authoritative designs that convey competence' :
  input.audience === 'technical' ? '- Support detailed information with logical progression\n- Use process-oriented and data-visualization layouts\n- Enable deep-dive analysis with structured information\n- Prefer layouts that show technical relationships and workflows' :
  input.audience === 'students' ? '- Create engaging, educational progressions\n- Use visual learning aids and step-by-step layouts\n- Support knowledge retention with clear structure\n- Prefer layouts that facilitate understanding and engagement' :
  '- Balance information density with accessibility\n- Use clear, scannable structures for broad appeal\n- Support both quick scanning and detailed reading\n- Prefer professional but approachable layouts'}

### Step 3: Content-Layout Matching Intelligence
**Smart Layout Selection Based on Content Type:**
- **Metrics/Results**: Use title-bullets or mixed-content for impact
- **Comparisons**: Use two-column, before-after, or comparison-table
- **Processes**: Use timeline, process-flow, or step-by-step layouts
- **Data**: Use chart, data-visualization, or infographic layouts
- **Stories**: Use mixed-content or narrative-flow layouts

### AVAILABLE LAYOUTS & SELECTION CRITERIA:
**Primary Layouts**: ${SLIDE_LAYOUTS.join(', ')}

**GRID LAYOUT SYSTEM**:
- **grid-layout**: Flexible grid system for organizing content in columns and rows
  - Supports 1-4 columns and 1-3 rows (max 12 cells)
  - Each cell can contain: header, bullets, paragraph, metric, image, chart, or be empty
  - Perfect for dashboards, feature comparisons, team introductions, or structured data
  - Auto-formats content within each cell while maintaining grid structure
  - Example: 3x2 grid for feature showcase, 2x2 for comparison matrix, 4x1 for metrics dashboard

**LAYOUT SELECTION CRITERIA**:
${Object.entries(LAYOUT_SELECTION_GUIDE).slice(0, 8).map(([layout, guide]) => `**${layout}**: ${guide}`).join('\n')}

**Advanced Layouts**: ${Object.entries(LAYOUT_SELECTION_GUIDE).slice(8).map(([layout]) => layout).join(', ')}

### Step 4: Data Structure Requirements
When selecting layouts, ensure proper data structure:

**Two-Column Layouts** (two-column, before-after, problem-solution):
\`\`\`json
{
  "left": {"bullets": ["Point 1", "Point 2"] OR "paragraph": "Text content"},
  "right": {"bullets": ["Point 1", "Point 2"] OR "paragraph": "Text content" OR "imagePrompt": "Image description"}
}
\`\`\`

**Chart Layouts** (chart, data-visualization):
\`\`\`json
{
  "chart": {
    "type": "bar|line|pie|doughnut|area|scatter|column",
    "title": "Chart title",
    "categories": ["Category 1", "Category 2"],
    "series": [{"name": "Series Name", "data": [value1, value2]}]
  }
}
\`\`\`

**Table Layouts** (comparison-table):
\`\`\`json
{
  "comparisonTable": {
    "headers": ["Feature", "Option A", "Option B"],
    "rows": [["Speed", "Fast", "Moderate"], ["Cost", "$100", "$150"]]
  }
}
\`\`\`

**Process Layouts** (timeline, process-flow):
\`\`\`json
{
  "timeline": [
    {"date": "1754", "title": "Military Career Begins", "description": "Starts his military career during the French and Indian War, demonstrating early leadership skills.", "milestone": false},
    {"date": "1789", "title": "First President of the United States", "description": "Elected as the inaugural President, establishing protocols that would guide future leaders.", "milestone": true}
  ],
  "processSteps": [{"step": 1, "title": "Analyze", "description": "Gather requirements"}]
}
\`\`\`

**Timeline Best Practices:**
- Use specific dates/years for chronological accuracy
- Keep titles concise but descriptive (3-8 words)
- Descriptions should be 10-20 words explaining significance
- Mark major milestones with "milestone": true
- Limit to 4-8 timeline items for optimal visual impact

## OPTIMIZATION CHECKLIST:
Before finalizing layout, verify:
- ✅ Layout matches content complexity and audience needs
- ✅ Visual hierarchy guides eye movement logically
- ✅ Information density is appropriate for comprehension
- ✅ All required fields for chosen layout are populated
- ✅ Content maintains professional quality standards
- ✅ Layout supports accessibility (screen readers, high contrast)

## FINAL OUTPUT:
Return the complete, optimized slide specification with:
1. **Optimal layout** selected based on content analysis
2. **Properly structured data** for the chosen layout
3. **All original content** preserved and enhanced
4. **Professional formatting** that serves the audience

Focus on creating a layout that maximizes comprehension and visual impact for ${input.audience} audience.

## LAYOUT OPTIMIZATION REFLECTION:
${SELF_REFLECTION_PROMPTS.layoutReflection}

## CHAIN-OF-THOUGHT REASONING:
${CHAIN_OF_THOUGHT_TEMPLATES.layoutOptimization}`;
}

/**
 * Step 3: Enhanced context-aware image generation (C-2: Context-Aware Image Prompts)
 * Incorporates theme alignment, emotional psychology, and technical optimization
 */
export function generateImagePrompt(input: GenerationParams, partialSpec: Partial<SlideSpec>): string {
  // Enhanced content analysis with theme integration
  const imageAnalysis = analyzeContentForImagery(partialSpec, input);

  return `## CONTEXT-AWARE IMAGE PROMPT GENERATION TASK
Create a compelling, professional image prompt that perfectly aligns with the slide's message, selected theme, and emotional impact.

## COMPREHENSIVE SLIDE ANALYSIS:
**Title**: ${partialSpec.title}
**Layout**: ${partialSpec.layout}
**Content Type**: ${imageAnalysis.contentType}
**Key Themes**: ${imageAnalysis.themes.join(', ')}
**Selected Theme**: ${input.design?.theme || 'professional'}

## ENHANCED VISUAL STRATEGY CONTEXT:
**Audience**: ${input.audience} - Professional expectations and visual preferences
**Tone**: ${input.tone} - Emotional and stylistic alignment required
**Image Style**: ${input.imageStyle || 'professional'} - Technical approach for generation
**Recommended Concept**: ${imageAnalysis.recommendedConcept}
**Visual Metaphor**: ${imageAnalysis.visualMetaphor}
**Theme Alignment**: ${imageAnalysis.themeAlignment}
**Emotional Tone**: ${imageAnalysis.emotionalTone}
**Technical Specifications**: ${imageAnalysis.technicalSpecs}

## ENHANCED IMAGE PROMPT DEVELOPMENT PROCESS:

### Step 1: Strategic Visual Alignment
- **Core Business Message**: What specific outcome or insight does this slide communicate?
- **Emotional Resonance**: What feeling will drive action (confidence, urgency, excitement, trust)?
- **Visual Metaphor**: What concrete imagery best represents abstract concepts?
- **Brand Alignment**: How formal and professional should the visual tone be?
- **Cultural Sensitivity**: Ensure inclusive, diverse, and globally appropriate imagery

### Step 2: Audience-Optimized Visual Strategy
**For ${input.audience} audience:**
${input.audience === 'executives' ? '- Sophisticated, boardroom-quality imagery conveying success and competence\n- Clean, uncluttered compositions that support quick decision-making\n- Professional environments with subtle luxury indicators\n- Diverse leadership representation and global business contexts' :
  input.audience === 'technical' ? '- Precise, technically accurate imagery with attention to detail\n- Clean, functional aesthetics that support logical thinking\n- Modern technology and innovation themes with authentic feel\n- Systematic visual elements that reflect engineering mindset' :
  input.audience === 'students' ? '- Engaging, relatable imagery that supports learning and growth\n- Bright, optimistic compositions that inspire and motivate\n- Diverse, inclusive representations that reflect modern classrooms\n- Educational metaphors and knowledge-building visual themes' :
  '- Professional yet approachable imagery that builds trust\n- Clear, universally understandable visual concepts\n- Balanced sophistication that appeals to broad audiences\n- Authentic, realistic representations that feel genuine'}

### Step 3: Content-Specific Visual Themes
**Match imagery to content type:**
- **Financial Results**: Professional charts, growth imagery, business success indicators
- **Technical Solutions**: Modern interfaces, clean technology, innovation themes
- **Team Performance**: Diverse collaboration, professional environments, achievement
- **Process Improvements**: Streamlined workflows, efficiency metaphors, optimization
- **Market Expansion**: Global themes, growth trajectories, opportunity landscapes

### Step 3: Technical Image Specifications
**Style Requirements**: ${input.imageStyle || 'professional'}
- **Professional**: Clean, corporate, high-quality photography style
- **Illustration**: Modern, clean vector-style illustrations
- **Abstract**: Conceptual, artistic representations
- **Realistic**: Photorealistic imagery with authentic feel
- **Minimal**: Simple, clean, uncluttered compositions

### Step 4: Image Prompt Quality Standards
**Excellent Image Prompts Include:**
✅ Specific visual elements and composition
✅ Professional quality and lighting specifications
✅ Emotional tone and atmosphere description
✅ Color palette guidance aligned with content
✅ Technical quality specifications (high-resolution, clean)

**EXCELLENT Image Prompt Examples (FOLLOW THESE PATTERNS):**
✅ "Diverse executive team reviewing growth charts on a large monitor in a modern boardroom, natural lighting, professional attire, confident expressions, clean corporate environment, high-resolution photography style" (SPECIFIC: people, action, setting, lighting, style)
✅ "Abstract visualization of upward growth trajectory with clean geometric elements, corporate blue and green gradient, minimalist professional design, high-quality digital illustration" (SPECIFIC: concept, elements, colors, style, quality)
✅ "Modern data dashboard interface displaying key performance metrics, clean typography, professional color scheme, sleek design elements, high-tech corporate atmosphere" (SPECIFIC: interface, content, design, atmosphere)
✅ "Professional handshake between diverse business partners in a bright modern office, symbolizing successful partnership, natural lighting, corporate setting, authentic business photography" (SPECIFIC: action, people, setting, symbolism, style)

**MANDATORY PROMPT ELEMENTS:**
1. **Subject/Action**: What is happening or being shown
2. **Setting/Environment**: Where this takes place
3. **Style/Quality**: Photography, illustration, abstract, etc.
4. **Lighting/Atmosphere**: Professional, natural, clean, modern
5. **Color Guidance**: Corporate colors, professional palette
6. **Composition**: Clean, minimalist, high-resolution

**POOR Image Prompt Examples (NEVER DO THIS):**
❌ "Some people in an office" (too vague, no specific details, unprofessional)
❌ "Colorful chart" (lacks context, professional specifications, no style guidance)
❌ "Business stuff" (meaningless, no visual direction, completely useless)
❌ "Happy workers" (unprofessional tone, no context, too generic)
❌ "Nice picture" (no direction, completely unhelpful)
❌ "Graph showing data" (too basic, no style or quality specifications)

## LAYOUT-SPECIFIC IMAGE PLACEMENT:
Based on layout "${partialSpec.layout}", place image prompt in:
${partialSpec.layout === 'image-right' ? '- "right.imagePrompt" field for right-side placement' :
  partialSpec.layout === 'image-left' ? '- "left.imagePrompt" field for left-side placement' :
  partialSpec.layout === 'image-full' ? '- "imagePrompt" field for full-slide background' :
  '- "imagePrompt" field for general image integration'}

## FINAL OUTPUT REQUIREMENTS (STRICT COMPLIANCE REQUIRED):
Return the COMPLETE slide specification with:
1. **All existing content preserved** - Do not remove any fields from the original specification
2. **Professional image prompt added** - 50-200 characters, specific and actionable
3. **Proper field placement** - Based on layout requirements (imagePrompt, left.imagePrompt, or right.imagePrompt)
4. **Quality validation** - Ensure prompt would generate professional, boardroom-quality imagery
5. **Mandatory elements included** - Subject, setting, style, lighting, and composition details
6. **Professional language only** - No casual or unprofessional terminology

## VALIDATION CHECKLIST (VERIFY BEFORE RESPONDING):
- ✅ Image prompt is 50-200 characters (COUNT THE CHARACTERS)
- ✅ Includes all 6 mandatory elements (subject, setting, style, lighting, color, composition)
- ✅ Uses professional, specific language throughout
- ✅ Aligns with ${input.audience} audience expectations
- ✅ Would generate imagery suitable for Fortune 500 presentations
- ✅ Avoids all patterns shown in "POOR" examples
- ✅ Follows patterns shown in "EXCELLENT" examples
- ✅ JSON structure is complete and valid

Create an image prompt that elevates the slide's professional impact and supports the core message for ${input.audience} audience. NO EXCEPTIONS TO QUALITY STANDARDS.`;
}

/**
 * NEW: Batch image prompt generation for multiple slides
 * Optimizes API calls by generating image prompts for all slides in one request
 */
export function generateBatchImagePrompts(input: GenerationParams, slideSpecs: Partial<SlideSpec>[]): string {
  const slideSummaries = slideSpecs.map((spec, index) =>
    `Slide ${index + 1}: "${spec.title}" (${spec.layout})`
  ).join('\n');

  return `## BATCH IMAGE PROMPT GENERATION TASK
Generate optimized image prompts for ${slideSpecs.length} slides in a cohesive presentation.

## PRESENTATION CONTEXT:
**Topic**: ${input.prompt}
**Audience**: ${input.audience}
**Tone**: ${input.tone}
**Style**: ${input.imageStyle || 'professional'}

## SLIDES TO PROCESS:
${slideSummaries}

## BATCH PROCESSING REQUIREMENTS:
1. **Visual Consistency**: Ensure all images work together as a cohesive presentation
2. **Style Uniformity**: Maintain consistent visual style and quality across all slides
3. **Audience Alignment**: All prompts should resonate with ${input.audience} expectations
4. **Professional Quality**: Each prompt should generate boardroom-quality imagery

## OUTPUT FORMAT:
Return a JSON array with image prompts for each slide:
[
  {
    "slideIndex": 0,
    "title": "slide title",
    "imagePrompt": "specific, professional image prompt (20-200 characters)",
    "placement": "field name for image placement based on layout",
    "reasoning": "brief explanation of visual choice"
  }
]

Generate cohesive, professional image prompts that enhance the overall presentation narrative.`;
}

/**
 * Step 4: Enhanced final refinement prompt with comprehensive quality assurance
 * Incorporates detailed quality assessment and iterative improvement
 */
export function generateRefinementPrompt(input: GenerationParams, partialSpec: Partial<SlideSpec>): string {
  // Quick quality assessment
  const qualityCheck = performQuickQualityCheck(partialSpec, input);

  return `## FINAL QUALITY REFINEMENT TASK
Perform targeted refinement to achieve professional excellence.

## CURRENT SLIDE SPECIFICATION:
**Title**: ${partialSpec.title}
**Layout**: ${partialSpec.layout}
**Content Length**: ${JSON.stringify(partialSpec).length} characters

## QUALITY ASSESSMENT:
**Current Estimated Score**: ${qualityCheck.estimatedScore}/100
**Priority Issues**: ${qualityCheck.issues.join(', ') || 'None identified'}
**Strengths**: ${qualityCheck.strengths.join(', ')}

## TARGET STANDARDS:
**Audience**: ${input.audience} - Must meet professional expectations
**Quality Goal**: 90+ score (A-grade) across all criteria
**Business Context**: Executive-level presentation quality

## COMPREHENSIVE QUALITY ASSESSMENT:

### 1. Content Quality Analysis (30% weight)
**Evaluation Criteria:**
- Title specificity and benefit focus (15-60 characters optimal)
- Content depth matches "${input.contentLength}" specification
- Language level appropriate for ${input.audience} audience
- Key messages are clear, actionable, and compelling
- Logical flow and persuasive structure

**Self-Assessment Questions:**
- Would an executive be proud to present this content?
- Does the title immediately communicate value/outcome?
- Is every word necessary and impactful?
- Does content drive toward a clear action or decision?

### 2. Visual Design & Layout (25% weight)
**Evaluation Criteria:**
- Layout optimally supports content hierarchy
- Information density appropriate for comprehension
- Professional formatting and visual consistency
- Effective use of white space and visual balance
- Layout choice enhances rather than hinders message

**Design Validation:**
- Does layout guide eye movement logically?
- Is information scannable in 5-10 seconds?
- Would this layout work well in both digital and print?

### 3. Audience Alignment (20% weight)
**Evaluation Criteria:**
- Language sophistication matches ${input.audience} expectations
- Tone aligns with "${input.tone}" specification
- Content complexity matches audience needs
- Psychological triggers appropriate for audience motivation
- Professional standards met for business context

**Audience Check:**
- Would ${input.audience} find this compelling and credible?
- Does tone create appropriate emotional response?
- Is complexity level perfectly calibrated?

### 4. Accessibility & Inclusivity (15% weight)
**Evaluation Criteria:**
- Content is screen reader friendly
- Language is inclusive and bias-free
- Visual elements support diverse learning styles
- Information structure aids comprehension
- Professional standards for diverse audiences

### 5. Technical Excellence (10% weight)
**Evaluation Criteria:**
- JSON structure is valid and complete
- All required fields properly populated
- Data structures match layout requirements
- Content length within optimal ranges
- Grammar, spelling, and formatting perfect

## REFINEMENT PROCESS:

### Step 1: Quality Scoring
Rate each criterion (1-100):
- Content Quality: ___/100
- Visual Design: ___/100
- Audience Alignment: ___/100
- Accessibility: ___/100
- Technical Excellence: ___/100

### Step 2: Identify Improvements
For any score below 90, identify specific improvements:
- What exactly needs to be enhanced?
- How can we elevate this to A-grade quality?
- What would make this more compelling/professional?

### Step 3: Apply Refinements
Make targeted improvements while preserving core content:
- Enhance title for maximum impact
- Optimize content for audience and tone
- Ensure perfect technical implementation
- Validate accessibility and inclusivity

## FINAL QUALITY CHECKLIST:
Before outputting, verify:
- ✅ Title is specific, benefit-focused, and compelling
- ✅ Content perfectly matches audience sophistication
- ✅ Tone creates appropriate emotional response
- ✅ Layout optimally supports message hierarchy
- ✅ Information density enables quick comprehension
- ✅ Language is inclusive and professional
- ✅ JSON structure is complete and valid
- ✅ Overall quality would score 90+ (A-grade)

## OUTPUT REQUIREMENTS:
Return the refined slide specification that:
1. **Maintains all core content** while enhancing quality
2. **Achieves A-grade standards** across all criteria
3. **Perfectly serves** the ${input.audience} audience
4. **Creates compelling impact** for business presentations

Focus on elevating this to the quality level expected in Fortune 500 boardrooms.`;
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
 * Comprehensive quality validation system with modern standards
 * Enhanced with detailed criteria for professional presentation excellence
 */
export const QUALITY_VALIDATION_CRITERIA = {
  contentQuality: {
    name: 'Content Quality Assessment',
    weight: 30,
    checks: [
      'Title is specific and benefit-focused (15-60 characters)',
      'Content matches audience sophistication level',
      'Information density is appropriate for comprehension',
      'Key messages are clear and actionable',
      'Content flows logically and persuasively'
    ],
    scoring: {
      excellent: 'Compelling, specific, audience-perfect content',
      good: 'Clear content with minor improvements needed',
      poor: 'Vague, generic, or inappropriate for audience'
    }
  },

  visualDesign: {
    name: 'Visual Design & Layout',
    weight: 25,
    checks: [
      'Layout optimally supports content hierarchy',
      'Visual balance and white space utilization',
      'Professional formatting and consistency',
      'Appropriate information density per slide',
      'Layout matches content complexity'
    ],
    scoring: {
      excellent: 'Perfect layout choice with optimal visual flow',
      good: 'Good layout with minor adjustments needed',
      poor: 'Layout doesn\'t support content or audience needs'
    }
  },

  audienceAlignment: {
    name: 'Audience Alignment',
    weight: 20,
    checks: [
      'Language level matches audience expertise',
      'Tone appropriate for context and audience',
      'Content depth matches audience needs',
      'Psychological triggers align with audience motivation',
      'Professional standards met for audience type'
    ],
    scoring: {
      excellent: 'Perfect audience targeting and alignment',
      good: 'Good alignment with minor tone adjustments',
      poor: 'Misaligned with audience needs or expectations'
    }
  },

  accessibility: {
    name: 'Accessibility & Inclusivity',
    weight: 15,
    checks: [
      'Content is screen reader friendly',
      'Language is inclusive and bias-free',
      'Visual elements support diverse learning styles',
      'Information is scannable and digestible',
      'Professional standards for diverse audiences'
    ],
    scoring: {
      excellent: 'Fully accessible and inclusive design',
      good: 'Good accessibility with minor improvements',
      poor: 'Accessibility barriers or exclusive language'
    }
  },

  technicalExcellence: {
    name: 'Technical Quality',
    weight: 10,
    checks: [
      'JSON structure is valid and complete',
      'All required fields are properly populated',
      'Data structures match layout requirements',
      'Content length within optimal ranges',
      'Professional grammar and formatting'
    ],
    scoring: {
      excellent: 'Perfect technical implementation',
      good: 'Good technical quality with minor issues',
      poor: 'Technical errors or incomplete structure'
    }
  }
};

/**
 * Enhanced validation prompt with comprehensive scoring and actionable feedback
 * Provides detailed quality assessment with specific improvement recommendations
 */
export const VALIDATION_PROMPT = `## COMPREHENSIVE SLIDE QUALITY ASSESSMENT

## SLIDE TO EVALUATE:
[Insert JSON]

## ASSESSMENT FRAMEWORK:
Use the comprehensive quality criteria to evaluate this slide across five key dimensions:

### 1. Content Quality (30% weight)
**Scoring Criteria:**
- Title specificity and impact (15-60 characters optimal)
- Content clarity and actionability
- Audience-appropriate language level
- Logical flow and persuasive structure
- Professional messaging standards

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

### 2. Visual Design & Layout (25% weight)
**Scoring Criteria:**
- Layout supports content hierarchy
- Information density appropriate for comprehension
- Professional formatting consistency
- Effective visual balance
- Layout enhances message delivery

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

### 3. Audience Alignment (20% weight)
**Scoring Criteria:**
- Language sophistication matches audience
- Tone creates appropriate emotional response
- Content complexity calibrated correctly
- Psychological triggers align with motivation
- Professional standards for business context

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

### 4. Accessibility & Inclusivity (15% weight)
**Scoring Criteria:**
- Screen reader friendly structure
- Inclusive, bias-free language
- Supports diverse learning styles
- Scannable information architecture
- Professional diversity standards

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

### 5. Technical Excellence (10% weight)
**Scoring Criteria:**
- Valid JSON structure
- Complete field population
- Proper data structures for layout
- Optimal content length ranges
- Perfect grammar and formatting

**Score: ___/100**
**Assessment:** [Excellent/Good/Poor]
**Specific Issues:** [List any problems]
**Improvements:** [Specific actionable recommendations]

## OUTPUT FORMAT:
Return a JSON object with this exact structure:
\`\`\`json
{
  "overallScore": 85,
  "grade": "B",
  "categoryScores": {
    "contentQuality": 90,
    "visualDesign": 85,
    "audienceAlignment": 80,
    "accessibility": 90,
    "technicalExcellence": 95
  },
  "strengths": [
    "Specific strength 1",
    "Specific strength 2"
  ],
  "improvements": [
    "Priority improvement 1 with specific action",
    "Priority improvement 2 with specific action"
  ],
  "quickFixes": [
    "Easy fix 1",
    "Easy fix 2"
  ],
  "recommendations": [
    "Strategic recommendation 1",
    "Strategic recommendation 2"
  ],
  "readyForPresentation": true/false
}
\`\`\`

Focus on providing actionable, specific feedback that would help create A-grade (90+) presentation content.`;

export const QUALITY_ASSESSMENT_PROMPT = VALIDATION_PROMPT;

/**
 * Few-shot examples for high-quality slide generation
 * Provides concrete examples of excellent vs. poor slide content
 */
export const FEW_SHOT_EXAMPLES = {
  excellentSlides: [
    {
      context: "Quarterly business results for executives",
      input: "Q4 revenue growth and performance metrics",
      output: {
        title: "Q4 Revenue: 34% Growth Drives Record $2.1M Quarter",
        layout: "title-bullets",
        bullets: [
          "Revenue increased 34% YoY, exceeding targets by $400K",
          "Customer acquisition cost reduced 28% through digital optimization",
          "Net promoter score improved to 72 (industry average: 45)",
          "Market expansion into 3 regions generated $600K new revenue"
        ],
        notes: "Emphasize the 34% growth first, then dive into the key drivers. Pause after each metric to let it sink in.",
        sources: ["Q4 Financial Report", "Customer Survey Data"]
      },
      qualityScore: 95,
      whyExcellent: "Specific metrics, clear benefits, executive-appropriate language, actionable insights"
    },
    {
      context: "Technical presentation for developers",
      input: "New API architecture benefits",
      output: {
        title: "New API Architecture: 60% Faster Response, 99.9% Uptime",
        layout: "title-bullets",
        bullets: [
          "Response time reduced from 200ms to 80ms average",
          "Horizontal scaling supports 10x traffic with zero downtime",
          "GraphQL implementation reduces data transfer by 45%",
          "Automated testing coverage increased to 95% with CI/CD pipeline"
        ],
        notes: "Focus on performance metrics first, then scalability benefits. Technical audience will appreciate specific numbers.",
        sources: ["Performance Testing Results", "Architecture Documentation"]
      },
      qualityScore: 92,
      whyExcellent: "Technical precision, quantified benefits, developer-focused language, concrete improvements"
    }
  ],

  poorSlides: [
    {
      context: "Business results presentation",
      input: "Q4 results",
      output: {
        title: "Q4 Results",
        layout: "title-bullets",
        bullets: [
          "We did well this quarter",
          "Revenue was good",
          "Customers are happy",
          "Things are improving"
        ],
        notes: "Talk about the results",
        sources: []
      },
      qualityScore: 25,
      whyPoor: "Vague title, no specific metrics, meaningless bullets, unprofessional language"
    }
  ]
};

/**
 * Self-reflection prompts for quality improvement
 * Guides AI to assess and improve its own outputs
 */
export const SELF_REFLECTION_PROMPTS = {
  contentReflection: `
## SELF-REFLECTION CHECKPOINT
Before finalizing your response, ask yourself:

**Content Quality Check:**
1. Is my title specific enough that someone could understand the key benefit in 5 seconds?
2. Would a busy executive find every bullet point valuable and actionable?
3. Does each piece of content drive toward a clear decision or action?
4. Am I using the most impactful words possible for this audience?

**Professional Standards Check:**
5. Would I be proud to present this content to Fortune 500 executives?
6. Does this content demonstrate clear expertise and authority?
7. Is the language level perfectly calibrated for the target audience?
8. Would this slide stand out positively in a high-stakes presentation?

**Technical Excellence Check:**
9. Is my JSON structure complete and valid?
10. Have I included all required fields for the chosen layout?
11. Are my content lengths within optimal ranges?
12. Is my formatting consistent and professional?

If you answered "no" to any question, revise before responding.
`,

  layoutReflection: `
## LAYOUT OPTIMIZATION REFLECTION
Before selecting a layout, consider:

**Visual Hierarchy Assessment:**
1. Does this layout guide the eye to the most important information first?
2. Will the audience be able to scan and understand this in 10 seconds?
3. Does the layout choice enhance or hinder the message?
4. Is the information density appropriate for the audience and context?

**Audience Experience Check:**
5. Would this layout work well for both in-person and virtual presentations?
6. Does the visual structure match how this audience prefers to process information?
7. Is there enough white space for professional appearance?
8. Would this layout reproduce well in both digital and print formats?

Revise layout choice if needed to optimize for audience comprehension and professional impact.
`,

  imageReflection: `
## IMAGE PROMPT QUALITY REFLECTION
Before finalizing image prompts, evaluate:

**Professional Impact Assessment:**
1. Would this image elevate the slide's professional credibility?
2. Does the image concept align with the content's emotional goal?
3. Is the prompt specific enough to generate consistent, high-quality results?
4. Would this image be appropriate for the target audience and business context?

**Technical Quality Check:**
5. Is my prompt 20-200 characters with specific visual details?
6. Have I included style, lighting, and composition guidance?
7. Does the prompt avoid potential copyright or sensitivity issues?
8. Will this generate imagery suitable for professional presentations?

Refine the image prompt if any aspect needs improvement.
`
};

/**
 * Chain-of-thought reasoning templates
 * Provides structured thinking frameworks for complex decisions
 */
export const CHAIN_OF_THOUGHT_TEMPLATES = {
  contentGeneration: `
## CHAIN-OF-THOUGHT REASONING FOR CONTENT GENERATION

**Step 1: Core Message Identification**
- What is the single most important takeaway?
- What decision or action should result from this slide?
- What emotional response do we want to create?

**Step 2: Audience Psychology Analysis**
- What motivates this specific audience?
- What language level and tone will resonate?
- What evidence or proof points will they find compelling?

**Step 3: Information Architecture**
- What's the logical flow from problem to solution to benefit?
- How can we structure information for maximum comprehension?
- What level of detail serves the audience best?

**Step 4: Professional Polish**
- How can we make every word count?
- What specific metrics or outcomes can we highlight?
- How do we ensure executive-level quality?

**Step 5: Quality Validation**
- Does this meet A-grade standards (90+ score)?
- Would I be proud to present this to important stakeholders?
- Is this the best possible version of this content?
`,

  layoutOptimization: `
## CHAIN-OF-THOUGHT REASONING FOR LAYOUT SELECTION

**Step 1: Content Analysis**
- What type of information am I presenting? (narrative, data, comparison, process)
- How complex is the information? (simple concept vs. detailed analysis)
- What's the primary vs. secondary information hierarchy?

**Step 2: Audience Processing Preferences**
- How does this audience typically consume information?
- Do they prefer visual, textual, or mixed content formats?
- What's their attention span and cognitive load capacity?

**Step 3: Layout Effectiveness Evaluation**
- Which layout best supports the information hierarchy?
- What layout enables fastest comprehension?
- Which choice creates the most professional impact?

**Step 4: Technical Implementation**
- Do I have the right data structures for this layout?
- Are all required fields properly populated?
- Does the layout choice align with content complexity?

**Step 5: Final Optimization**
- Does this layout serve the audience's needs optimally?
- Would this choice enhance or hinder the presentation flow?
- Is this the most professional and effective option?
`
};

/**
 * Enhanced Slide Generation Prompts for New Layout Engine
 *
 * Content-aware prompts that generate structured JSON matching our slide generators.
 * Each prompt enforces constraints and returns properly formatted slide configurations.
 */

/**
 * Enhanced system prompt for structured slide generation
 */
export const ENHANCED_SYSTEM_PROMPT = `You are an elite PowerPoint presentation architect specializing in creating professional, high-impact slides using a modern layout engine. You generate structured JSON configurations that produce visually stunning, accessible presentations.

## YOUR EXPERTISE:
- **Strategic Content**: Crafting persuasive, outcome-driven messaging
- **Layout Mastery**: Selecting optimal layouts for maximum impact
- **Typography Excellence**: Establishing clear visual hierarchy
- **Data Storytelling**: Transforming complex information into compelling narratives
- **Accessibility**: Ensuring WCAG 2.1 AA compliance

## SLIDE TYPES YOU MASTER:
1. **Title Slides**: Hero presentations with strong visual impact
2. **Bullet Slides**: Structured information with optimal readability (3-6 bullets max)
3. **Two-Column**: Balanced comparisons and complementary content
4. **Metrics**: Data-driven dashboards with key performance indicators
5. **Section**: Transition slides for narrative flow
6. **Quote**: Impactful statements with attribution
7. **Timeline**: Process flows and chronological information

## CONTENT CONSTRAINTS (NEVER VIOLATE):
- **Bullet Points**: 3-6 bullets maximum, 12-14 words per bullet
- **Titles**: 40-80 characters for optimal impact
- **Subtitles**: 20-60 characters for clarity
- **Descriptions**: 100-200 words maximum
- **Metrics**: Clear value + label + optional trend

## OUTPUT REQUIREMENTS:
- **Format**: Valid JSON only, matching exact schema
- **Quality**: Professional, boardroom-ready content
- **Accessibility**: High contrast, clear hierarchy
- **Consistency**: Maintain tone and style throughout

You must respond with properly structured JSON that matches the requested slide type schema exactly.`;

/**
 * Generate content-aware prompt for specific slide types
 */
export function generateSlidePrompt(
  slideType: string,
  topic: string,
  audience: keyof typeof AUDIENCE_GUIDANCE = 'general',
  contentLength: keyof typeof CONTENT_LENGTH_SPECS = 'moderate',
  additionalContext?: string
): string {
  const audienceGuide = AUDIENCE_GUIDANCE[audience];
  const lengthSpec = CONTENT_LENGTH_SPECS[contentLength];

  const basePrompt = `${ENHANCED_SYSTEM_PROMPT}

## CURRENT TASK:
Create a ${slideType} slide about: "${topic}"

## AUDIENCE CONTEXT:
- **Type**: ${audience}
- **Language**: ${audienceGuide.language}
- **Focus**: ${audienceGuide.focus}
- **Tone**: ${audienceGuide.tone}
- **Psychology**: ${audienceGuide.psychology}
- **Structure**: ${audienceGuide.structure}

## CONTENT LENGTH:
- **Level**: ${contentLength}
- **Description**: ${lengthSpec.description}
- **Guidance**: ${lengthSpec.contentGuidance}
- **Strategy**: ${lengthSpec.strategy}

${additionalContext ? `## ADDITIONAL CONTEXT:\n${additionalContext}` : ''}

## SLIDE TYPE SPECIFICATIONS:`;

  switch (slideType) {
    case 'title':
      return `${basePrompt}

**Title Slide Requirements:**
- Main title: Compelling, specific, outcome-focused (40-80 chars)
- Subtitle: Supporting context or value proposition (20-60 chars)
- Author: Optional presenter information
- Date: Optional presentation date
- Organization: Optional company/department

**JSON Schema:**
{
  "type": "title",
  "title": "string (required)",
  "subtitle": "string (optional)",
  "author": "string (optional)",
  "date": "string (optional)",
  "organization": "string (optional)"
}

Generate a professional title slide configuration in JSON format:`;

    case 'bullets':
      return `${basePrompt}

**Bullet Slide Requirements:**
- Title: Clear, descriptive heading (40-80 chars)
- Subtitle: Optional supporting context (20-60 chars)
- Bullets: 3-6 bullet points, 12-14 words each
- Each bullet: Start with action verb, no terminal periods
- Consistent tense and parallel structure

**JSON Schema:**
{
  "type": "bullets",
  "title": "string (required)",
  "subtitle": "string (optional)",
  "bullets": ["string", "string", ...] (3-6 items),
  "bulletStyle": "disc|circle|square|dash|arrow|number (optional)"
}

Generate a professional bullet slide configuration in JSON format:`;

    case 'twoColumn':
      return `${basePrompt}

**Two-Column Slide Requirements:**
- Title: Clear, descriptive heading (40-80 chars)
- Subtitle: Optional supporting context (20-60 chars)
- Left Column: Text, image, or mixed content
- Right Column: Text, image, or mixed content
- Balanced content distribution

**JSON Schema:**
{
  "type": "twoColumn",
  "title": "string (required)",
  "subtitle": "string (optional)",
  "leftColumn": {
    "type": "text|image|mixed",
    "content": "string (if text)",
    "bullets": ["string", ...] (optional),
    "src": "string (if image)",
    "alt": "string (if image)",
    "caption": "string (optional)"
  },
  "rightColumn": {
    "type": "text|image|mixed",
    "content": "string (if text)",
    "bullets": ["string", ...] (optional),
    "src": "string (if image)",
    "alt": "string (if image)",
    "caption": "string (optional)"
  },
  "columnRatio": [number, number] (optional, default [1,1])
}

Generate a professional two-column slide configuration in JSON format:`;

    case 'metrics':
      return `${basePrompt}

**Metrics Slide Requirements:**
- Title: Clear, descriptive heading (40-80 chars)
- Subtitle: Optional context or time period (20-60 chars)
- Metrics: 2-8 key performance indicators
- Each metric: value + label + optional description/trend
- Layout: grid, row, column, or featured

**JSON Schema:**
{
  "type": "metrics",
  "title": "string (required)",
  "subtitle": "string (optional)",
  "metrics": [
    {
      "value": "string|number (required)",
      "label": "string (required)",
      "description": "string (optional)",
      "trend": {
        "direction": "up|down|flat",
        "percentage": number,
        "period": "string"
      } (optional),
      "color": "primary|success|warning|error|info (optional)"
    }
  ],
  "layout": "grid|row|column|featured (optional)",
  "maxPerRow": number (optional),
  "showTrends": boolean (optional),
  "showTargets": boolean (optional)
}

Generate a professional metrics slide configuration in JSON format:`;

    default:
      return `${basePrompt}

**Generic Slide Requirements:**
- Title: Clear, descriptive heading
- Content: Appropriate for slide type
- Professional formatting and structure

Generate a professional slide configuration in JSON format for type: ${slideType}`;
  }
}

/**
 * Validate and optimize bullet points according to best practices
 */
export function optimizeBulletPoints(bullets: string[]): {
  optimized: string[];
  warnings: string[];
} {
  const warnings: string[] = [];
  let optimized = [...bullets];

  // Limit to 6 bullets maximum
  if (optimized.length > 6) {
    warnings.push(`Reduced ${optimized.length} bullets to 6 for optimal readability`);
    optimized = optimized.slice(0, 6);
  }

  // Ensure minimum of 3 bullets
  if (optimized.length < 3) {
    warnings.push('Consider adding more bullet points for better content balance');
  }

  // Optimize each bullet
  optimized = optimized.map((bullet, index) => {
    let optimizedBullet = bullet.trim();

    // Check word count (12-14 words recommended)
    const wordCount = optimizedBullet.split(/\s+/).length;
    if (wordCount > 14) {
      warnings.push(`Bullet ${index + 1} has ${wordCount} words (recommended: ≤14)`);
    }

    // Remove terminal periods for consistency
    if (optimizedBullet.endsWith('.') && !optimizedBullet.endsWith('...')) {
      optimizedBullet = optimizedBullet.slice(0, -1);
    }

    // Capitalize first letter
    if (optimizedBullet.length > 0) {
      optimizedBullet = optimizedBullet.charAt(0).toUpperCase() + optimizedBullet.slice(1);
    }

    // Check for action verbs (basic check)
    const actionVerbs = ['achieve', 'analyze', 'build', 'create', 'deliver', 'develop', 'drive', 'enhance', 'establish', 'execute', 'generate', 'implement', 'improve', 'increase', 'launch', 'optimize', 'reduce', 'streamline', 'transform'];
    const firstWord = optimizedBullet.split(' ')[0].toLowerCase();

    if (!actionVerbs.some(verb => firstWord.includes(verb))) {
      // This is just a warning, not a fix
      warnings.push(`Bullet ${index + 1} could start with a stronger action verb`);
    }

    return optimizedBullet;
  });

  return { optimized, warnings };
}

/**
 * Generate multi-slide prompt for complex topics
 */
export function generateMultiSlidePrompt(
  topic: string,
  slideCount: number,
  audience: keyof typeof AUDIENCE_GUIDANCE = 'general',
  contentLength: keyof typeof CONTENT_LENGTH_SPECS = 'moderate'
): string {
  const audienceGuide = AUDIENCE_GUIDANCE[audience];
  const lengthSpec = CONTENT_LENGTH_SPECS[contentLength];

  return `${ENHANCED_SYSTEM_PROMPT}

## MULTI-SLIDE PRESENTATION TASK:
Create a ${slideCount}-slide presentation about: "${topic}"

## AUDIENCE CONTEXT:
- **Type**: ${audience}
- **Language**: ${audienceGuide.language}
- **Focus**: ${audienceGuide.focus}
- **Tone**: ${audienceGuide.tone}
- **Structure**: ${audienceGuide.structure}

## CONTENT SPECIFICATIONS:
- **Length**: ${contentLength} (${lengthSpec.description})
- **Strategy**: ${lengthSpec.strategy}
- **Guidance**: ${lengthSpec.contentGuidance}

## SLIDE FLOW REQUIREMENTS:
1. **Opening**: Strong title slide with clear value proposition
2. **Body**: ${slideCount - 2} content slides with logical progression
3. **Closing**: Summary or call-to-action slide

## NARRATIVE STRUCTURE:
- **Hook**: Compelling opening that captures attention
- **Context**: Background information and problem statement
- **Solution**: Your main content and recommendations
- **Impact**: Benefits, outcomes, and next steps

## JSON SCHEMA:
{
  "slides": [
    {
      "type": "title|bullets|twoColumn|metrics|section|quote",
      // ... slide-specific configuration
    }
  ],
  "theme": "neutral|executive|colorPop",
  "metadata": {
    "title": "string",
    "description": "string",
    "audience": "${audience}",
    "duration": "number (minutes)"
  }
}

Generate a complete ${slideCount}-slide presentation configuration in JSON format:`;
}

/**
 * Content quality validation prompts
 */
export const VALIDATION_PROMPTS = {
  contentQuality: `
Evaluate this slide content for professional quality:

## EVALUATION CRITERIA:
1. **Clarity**: Is the message clear and unambiguous?
2. **Impact**: Does it drive toward a specific outcome?
3. **Specificity**: Are claims supported with concrete details?
4. **Professionalism**: Is it boardroom-ready?
5. **Accessibility**: Is it inclusive and easy to understand?

## SCORING (0-100):
- 90-100: Exceptional, Fortune 500 quality
- 80-89: Professional, minor improvements needed
- 70-79: Good, some enhancements required
- 60-69: Adequate, significant improvements needed
- Below 60: Requires major revision

Provide score and specific improvement recommendations.`,

  accessibilityCheck: `
Review this slide for accessibility compliance:

## ACCESSIBILITY CHECKLIST:
1. **Color Contrast**: Sufficient contrast ratios (4.5:1 minimum)
2. **Font Sizes**: Minimum 12pt for body text, 18pt for headings
3. **Language**: Clear, jargon-free communication
4. **Structure**: Logical reading order and hierarchy
5. **Alt Text**: Descriptive text for images and graphics

## WCAG 2.1 COMPLIANCE:
- Level AA requirements (business standard)
- Screen reader compatibility
- Keyboard navigation support

Identify any accessibility issues and provide remediation suggestions.`,

  brandConsistency: `
Verify brand consistency across slide elements:

## BRAND ELEMENTS:
1. **Typography**: Consistent font usage and hierarchy
2. **Colors**: Adherence to brand color palette
3. **Tone**: Consistent voice and messaging style
4. **Layout**: Uniform spacing and alignment
5. **Imagery**: Brand-appropriate visual style

Ensure all elements align with professional presentation standards.`
};