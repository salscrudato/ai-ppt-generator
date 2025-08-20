/*
 * Sample PPTX generation script (no external API calls)
 * Generates a couple of small .pptx files under functions/samples/
 */

import fs from 'node:fs';
import path from 'node:path';
import { PowerPointService } from '../services/powerPointService';
import { PROFESSIONAL_THEMES } from '../professionalThemes';
import type { SlideSpec } from '../schema';

async function main() {
  const outDir = path.resolve(__dirname, '../../samples');
  fs.mkdirSync(outDir, { recursive: true });

  const svc = new PowerPointService();

  // Deck 1: Corporate Blue, title-bullets + chart
  const deck1Slides: SlideSpec[] = [
    {
      title: 'Q3 Growth Highlights',
      layout: 'title-bullets',
      bullets: [
        'Revenue +28% YoY with margin expansion',
        'Net retention 124% across enterprise segment',
        'New logo growth +41% in mid-market',
        'Roadmap on track for Q4 GA features'
      ],
      notes: 'Emphasize retention and margin expansion; tie bullets to top KPIs.'
    },
    {
      title: 'KPI Overview',
      layout: 'chart',
      chart: {
        type: 'bar',
        categories: ['Q1', 'Q2', 'Q3'],
        series: [
          { name: 'Revenue ($M)', data: [12, 15, 18] },
          { name: 'New Logos', data: [24, 30, 42] }
        ],
        title: 'Quarterly Performance',
        showLegend: true,
        showDataLabels: false
      },
      notes: 'Point out acceleration in Q3; discuss drivers and sustainability.'
    }
  ];

  const deck1Theme = PROFESSIONAL_THEMES.find(t => t.id === 'corporate-blue') || PROFESSIONAL_THEMES[0];
  const deck1 = await svc.generatePresentation(deck1Slides, {
    theme: deck1Theme,
    includeMetadata: true,
    includeNotes: true,
    optimizeForSize: true,
    quality: 'standard',
    author: 'AI PowerPoint Generator',
    company: 'Professional Presentations',
    subject: 'Growth Highlights'
  });

  const deck1Path = path.join(outDir, 'sample_corporate_growth.pptx');
  fs.writeFileSync(deck1Path, deck1.buffer);

  // Deck 2: Creative Purple, image-right (placeholder) + two-column
  const deck2Slides: SlideSpec[] = [
    {
      title: 'Vision & Positioning',
      layout: 'image-right',
      paragraph: 'Position the product as the most intuitive platform for teams to turn ideas into outcomes.',
      bullets: [
        'Design-led experience with measurable ROI',
        'Enterprise-grade security and governance',
        'Ecosystem integrations and open APIs'
      ],
      imageUrl: 'https://picsum.photos/1280/720',
      altText: 'Modern office environment',
      notes: 'Use the image area to set tone; placeholder image URL used in this sample.'
    },
    {
      title: 'Plan: Next 3 Quarters',
      layout: 'two-column',
      left: {
        heading: 'Near Term',
        bullets: ['Onboard key design partners', 'Ship insights dashboards', 'Expand SSO/SAML coverage']
      },
      right: {
        heading: 'Mid Term',
        bullets: ['Launch marketplace beta', 'Regional data residency', 'Performance SLAs']
      },
      notes: 'Balance execution detail with clear outcomes; align to leadership priorities.'
    }
  ];

  const deck2Theme = PROFESSIONAL_THEMES.find(t => t.id === 'creative-purple') || PROFESSIONAL_THEMES[0];
  const deck2 = await svc.generatePresentation(deck2Slides, {
    theme: deck2Theme,
    includeMetadata: true,
    includeNotes: true,
    optimizeForSize: true,
    quality: 'standard',
    author: 'AI PowerPoint Generator',
    company: 'Professional Presentations',
    subject: 'Vision & Plan'
  });

  const deck2Path = path.join(outDir, 'sample_creative_vision_plan.pptx');
  fs.writeFileSync(deck2Path, deck2.buffer);

  // Deck 3: Timeline + Process-flow (corporate theme)
  const deck3Slides: SlideSpec[] = [
    {
      title: 'Product Roadmap Timeline',
      layout: 'timeline',
      timeline: [
        { date: 'Q1 2024', title: 'Beta Launch', description: 'Core features ready for testing', milestone: true },
        { date: 'Q2 2024', title: 'Public Release', description: 'General availability with full feature set', milestone: true },
        { date: 'Q3 2024', title: 'Enterprise Features', description: 'Advanced security and compliance', milestone: false },
        { date: 'Q4 2024', title: 'Global Expansion', description: 'Multi-region deployment', milestone: true }
      ],
      notes: 'Walk through each milestone; emphasize dependencies and risk mitigation.'
    },
    {
      title: 'Implementation Process',
      layout: 'process-flow',
      processSteps: [
        { title: 'Research', step: 1, description: 'Market analysis and user interviews' },
        { title: 'Design', step: 2, description: 'Product specification and prototyping' },
        { title: 'Build', step: 3, description: 'Development and quality assurance' },
        { title: 'Launch', step: 4, description: 'Marketing campaign and user onboarding' },
        { title: 'Scale', step: 5, description: 'Growth optimization and expansion' }
      ],
      notes: 'Highlight iterative nature; each step informs the next.'
    }
  ];

  const deck3Theme = PROFESSIONAL_THEMES.find(t => t.id === 'corporate-blue') || PROFESSIONAL_THEMES[0];
  const deck3 = await svc.generatePresentation(deck3Slides, {
    theme: deck3Theme,
    includeMetadata: true,
    includeNotes: true,
    optimizeForSize: true,
    quality: 'standard',
    author: 'AI PowerPoint Generator',
    company: 'Professional Presentations',
    subject: 'Timeline & Process'
  });

  const deck3Path = path.join(outDir, 'sample_timeline_process.pptx');
  fs.writeFileSync(deck3Path, deck3.buffer);

  // Deck 4: Comparison-table + Quote (finance-navy theme)
  const deck4Slides: SlideSpec[] = [
    {
      title: 'Solution Comparison',
      layout: 'comparison-table',
      table: {
        headers: ['Feature', 'Basic Plan', 'Pro Plan', 'Enterprise'],
        rows: [
          ['Users', '5', '25', 'Unlimited'],
          ['Storage', '10GB', '100GB', '1TB+'],
          ['Support', 'Email', '24/7 Chat', 'Dedicated CSM'],
          ['Integrations', '5', '50', 'Custom APIs']
        ]
      },
      notes: 'Focus on value differentiation; address common objections about pricing.'
    },
    {
      title: 'Customer Success',
      layout: 'quote',
      quote: 'This platform transformed our workflow efficiency by 40% in the first quarter. The ROI was immediate and measurable.',
      author: 'Sarah Chen, VP of Operations, TechCorp',
      notes: 'Use this testimonial to build credibility; mention specific metrics when possible.'
    }
  ];

  const deck4Theme = PROFESSIONAL_THEMES.find(t => t.id === 'finance-navy') || PROFESSIONAL_THEMES[0];
  const deck4 = await svc.generatePresentation(deck4Slides, {
    theme: deck4Theme,
    includeMetadata: true,
    includeNotes: true,
    optimizeForSize: true,
    quality: 'standard',
    author: 'AI PowerPoint Generator',
    company: 'Professional Presentations',
    subject: 'Comparison & Testimonial'
  });

  const deck4Path = path.join(outDir, 'sample_comparison_quote.pptx');
  fs.writeFileSync(deck4Path, deck4.buffer);

  // Done
  return { deck1Path, deck2Path, deck3Path, deck4Path };
}

main()
  .then(({ deck1Path, deck2Path, deck3Path, deck4Path }) => {
    console.log('[Samples] Generated files:');
    console.log(' -', deck1Path);
    console.log(' -', deck2Path);
    console.log(' -', deck3Path);
    console.log(' -', deck4Path);
  })
  .catch((err) => {
    console.error('[Samples] Failed:', err);
    process.exit(1);
  });

