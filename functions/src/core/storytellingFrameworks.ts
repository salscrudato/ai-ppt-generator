/**
 * Enhanced Storytelling Frameworks
 *
 * Advanced narrative structures and storytelling patterns for creating
 * compelling presentations that resonate with different audiences.
 *
 * Features:
 * - Multiple proven storytelling frameworks (Problem–Solution, Hero’s Journey, Before–After, AIDA, PAS, Pyramid, STAR, Data Narrative, Why–What–How)
 * - Audience- and industry-aware adaptations
 * - Dynamic story structure scaling by content length & time constraints
 * - Emotional arc synthesis with engagement scoring
 * - Slide-outline generator with layout & visual suggestions
 *
 * @version 2.2.0
 * @author
 *   AI PowerPoint Generator Team (enhanced by expert co‑pilot)
 */

import { GenerationParams, type SlideLayout } from '../schema';
import { ContentAnalysis } from './aiOrchestrator';

/* ============================================================
 * Types
 * ============================================================ */

export interface StorytellingFramework {
  id: string;
  name: string;
  description: string;
  structure: StoryElement[];
  bestFor: string[]; // tags (sales, case-study, exec, technical, etc.)
  emotionalArc: EmotionalPoint[];
  adaptations: Record<string, FrameworkAdaptation>;
  heuristics?: FrameworkHeuristics;
}

export interface FrameworkHeuristics {
  // Lightweight hints that improve selection scoring
  prefersCharts?: boolean;
  prefersTimeline?: boolean;
  favorsExecs?: boolean;
  favorsTechnical?: boolean;
  persuasionWeighted?: boolean;
  dataWeighted?: boolean;
}

export interface StoryElement {
  id: string;
  name: string;
  purpose: string;
  guidelines: string[];
  examples: string[];
  duration: number; // relative weight (1–10)
  emotionalTone:
    | 'tension'
    | 'relief'
    | 'excitement'
    | 'curiosity'
    | 'satisfaction'
    | 'anticipation';
}

export interface EmotionalPoint {
  position: number; // 0–1 position through narrative
  intensity: number; // 0–1 perceived intensity
  emotion:
    | 'anticipation'
    | 'tension'
    | 'relief'
    | 'excitement'
    | 'satisfaction'
    | 'curiosity';
  description: string;
}

export interface FrameworkAdaptation {
  modifications: string[]; // additional guidance to append to element.guidelines
  emphasis: string[]; // topics to emphasize
  examples: string[]; // audience-specific examples
  culturalNotes?: string[];
}

export interface StoryContext {
  userInput: GenerationParams;
  contentAnalysis: ContentAnalysis;
  targetFramework: StorytellingFramework;
  customizations?: {
    industryFocus?: string;
    culturalContext?: string;
    timeConstraints?: number; // ms
    emotionalGoal?: string;
  };
}

export interface StorySlideOutline {
  title: string;
  keyPoints: string[];
  layoutSuggestion: SlideLayout;
  visualSuggestion?: 'chart' | 'image' | 'diagram' | 'timeline' | 'table';
  notes?: string;
  arcPosition: number; // 0–1
}

/* ============================================================
 * Framework Catalog
 * ============================================================ */

