/**
 * Enhanced Storytelling Frameworks
 * 
 * Advanced narrative structures and storytelling patterns for creating
 * compelling presentations that resonate with different audiences.
 * 
 * Features:
 * - Multiple proven storytelling frameworks
 * - Audience-specific narrative patterns
 * - Dynamic story arc generation
 * - Emotional engagement optimization
 * - Cultural and industry adaptations
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { GenerationParams } from '../schema';
import { ContentAnalysis } from './aiOrchestrator';

/**
 * Storytelling framework interface
 */
export interface StorytellingFramework {
  id: string;
  name: string;
  description: string;
  structure: StoryElement[];
  bestFor: string[];
  emotionalArc: EmotionalPoint[];
  adaptations: {
    [audience: string]: FrameworkAdaptation;
  };
}

/**
 * Story element in a framework
 */
export interface StoryElement {
  id: string;
  name: string;
  purpose: string;
  guidelines: string[];
  examples: string[];
  duration: number; // Relative weight (1-10)
  emotionalTone: 'tension' | 'relief' | 'excitement' | 'curiosity' | 'satisfaction';
}

/**
 * Emotional point in story arc
 */
export interface EmotionalPoint {
  position: number; // 0-1 through the story
  intensity: number; // 0-1 emotional intensity
  emotion: 'anticipation' | 'tension' | 'relief' | 'excitement' | 'satisfaction' | 'curiosity';
  description: string;
}

/**
 * Framework adaptation for specific audiences
 */
export interface FrameworkAdaptation {
  modifications: string[];
  emphasis: string[];
  examples: string[];
  culturalNotes?: string[];
}

/**
 * Story generation context
 */
export interface StoryContext {
  userInput: GenerationParams;
  contentAnalysis: ContentAnalysis;
  targetFramework: StorytellingFramework;
  customizations: {
    industryFocus?: string;
    culturalContext?: string;
    timeConstraints?: number;
    emotionalGoal?: string;
  };
}

/**
 * Enhanced storytelling frameworks collection
 */