export const STORYTELLING_FRAMEWORKS: Record<string, StorytellingFramework> = {
  /** 1) Problem → Solution */
  problemSolution: {
    id: 'problem-solution',
    name: 'Problem–Solution',
    description:
      'Classic structure that surfaces a painful problem, amplifies stakes, introduces the solution, and proves value.',
    bestFor: ['business', 'sales', 'executive', 'consulting', 'startup'],
    heuristics: {
      favorsExecs: true,
      persuasionWeighted: true
    },
    structure: [
      {
        id: 'problem-setup',
        name: 'Problem Setup',
        purpose: 'Establish the challenge or pain point',
        guidelines: [
          'Make the problem concrete and relatable',
          'Quantify severity with credible metrics',
          'Show who is affected and how'
        ],
        examples: [
          'Cart abandonment causes 30% lost revenue per month',
          'Clinicians spend 40% of time on admin tasks'
        ],
        duration: 3,
        emotionalTone: 'tension'
      },
      {
        id: 'impact-amplification',
        name: 'Impact Amplification',
        purpose: 'Show the cost of inaction and urgency',
        guidelines: [
          'Tie impact to strategic goals (revenue, risk, CX)',
          'Highlight compounding effects over time',
          'Add competitive or regulatory pressure'
        ],
        examples: [
          'Inefficiency costs the sector $2.3B annually',
          'Delays risk compliance penalties and churn'
        ],
        duration: 2,
        emotionalTone: 'tension'
      },
      {
        id: 'solution-intro',
        name: 'Solution',
        purpose: 'Present the clear, credible solution',
        guidelines: [
          'Position as the logical next step',
          'Show how it neutralizes each pain driver',
          'Preview measurable outcomes'
        ],
        examples: [
          'AI checkout reduces transaction time by 60%',
          'Automated documentation returns 25 hrs/week to care'
        ],
        duration: 4,
        emotionalTone: 'relief'
      },
      {
        id: 'proof-benefits',
        name: 'Benefits & Proof',
        purpose: 'De-risk adoption and validate value',
        guidelines: [
          'Use before/after metrics and testimonials',
          'Address top objections proactively',
          'Outline next steps and success plan'
        ],
        examples: [
          'Beta saw +45% conversion, -35% cost to serve',
          'Pilot NPS +20, time-to-value < 2 weeks'
        ],
        duration: 3,
        emotionalTone: 'satisfaction'
      }
    ],
    emotionalArc: [
      { position: 0, intensity: 0.3, emotion: 'curiosity', description: 'Hook' },
      { position: 0.25, intensity: 0.7, emotion: 'tension', description: 'Pain lands' },
      { position: 0.5, intensity: 0.9, emotion: 'tension', description: 'Stakes escalate' },
      { position: 0.75, intensity: 0.6, emotion: 'relief', description: 'Solution clarity' },
      { position: 1, intensity: 0.8, emotion: 'satisfaction', description: 'Confident close' }
    ],
    adaptations: {
      executives: {
        modifications: [
          'Lead with ROI and risk mitigation',
          'Tie solution to strategy and market position',
          'Keep language crisp; avoid jargon'
        ],
        emphasis: ['ROI', 'risk', 'competitive advantage'],
        examples: [
          'Protect 15% market share in a down market',
          'Defensible cost-out plan with quick payback'
        ]
      },
      technical: {
        modifications: [
          'Include architecture and integration plan',
          'Benchmark performance and capacity',
          'Map solution to SLAs and SLOs'
        ],
        emphasis: ['scalability', 'latency', 'reliability'],
        examples: ['p95 latency < 200ms', 'zero-downtime rollout']
      }
    }
  },

  /** 2) Hero’s Journey */
  heroJourney: {
    id: 'hero-journey',
    name: "Hero's Journey",
    description:
      'Transformation narrative following a protagonist (team, user, or org) through trials to breakthrough.',
    bestFor: ['transformation', 'case-study', 'culture', 'innovation'],
    heuristics: { prefersTimeline: true, persuasionWeighted: false },
    structure: [
      {
        id: 'ordinary-world',
        name: 'Ordinary World',
        purpose: 'Set the initial environment and constraints',
        guidelines: ['Make it relatable', 'Frame why change is needed'],
        examples: ['Manual processes capped throughput', 'Effort ≠ outcomes'],
        duration: 2,
        emotionalTone: 'curiosity'
      },
      {
        id: 'call-to-adventure',
        name: 'Call to Adventure',
        purpose: 'Introduce catalyst and the opportunity',
        guidelines: ['Establish stakes and urgency', 'Create excitement'],
        examples: ['Customers expect 2× faster delivery'],
        duration: 2,
        emotionalTone: 'excitement'
      },
      {
        id: 'journey-trials',
        name: 'Journey & Trials',
        purpose: 'Show learning, iteration, and resilience',
        guidelines: ['Acknowledge obstacles', 'Show incremental gains'],
        examples: ['12 iterations to converge', 'Postmortems drove pivots'],
        duration: 4,
        emotionalTone: 'tension'
      },
      {
        id: 'transformation',
        name: 'Transformation',
        purpose: 'Reveal outcome and identity shift',
        guidelines: ['Quantify improvements', 'Celebrate achievement'],
        examples: ['Days → minutes', 'CSAT +40%'],
        duration: 4,
        emotionalTone: 'satisfaction'
      }
    ],
    emotionalArc: [
      { position: 0, intensity: 0.4, emotion: 'curiosity', description: 'Setup' },
      { position: 0.2, intensity: 0.6, emotion: 'excitement', description: 'Inciting force' },
      { position: 0.5, intensity: 0.8, emotion: 'tension', description: 'Trials' },
      { position: 0.8, intensity: 0.9, emotion: 'anticipation', description: 'Breakthrough' },
      { position: 1, intensity: 0.9, emotion: 'satisfaction', description: 'Payoff' }
    ],
    adaptations: {
      executives: {
        modifications: [
          'Tie transformation to strategic bets',
          'Quantify business outcomes'
        ],
        emphasis: ['market positioning', 'operating model'],
        examples: ['Shift from cost center to growth engine']
      },
      employees: {
        modifications: [
          'Highlight collaboration and growth',
          'Recognize individual contributions'
        ],
        emphasis: ['teamwork', 'skill building'],
        examples: ['Upskilling led to faster cycle time']
      }
    }
  },

  /** 3) Before → After (Contrast) */
  beforeAfter: {
    id: 'before-after',
    name: 'Before–After',
    description:
      'High-contrast format showcasing the delta between old and new states.',
    bestFor: ['case-study', 'product-demo', 'process-improvement', 'technical'],
    heuristics: { dataWeighted: true, prefersCharts: true },
    structure: [
      {
        id: 'before-state',
        name: 'Before',
        purpose: 'Make the baseline pain tangible',
        guidelines: ['Use concrete pre-metrics', 'Expose bottlenecks'],
        examples: ['Manual entry 8 hrs/day', '50 weekly complaints'],
        duration: 4,
        emotionalTone: 'tension'
      },
      {
        id: 'transition-moment',
        name: 'Change',
        purpose: 'Show the catalyst and method',
        guidelines: ['Explain decision & rollout', 'Set expectation for results'],
        examples: ['Automation wave 1 launched'],
        duration: 2,
        emotionalTone: 'excitement'
      },
      {
        id: 'after-state',
        name: 'After',
        purpose: 'Reveal the new steady state',
        guidelines: ['Use parallel post-metrics', 'Show sustainability'],
        examples: ['30 min processing', 'Complaints down to 5/week'],
        duration: 4,
        emotionalTone: 'satisfaction'
      }
    ],
    emotionalArc: [
      { position: 0, intensity: 0.3, emotion: 'curiosity', description: 'Baseline' },
      { position: 0.4, intensity: 0.7, emotion: 'tension', description: 'Pain understood' },
      { position: 0.6, intensity: 0.5, emotion: 'anticipation', description: 'Change starts' },
      { position: 1, intensity: 0.9, emotion: 'satisfaction', description: 'Delta realized' }
    ],
    adaptations: {
      technical: {
        modifications: [
          'Include perf benchmarks and architecture diffs',
          'Quantify latency, throughput, stability'
        ],
        emphasis: ['SLA/SLO', 'resource efficiency'],
        examples: ['p95 2.3s → 0.2s', 'DB 1000ms → 50ms']
      },
      business: {
        modifications: [
          'Lead with ROI and cost-out',
          'Tie to growth or margin expansion'
        ],
        emphasis: ['cost reduction', 'revenue impact'],
        examples: ['$100k→$30k/month Opex', '$500→$750 ARPU']
      }
    }
  },

  /** 4) AIDA (Attention–Interest–Desire–Action) */
  aida: {
    id: 'aida',
    name: 'AIDA',
    description:
      'Persuasion sequence optimized for marketing & sales motions.',
    bestFor: ['sales', 'marketing', 'product-launch'],
    heuristics: { persuasionWeighted: true, favorsExecs: false },
    structure: [
      {
        id: 'attention',
        name: 'Attention',
        purpose: 'Hook with a striking insight',
        guidelines: ['Lead with category truth or data jolt', 'Keep copy minimal'],
        examples: ['“70% of buyers self-serve before sales”'],
        duration: 2,
        emotionalTone: 'curiosity'
      },
      {
        id: 'interest',
        name: 'Interest',
        purpose: 'Build relevance to their world',
        guidelines: ['Segmented pain points', 'Quick proof'],
        examples: ['Benchmarks vs. peers'],
        duration: 3,
        emotionalTone: 'anticipation'
      },
      {
        id: 'desire',
        name: 'Desire',
        purpose: 'Make outcomes feel inevitable',
        guidelines: ['Showcase gains & social proof', 'Reduce perceived risk'],
        examples: ['Case studies, quotes'],
        duration: 3,
        emotionalTone: 'excitement'
      },
      {
        id: 'action',
        name: 'Action',
        purpose: 'Create a clear, easy next step',
        guidelines: ['Single CTA', 'Time-bound or value-bound'],
        examples: ['“Start pilot this month”'],
        duration: 2,
        emotionalTone: 'satisfaction'
      }
    ],
    emotionalArc: [
      { position: 0, intensity: 0.5, emotion: 'curiosity', description: 'Hook' },
      { position: 0.35, intensity: 0.7, emotion: 'anticipation', description: 'Relevance' },
      { position: 0.7, intensity: 0.85, emotion: 'excitement', description: 'Momentum' },
      { position: 1, intensity: 0.8, emotion: 'satisfaction', description: 'CTA' }
    ],
    adaptations: {}
  },

  /** 5) PAS (Problem–Agitate–Solve) */
  pas: {
    id: 'pas',
    name: 'Problem–Agitate–Solve',
    description: 'Lean persuasion pattern for short pitches and landing pages.',
    bestFor: ['sales', 'brief-pitch', 'email'],
    heuristics: { persuasionWeighted: true },
    structure: [
      {
        id: 'p',
        name: 'Problem',
        purpose: 'State the problem simply',
        guidelines: ['Be specific, avoid fluff'],
        examples: ['Teams drown in status updates'],
        duration: 3,
        emotionalTone: 'tension'
      },
      {
        id: 'a',
        name: 'Agitate',
        purpose: 'Intensify the discomfort',
        guidelines: ['Show second-order effects', 'Quantify waste or risk'],
        examples: ['Lost focus → missed targets'],
        duration: 3,
        emotionalTone: 'tension'
      },
      {
        id: 's',
        name: 'Solve',
        purpose: 'Deliver the resolution',
        guidelines: ['Map feature→benefit', 'Offer frictionless next step'],
        examples: ['1-click rollup reporting'],
        duration: 4,
        emotionalTone: 'relief'
      }
    ],
    emotionalArc: [
      { position: 0.2, intensity: 0.6, emotion: 'tension', description: 'Problem lands' },
      { position: 0.5, intensity: 0.8, emotion: 'tension', description: 'Pain escalates' },
      { position: 1, intensity: 0.85, emotion: 'relief', description: 'Resolution' }
    ],
    adaptations: {}
  },

  /** 6) Pyramid Principle (MECE / Executive) */
  pyramid: {
    id: 'pyramid',
    name: 'Pyramid Principle',
    description:
      'Top-down executive communication: lead with answer, support with grouped evidence.',
    bestFor: ['executive', 'strategy', 'board', 'analysis'],
    heuristics: { favorsExecs: true, dataWeighted: true },
    structure: [
      {
        id: 'answer-first',
        name: 'Answer First',
        purpose: 'State the governing thought',
        guidelines: ['One clear recommendation', 'Tie to objective'],
        examples: ['Invest in X to unlock Y'],
        duration: 3,
        emotionalTone: 'curiosity'
      },
      {
        id: 'supporting-arguments',
        name: 'Key Supports',
        purpose: '3–4 MECE arguments',
        guidelines: ['Parallel, mutually exclusive', 'Each with metric'],
        examples: ['Market, Unit Economics, Capability fit'],
        duration: 4,
        emotionalTone: 'anticipation'
      },
      {
        id: 'implications',
        name: 'Implications & Risks',
        purpose: 'What this means and how to mitigate',
        guidelines: ['Decision tree & risk view', 'Trigger conditions'],
        examples: ['If churn>z, pivot plan B'],
        duration: 3,
        emotionalTone: 'satisfaction'
      }
    ],
    emotionalArc: [
      { position: 0, intensity: 0.4, emotion: 'curiosity', description: 'The answer' },
      { position: 0.5, intensity: 0.65, emotion: 'anticipation', description: 'Support builds' },
      { position: 1, intensity: 0.75, emotion: 'satisfaction', description: 'Decision clarity' }
    ],
    adaptations: {
      executives: {
        modifications: [
          'Keep within 10–12 words per line',
          'Lead with dollars, risk, timing'
        ],
        emphasis: ['ROI', 'payback', 'risk'],
        examples: ['$XM NPV, 8–10 month payback']
      }
    }
  },

  /** 7) STAR (Situation–Task–Action–Result) */
  star: {
    id: 'star',
    name: 'STAR',
    description:
      'Crisp storytelling for outcomes and competencies; effective for case studies and talent branding.',
    bestFor: ['case-study', 'interview', 'performance'],
    heuristics: { prefersTimeline: false, dataWeighted: true },
    structure: [
      {
        id: 'situation',
        name: 'Situation',
        purpose: 'Set the context and constraint',
        guidelines: ['Be concise; quantify scope'],
        examples: ['Legacy monolith, high churn'],
        duration: 2,
        emotionalTone: 'curiosity'
      },
      {
        id: 'task',
        name: 'Task',
        purpose: 'Define the objective & success criteria',
        guidelines: ['What did “good” look like?'],
        examples: ['Reduce churn to <3%'],
        duration: 2,
        emotionalTone: 'anticipation'
      },
      {
        id: 'action',
        name: 'Action',
        purpose: 'Explain the approach and execution',
        guidelines: ['Sequence steps; show judgment'],
        examples: ['Phased microservices, A/B cycles'],
        duration: 4,
        emotionalTone: 'excitement'
      },
      {
        id: 'result',
        name: 'Result',
        purpose: 'Quantify business impact',
        guidelines: ['Tie to KPI, timeline, lessons'],
        examples: ['Churn 2.1%, CAC–LTV +22%'],
        duration: 2,
        emotionalTone: 'satisfaction'
      }
    ],
    emotionalArc: [
      { position: 0.15, intensity: 0.5, emotion: 'curiosity', description: 'Context' },
      { position: 0.35, intensity: 0.6, emotion: 'anticipation', description: 'Goal' },
      { position: 0.7, intensity: 0.8, emotion: 'excitement', description: 'Execution' },
      { position: 1, intensity: 0.85, emotion: 'satisfaction', description: 'Impact' }
    ],
    adaptations: {}
  },

  /** 8) Data Narrative (Question → Insight → Implication) */
  dataNarrative: {
    id: 'data-narrative',
    name: 'Data Narrative',
    description:
      'Analytical storyline that moves from question to insight to business implication.',
    bestFor: ['analytics', 'ops', 'finance', 'product'],
    heuristics: { dataWeighted: true, prefersCharts: true },
    structure: [
      {
        id: 'question',
        name: 'Business Question',
        purpose: 'Frame the decision context',
        guidelines: ['Define the decision & options'],
        examples: ['Which segment to prioritize?'],
        duration: 3,
        emotionalTone: 'curiosity'
      },
      {
        id: 'insights',
        name: 'Insights',
        purpose: 'Show the signal, not noise',
        guidelines: ['1 insight per chart', 'Call out causality carefully'],
        examples: ['Cohort A LTV +35%'],
        duration: 4,
        emotionalTone: 'anticipation'
      },
      {
        id: 'implication',
        name: 'Implication',
        purpose: 'Translate to recommended action',
        guidelines: ['Tie to $ impact', 'Define test or rollout'],
        examples: ['Shift 20% budget to Cohort A'],
        duration: 3,
        emotionalTone: 'satisfaction'
      }
    ],
    emotionalArc: [
      { position: 0.1, intensity: 0.4, emotion: 'curiosity', description: 'Question' },
      { position: 0.55, intensity: 0.7, emotion: 'anticipation', description: 'Insight' },
      { position: 1, intensity: 0.8, emotion: 'satisfaction', description: 'Action' }
    ],
    adaptations: {}
  },

  /** 9) Why–What–How (simple explainer) */
  whyWhatHow: {
    id: 'why-what-how',
    name: 'Why–What–How',
    description: 'Crisp explainer flow suitable for training and onboarding.',
    bestFor: ['education', 'enablement', 'internal-comms'],
    heuristics: { persuasionWeighted: false },
    structure: [
      {
        id: 'why',
        name: 'Why',
        purpose: 'Create relevance and urgency',
        guidelines: ['Pain or goal first'],
        examples: ['Why this matters to you'],
        duration: 3,
        emotionalTone: 'curiosity'
      },
      {
        id: 'what',
        name: 'What',
        purpose: 'Explain the concept or capability',
        guidelines: ['Define terms; keep simple'],
        examples: ['What the system does'],
        duration: 3,
        emotionalTone: 'anticipation'
      },
      {
        id: 'how',
        name: 'How',
        purpose: 'Show application and next steps',
        guidelines: ['Demo, checklist, practice'],
        examples: ['How to start in 5 mins'],
        duration: 4,
        emotionalTone: 'satisfaction'
      }
    ],
    emotionalArc: [
      { position: 0.15, intensity: 0.45, emotion: 'curiosity', description: 'Why' },
      { position: 0.5, intensity: 0.6, emotion: 'anticipation', description: 'What' },
      { position: 1, intensity: 0.75, emotion: 'satisfaction', description: 'How' }
    ],
    adaptations: {}
  }
};