export const STORYTELLING_FRAMEWORKS: Record<string, StorytellingFramework> = {
  problemSolution: {
    id: 'problem-solution',
    name: 'Problem-Solution Framework',
    description: 'Classic structure that identifies a problem and presents a compelling solution',
    structure: [
      {
        id: 'problem-setup',
        name: 'Problem Setup',
        purpose: 'Establish the challenge or pain point',
        guidelines: [
          'Make the problem relatable and urgent',
          'Use specific examples and data',
          'Connect emotionally with the audience'
        ],
        examples: [
          'Our customers are losing 30% of potential sales due to slow checkout processes',
          'Healthcare workers spend 40% of their time on administrative tasks instead of patient care'
        ],
        duration: 3,
        emotionalTone: 'tension'
      },
      {
        id: 'impact-amplification',
        name: 'Impact Amplification',
        purpose: 'Demonstrate the cost of inaction',
        guidelines: [
          'Quantify the impact with metrics',
          'Show broader implications',
          'Create urgency for action'
        ],
        examples: [
          'This inefficiency costs the industry $2.3B annually',
          'Without intervention, patient satisfaction scores will continue declining'
        ],
        duration: 2,
        emotionalTone: 'tension'
      },
      {
        id: 'solution-introduction',
        name: 'Solution Introduction',
        purpose: 'Present the proposed solution',
        guidelines: [
          'Position as the logical answer',
          'Highlight key differentiators',
          'Build confidence in the approach'
        ],
        examples: [
          'Our AI-powered checkout system reduces transaction time by 60%',
          'Automated documentation frees up 25 hours per week for patient care'
        ],
        duration: 4,
        emotionalTone: 'relief'
      },
      {
        id: 'benefits-proof',
        name: 'Benefits & Proof',
        purpose: 'Demonstrate value and credibility',
        guidelines: [
          'Provide concrete evidence',
          'Include testimonials or case studies',
          'Address potential objections'
        ],
        examples: [
          'Beta customers saw 45% increase in conversion rates',
          'Pilot hospitals reported 90% staff satisfaction improvement'
        ],
        duration: 3,
        emotionalTone: 'satisfaction'
      }
    ],
    bestFor: ['business', 'sales', 'product launches', 'consulting'],
    emotionalArc: [
      { position: 0, intensity: 0.3, emotion: 'curiosity', description: 'Initial engagement' },
      { position: 0.25, intensity: 0.7, emotion: 'tension', description: 'Problem awareness' },
      { position: 0.5, intensity: 0.9, emotion: 'tension', description: 'Peak concern' },
      { position: 0.75, intensity: 0.6, emotion: 'relief', description: 'Solution clarity' },
      { position: 1, intensity: 0.8, emotion: 'satisfaction', description: 'Confident resolution' }
    ],
    adaptations: {
      executives: {
        modifications: [
          'Focus on strategic impact and ROI',
          'Use high-level metrics and market data',
          'Emphasize competitive advantage'
        ],
        emphasis: ['business impact', 'strategic alignment', 'market opportunity'],
        examples: [
          'Market disruption threatens our 15% market share',
          'This solution positions us as the industry leader'
        ]
      },
      technical: {
        modifications: [
          'Include technical details and architecture',
          'Address implementation challenges',
          'Provide performance benchmarks'
        ],
        emphasis: ['technical feasibility', 'scalability', 'integration'],
        examples: [
          'Current API response times exceed 2 seconds',
          'Our microservices architecture reduces latency by 75%'
        ]
      }
    }
  },

  heroJourney: {
    id: 'hero-journey',
    name: 'Hero\'s Journey Framework',
    description: 'Narrative structure that follows a protagonist through transformation',
    structure: [
      {
        id: 'ordinary-world',
        name: 'Ordinary World',
        purpose: 'Establish the current state and status quo',
        guidelines: [
          'Paint a picture of the current situation',
          'Make it relatable to the audience',
          'Set up the need for change'
        ],
        examples: [
          'Like many companies, we were struggling with manual processes',
          'Our team was working harder but not smarter'
        ],
        duration: 2,
        emotionalTone: 'curiosity'
      },
      {
        id: 'call-to-adventure',
        name: 'Call to Adventure',
        purpose: 'Introduce the catalyst for change',
        guidelines: [
          'Present the opportunity or challenge',
          'Create excitement about possibilities',
          'Establish stakes and urgency'
        ],
        examples: [
          'The market demanded faster delivery times',
          'We saw an opportunity to revolutionize customer experience'
        ],
        duration: 2,
        emotionalTone: 'excitement'
      },
      {
        id: 'journey-trials',
        name: 'Journey & Trials',
        purpose: 'Show the transformation process',
        guidelines: [
          'Acknowledge challenges and obstacles',
          'Demonstrate learning and growth',
          'Build credibility through struggle'
        ],
        examples: [
          'We tested 12 different approaches before finding the right one',
          'Each failure taught us something valuable'
        ],
        duration: 4,
        emotionalTone: 'tension'
      },
      {
        id: 'transformation',
        name: 'Transformation',
        purpose: 'Reveal the successful outcome',
        guidelines: [
          'Show the dramatic improvement',
          'Quantify the transformation',
          'Celebrate the achievement'
        ],
        examples: [
          'We reduced processing time from days to minutes',
          'Customer satisfaction scores increased by 40%'
        ],
        duration: 4,
        emotionalTone: 'satisfaction'
      }
    ],
    bestFor: ['transformation stories', 'case studies', 'company culture', 'innovation'],
    emotionalArc: [
      { position: 0, intensity: 0.4, emotion: 'curiosity', description: 'Setting the scene' },
      { position: 0.2, intensity: 0.6, emotion: 'excitement', description: 'Adventure begins' },
      { position: 0.5, intensity: 0.8, emotion: 'tension', description: 'Facing challenges' },
      { position: 0.8, intensity: 0.9, emotion: 'anticipation', description: 'Breakthrough moment' },
      { position: 1, intensity: 0.9, emotion: 'satisfaction', description: 'Triumphant conclusion' }
    ],
    adaptations: {
      executives: {
        modifications: [
          'Focus on strategic transformation',
          'Emphasize competitive advantage gained',
          'Highlight leadership decisions'
        ],
        emphasis: ['strategic vision', 'market positioning', 'organizational change'],
        examples: [
          'Our leadership team recognized the need for digital transformation',
          'This journey positioned us as the market innovator'
        ]
      },
      employees: {
        modifications: [
          'Emphasize team collaboration',
          'Highlight individual contributions',
          'Focus on skill development'
        ],
        emphasis: ['team growth', 'skill building', 'collaboration'],
        examples: [
          'Every team member contributed unique expertise',
          'We grew stronger as a unified team'
        ]
      }
    }
  },

  beforeAfter: {
    id: 'before-after',
    name: 'Before & After Framework',
    description: 'Powerful contrast structure showing transformation',
    structure: [
      {
        id: 'before-state',
        name: 'Before State',
        purpose: 'Establish the problematic starting point',
        guidelines: [
          'Paint a vivid picture of the old way',
          'Use specific metrics and examples',
          'Make pain points tangible'
        ],
        examples: [
          'Manual data entry took 8 hours per day',
          'Customer complaints averaged 50 per week'
        ],
        duration: 4,
        emotionalTone: 'tension'
      },
      {
        id: 'transition-moment',
        name: 'Transition Moment',
        purpose: 'Show the catalyst for change',
        guidelines: [
          'Identify the turning point',
          'Explain the decision to change',
          'Build anticipation for results'
        ],
        examples: [
          'We implemented the new automation system',
          'The team adopted the new methodology'
        ],
        duration: 2,
        emotionalTone: 'excitement'
      },
      {
        id: 'after-state',
        name: 'After State',
        purpose: 'Reveal the transformed outcome',
        guidelines: [
          'Show dramatic improvement',
          'Use parallel metrics to before state',
          'Celebrate the transformation'
        ],
        examples: [
          'Data processing now takes 30 minutes',
          'Customer complaints dropped to 5 per week'
        ],
        duration: 4,
        emotionalTone: 'satisfaction'
      }
    ],
    bestFor: ['case studies', 'product demos', 'process improvements', 'results presentations'],
    emotionalArc: [
      { position: 0, intensity: 0.3, emotion: 'curiosity', description: 'Initial state' },
      { position: 0.4, intensity: 0.7, emotion: 'tension', description: 'Problem awareness' },
      { position: 0.6, intensity: 0.5, emotion: 'anticipation', description: 'Change begins' },
      { position: 1, intensity: 0.9, emotion: 'satisfaction', description: 'Transformation complete' }
    ],
    adaptations: {
      technical: {
        modifications: [
          'Include technical specifications',
          'Show performance benchmarks',
          'Detail implementation process'
        ],
        emphasis: ['performance metrics', 'technical improvements', 'system efficiency'],
        examples: [
          'API response time: 2.3s → 0.2s',
          'Database queries: 1000ms → 50ms'
        ]
      },
      business: {
        modifications: [
          'Focus on business impact',
          'Highlight ROI and cost savings',
          'Emphasize competitive advantage'
        ],
        emphasis: ['business value', 'cost reduction', 'revenue impact'],
        examples: [
          'Operating costs: $100K/month → $30K/month',
          'Revenue per customer: $500 → $750'
        ]
      }
    }
  }
};