/* ============================================================
 * Selection & Scoring
 * ============================================================ */

export function selectOptimalFramework(
  params: GenerationParams,
  analysis: ContentAnalysis
): StorytellingFramework {
  const candidates = Object.values(STORYTELLING_FRAMEWORKS);

  // Keyword heuristics (fast path)
  const prompt = params.prompt.toLowerCase();
  if (/\b(problem|challenge|solution|mitigate)\b/.test(prompt)) {
    return STORYTELLING_FRAMEWORKS.problemSolution;
  }
  if (/\b(before|after|improvement|delta|baseline)\b/.test(prompt)) {
    return STORYTELLING_FRAMEWORKS.beforeAfter;
  }
  if (/\b(journey|transformation|change)\b/.test(prompt)) {
    return STORYTELLING_FRAMEWORKS.heroJourney;
  }

  // Score each framework with analysis- & audience-aware weights
  const scored = candidates.map((fw) => ({
    fw,
    score: scoreFramework(fw, params, analysis)
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.fw ?? STORYTELLING_FRAMEWORKS.problemSolution;
}

function scoreFramework(
  fw: StorytellingFramework,
  params: GenerationParams,
  analysis: ContentAnalysis
): number {
  let score = 0.5;

  // Audience alignment
  const aud = params.audience;
  if (fw.bestFor.includes('executive') && aud === 'executives') score += 0.2;
  if (fw.bestFor.includes('technical') && aud === 'technical') score += 0.15;
  if (fw.bestFor.includes('sales') && aud === 'sales') score += 0.1;

  // Category alignment
  if (analysis.category === 'business' && fw.bestFor.includes('business')) score += 0.1;
  if (analysis.category === 'technical' && fw.heuristics?.favorsTechnical) score += 0.1;

  // Visual preferences
  const visuals = new Set(analysis.visualElements?.map((v) => v.type) ?? []);
  if (fw.heuristics?.prefersCharts && visuals.has('chart')) score += 0.08;
  if (fw.heuristics?.prefersTimeline && visuals.has('timeline')) score += 0.08;

  // Tone/persuasion
  if (fw.heuristics?.persuasionWeighted && ['persuasive', 'confident', 'authoritative'].includes(params.tone))
    score += 0.1;

  // Data intensity
  if (fw.heuristics?.dataWeighted && (visuals.has('chart') || analysis.keywords.some(k => /kpi|metric|roi|benchmark/i.test(k))))
    score += 0.08;

  // Content length fit (short forms → PAS/AIDA; longer → Pyramid/Hero/Data)
  const length = params.contentLength;
  if (['minimal', 'brief'].includes(length) && (fw.id === 'pas' || fw.id === 'aida' || fw.id === 'why-what-how')) score += 0.07;
  if (['detailed', 'comprehensive'].includes(length) && (fw.id === 'pyramid' || fw.id === 'hero-journey' || fw.id === 'data-narrative')) score += 0.07;

  // Minor bonus for explicit matches in prompt text
  const needle = fw.name.toLowerCase().split(/\W+/).filter(Boolean);
  if (needle.some((n) => promptContains(params.prompt, n))) score += 0.03;

  // Audience & tone alignment from analysis (0–1 each)
  score += (analysis.toneAlignment ?? 0) * 0.05;
  score += (analysis.audienceAlignment ?? 0) * 0.05;

  return score;
}

function promptContains(text: string, word: string): boolean {
  return new RegExp(`\\b${escapeRegex(word)}\\b`, 'i').test(text);
}
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ============================================================
 * Story Generation & Adaptation
 * ============================================================ */

export function generateStoryStructure(
  framework: StorytellingFramework,
  context: StoryContext
): StoryElement[] {
  const { userInput } = context;

  // 1) Clone the base structure
  let elements = framework.structure.map((e) => ({ ...e, guidelines: [...e.guidelines], examples: [...e.examples] }));

  // 2) Apply audience adaptation if present
  const aud = userInput.audience;
  const adaptation = framework.adaptations[aud];
  if (adaptation) {
    elements = elements.map((el) => ({
      ...el,
      guidelines: [...el.guidelines, ...adaptation.modifications],
      examples: [...el.examples, ...adaptation.examples]
    }));
  }

  // 3) Scale durations by requested contentLength and potential time constraints
  const slideTarget = estimateSlideCount(userInput.contentLength);
  elements = normalizeDurations(elements, slideTarget);

  // 4) Minor customization hints
  if (context.customizations?.emotionalGoal) {
    const goal = context.customizations.emotionalGoal.toLowerCase();
    elements.forEach((el) => {
      if (goal.includes('trust')) el.guidelines.push('Use credible, neutral language and cite sources');
      if (goal.includes('urgency')) el.guidelines.push('Emphasize time-bound risks and deadlines');
      if (goal.includes('inspire')) el.guidelines.push('Use ambitious language and aspirational visuals');
    });
  }

  return elements;
}

/* ============================================================
 * Slide Outline Generator
 * ============================================================ */

export function buildStorySlideOutline(
  framework: StorytellingFramework,
  elements: StoryElement[],
  analysis: ContentAnalysis
): StorySlideOutline[] {
  const total = elements.reduce((acc, e) => acc + e.duration, 0) || 1;

  return elements.map((el, idx) => {
    const position = cumulativePosition(elements, idx) / total; // 0–1 arc position
    const layout = suggestLayoutForElement(framework.id, el);
    const visual = suggestVisualForElement(el, analysis);

    return {
      title: `${el.name}`,
      keyPoints: deriveKeyPoints(el),
      layoutSuggestion: layout,
      visualSuggestion: visual,
      notes: `Purpose: ${el.purpose}`,
      arcPosition: clamp01(position)
    };
  });
}

/* ============================================================
 * Engagement & Emotional Arc
 * ============================================================ */

export function calculateEngagementScore(
  framework: StorytellingFramework,
  audience: string
): number {
  const base = 0.7;
  const hasAdaptation = Boolean(framework.adaptations[audience]);
  const arcVariation = calculateEmotionalVariation(framework.emotionalArc);
  const bonus = (hasAdaptation ? 0.2 : 0) + arcVariation * 0.1;

  return Math.min(base + bonus, 1.0);
}

function calculateEmotionalVariation(arc: EmotionalPoint[]): number {
  if (arc.length < 2) return 0;
  let diff = 0;
  for (let i = 1; i < arc.length; i++) {
    diff += Math.abs(arc[i].intensity - arc[i - 1].intensity);
  }
  return diff / (arc.length - 1);
}

/* ============================================================
 * Utilities
 * ============================================================ */

function estimateSlideCount(length: GenerationParams['contentLength']): number {
  switch (length) {
    case 'minimal':
      return 1;
    case 'brief':
      return 2;
    case 'moderate':
      return 3;
    case 'detailed':
      return 4;
    case 'comprehensive':
      return 5;
    default:
      return 3;
  }
}

function normalizeDurations(elems: StoryElement[], slideTarget: number): StoryElement[] {
  const total = elems.reduce((a, b) => a + b.duration, 0) || 1;
  if (total === slideTarget) return elems;

  const scale = slideTarget / total;
  // Scale and ensure each element gets at least 1 “unit”
  const scaled = elems.map((e) => ({
    ...e,
    duration: Math.max(1, Math.round(e.duration * scale))
  }));

  // Adjust rounding drift
  const delta = slideTarget - scaled.reduce((a, b) => a + b.duration, 0);
  if (delta !== 0) {
    // Add/subtract from middle elements to keep balance
    const mid = Math.floor(scaled.length / 2);
    scaled[mid].duration = Math.max(1, scaled[mid].duration + delta);
  }
  return scaled;
}

function cumulativePosition(elems: StoryElement[], idx: number): number {
  let sum = 0;
  for (let i = 0; i <= idx; i++) sum += elems[i].duration;
  return sum;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function deriveKeyPoints(el: StoryElement): string[] {
  // Keep bullet points punchy (<= 10 words) where possible
  const cap = (s: string) => s.replace(/\.$/, '');
  const trimmed = el.guidelines.slice(0, 3).map(cap);
  return trimmed;
}

function suggestVisualForElement(
  el: StoryElement,
  analysis: ContentAnalysis
): StorySlideOutline['visualSuggestion'] {
  // If analysis hints a strong visual preference, bias towards it
  const preferred = analysis.visualElements?.[0]?.type;
  if (preferred === 'timeline' && /journey|change|transition/i.test(el.name)) return 'timeline';
  if (preferred === 'chart' && /benefit|proof|insight|result|after/i.test(el.name)) return 'chart';

  // Otherwise infer from element semantic
  if (/before|after|result|benefit|insight/i.test(el.name)) return 'chart';
  if (/journey|change|timeline/i.test(el.name)) return 'timeline';
  if (/solution|what|how|action/i.test(el.name)) return 'diagram';
  return 'image';
}

function suggestLayoutForElement(
  frameworkId: string,
  el: StoryElement
): SlideLayout {
  // Map to internal, validated layouts
  if (/before|after/.test(el.id)) return 'before-after' as SlideLayout;
  if (/problem|impact/.test(el.id)) return 'problem-solution' as SlideLayout;
  if (/journey|transformation/.test(el.id)) return 'timeline' as SlideLayout;
  if (/answer|implications|support/.test(el.id)) return 'two-column' as SlideLayout;
  if (/insight|result|benefit/.test(el.id)) return 'data-visualization' as SlideLayout;

  // Framework defaults
  switch (frameworkId) {
    case 'pyramid':
      return 'two-column' as SlideLayout;
    case 'aida':
      return 'modern-bullets' as SlideLayout;
    case 'pas':
      return 'problem-solution' as SlideLayout;
    case 'data-narrative':
      return 'data-visualization' as SlideLayout;
    default:
      return 'title-bullets' as SlideLayout;
  }
}

/* ============================================================
 * Additional Exports (optional helpers)
 * ============================================================ */

export function getFrameworkById(id: string): StorytellingFramework | undefined {
  return STORYTELLING_FRAMEWORKS[id];
}

export function listFrameworks(): Array<Pick<StorytellingFramework, 'id' | 'name' | 'description' | 'bestFor'>> {
  return Object.values(STORYTELLING_FRAMEWORKS).map(({ id, name, description, bestFor }) => ({
    id,
    name,
    description,
    bestFor
  }));
}

export function summarizeFramework(
  fw: StorytellingFramework,
  audience: string
): { name: string; slides: number; engagement: number } {
  const slides = fw.structure.reduce((a, b) => a + b.duration, 0);
  return {
    name: fw.name,
    slides,
    engagement: calculateEngagementScore(fw, audience)
  };
}