/**
 * Select optimal storytelling framework based on content and context
 */
export function selectOptimalFramework(
  params: GenerationParams,
  analysis: ContentAnalysis
): StorytellingFramework {
  const prompt = params.prompt.toLowerCase();
  
  // Analyze content for framework indicators
  if (prompt.includes('problem') || prompt.includes('challenge') || prompt.includes('solution')) {
    return STORYTELLING_FRAMEWORKS.problemSolution;
  }
  
  if (prompt.includes('transformation') || prompt.includes('journey') || prompt.includes('change')) {
    return STORYTELLING_FRAMEWORKS.heroJourney;
  }
  
  if (prompt.includes('before') || prompt.includes('after') || prompt.includes('improvement')) {
    return STORYTELLING_FRAMEWORKS.beforeAfter;
  }
  
  // Default based on audience and content type
  if (params.audience === 'executives' || analysis.category === 'business') {
    return STORYTELLING_FRAMEWORKS.problemSolution;
  }
  
  if (analysis.category === 'technical') {
    return STORYTELLING_FRAMEWORKS.beforeAfter;
  }
  
  // Default fallback
  return STORYTELLING_FRAMEWORKS.problemSolution;
}

/**
 * Generate story structure based on framework and context
 */
export function generateStoryStructure(
  framework: StorytellingFramework,
  context: StoryContext
): StoryElement[] {
  const adaptation = framework.adaptations[context.userInput.audience];
  
  if (!adaptation) {
    return framework.structure;
  }
  
  // Apply audience-specific adaptations
  return framework.structure.map(element => ({
    ...element,
    guidelines: [
      ...element.guidelines,
      ...adaptation.modifications.filter(mod => 
        mod.toLowerCase().includes(element.name.toLowerCase())
      )
    ],
    examples: [
      ...element.examples,
      ...adaptation.examples.filter(ex => 
        ex.toLowerCase().includes(element.name.toLowerCase())
      )
    ]
  }));
}

/**
 * Calculate emotional engagement score for a story structure
 */
export function calculateEngagementScore(
  framework: StorytellingFramework,
  audience: string
): number {
  const adaptation = framework.adaptations[audience];
  let baseScore = 0.7; // Base engagement score
  
  // Boost score if framework has audience-specific adaptations
  if (adaptation) {
    baseScore += 0.2;
  }
  
  // Analyze emotional arc complexity
  const arcVariation = calculateEmotionalVariation(framework.emotionalArc);
  baseScore += arcVariation * 0.1;
  
  return Math.min(baseScore, 1.0);
}

/**
 * Calculate emotional variation in the story arc
 */
function calculateEmotionalVariation(arc: EmotionalPoint[]): number {
  if (arc.length < 2) return 0;
  
  let totalVariation = 0;
  for (let i = 1; i < arc.length; i++) {
    totalVariation += Math.abs(arc[i].intensity - arc[i-1].intensity);
  }
  
  return totalVariation / (arc.length - 1);
}
