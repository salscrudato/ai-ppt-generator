import { generateSimplePpt } from './pptGenerator-simple';
import type { SlideSpec } from './schema';

// Helper: validate PK ZIP signature and minimum size
function expectValidPptx(buffer: Buffer, minBytes = 10240) {
  expect(buffer).toBeInstanceOf(Buffer);
  expect(buffer.length).toBeGreaterThan(minBytes);
  // ZIP local file header signature 0x04034b50 => 'PK\x03\x04'
  const sig = buffer.subarray(0, 4);
  expect(Array.from(sig)).toEqual([0x50, 0x4B, 0x03, 0x04]);
}

// Default theme id matches backend professionalThemes default order
const THEME_ID = 'corporate-blue';

describe('generateSimplePpt - end-to-end', () => {
  jest.setTimeout(30000);

  test('generates a single title-bullets slide', async () => {
    const slides: SlideSpec[] = [{
      title: 'Quarterly Highlights',
      layout: 'title-bullets' as any,
      bullets: [
        'Revenue up 18% YoY',
        'NPS improved from 46 to 58',
        'Launched 3 new enterprise features'
      ],
      notes: 'Emphasize product-market fit progress.'
    } as any];

    const buf = await generateSimplePpt(slides, THEME_ID, {
      includeMetadata: true,
      includeSpeakerNotes: true,
      optimizeFileSize: true,
      author: 'Test Runner',
      company: 'AI PPT Gen',
      subject: 'Unit Test'
    });
    expectValidPptx(buf);
  });

  test('generates chart slide with series', async () => {
    const slides: SlideSpec[] = [{
      title: 'Monthly Users',
      layout: 'chart' as any,
      chart: {
        type: 'line' as any,
        categories: ['Jan', 'Feb', 'Mar', 'Apr'],
        series: [
          { name: 'MAU', data: [120, 135, 160, 190] },
          { name: 'DAU', data: [40, 46, 53, 62] }
        ]
      }
    } as any];

    const buf = await generateSimplePpt(slides, THEME_ID, { includeSpeakerNotes: true });
    expectValidPptx(buf);
  });

  test('generates comparison table slide', async () => {
    const slides: SlideSpec[] = [{
      title: 'Plan Comparison',
      layout: 'comparison-table' as any,
      comparisonTable: {
        headers: ['Feature', 'Basic', 'Pro'],
        rows: [
          ['Users', '5', 'Unlimited'],
          ['SLA', 'Best effort', '99.9%'],
          ['SSO', '—', 'Okta, AzureAD']
        ]
      }
    } as any];

    const buf = await generateSimplePpt(slides, THEME_ID, {});
    expectValidPptx(buf);
  });

  test('generates timeline slide', async () => {
    const slides: SlideSpec[] = [{
      title: 'Roadmap',
      layout: 'timeline' as any,
      timeline: [
        { date: 'Q1', title: 'MVP', description: 'Alpha with core features' },
        { date: 'Q2', title: 'GA', description: 'Public launch' },
        { date: 'Q3', title: 'Enterprise', description: 'SSO + Audit Logs' }
      ]
    } as any];

    const buf = await generateSimplePpt(slides, THEME_ID, {});
    expectValidPptx(buf);
  });

  test('generates process-flow slide', async () => {
    const slides: SlideSpec[] = [{
      title: 'Onboarding Process',
      layout: 'process-flow' as any,
      processSteps: [
        { title: 'Sign Up' },
        { title: 'Verify Email' },
        { title: 'Create Workspace' },
        { title: 'Invite Team' }
      ]
    } as any];

    const buf = await generateSimplePpt(slides, THEME_ID, {});
    expectValidPptx(buf);
  });

  test('generates two-column slide with mixed content', async () => {
    const slides: SlideSpec[] = [{
      title: 'Key Insights',
      layout: 'two-column' as any,
      left: { bullets: ['Insight A', 'Insight B', 'Insight C'] },
      right: { paragraph: 'Detailed explanation and context for the insights.' }
    } as any];

    const buf = await generateSimplePpt(slides, THEME_ID, {});
    expectValidPptx(buf);
  });

  test('generates image-right and image-left slides (placeholders)', async () => {
    const slides: SlideSpec[] = [
      { title: 'Product Overview', layout: 'image-right' as any, bullets: ['Fast', 'Secure', 'Scalable'] } as any,
      { title: 'Architecture', layout: 'image-left' as any, paragraph: 'Modern cloud-native architecture.' } as any,
    ];

    const buf = await generateSimplePpt(slides, THEME_ID, {});
    expectValidPptx(buf, 15000); // two slides, slightly larger
  });

  test('generates quote slide', async () => {
    const slides: SlideSpec[] = [{
      title: 'Quote',
      layout: 'quote' as any,
      paragraph: 'Innovation distinguishes between a leader and a follower.',
      subtitle: 'Steve Jobs'
    } as any];

    const buf = await generateSimplePpt(slides, THEME_ID, {});
    expectValidPptx(buf);
  });

  test('generates mixed-content slide', async () => {
    const slides: SlideSpec[] = [{
      title: 'Strategy Overview',
      layout: 'mixed-content' as any,
      paragraph: 'Our strategy focuses on three pillars to drive sustainable growth and customer value across the portfolio.',
      left: { title: 'Pillar 1', bullets: ['Quality', 'Reliability'] } as any,
      right: { title: 'Pillar 2', bullets: ['Innovation', 'Speed'] } as any,
    } as any];

    const buf = await generateSimplePpt(slides, THEME_ID, {});
    expectValidPptx(buf);
  });

  test('handles multiple slides with metadata and notes', async () => {
    const slides: SlideSpec[] = [
      { title: 'Title', layout: 'title' as any, paragraph: 'Welcome to the deck.' } as any,
      { title: 'Agenda', layout: 'title-bullets' as any, bullets: ['Intro', 'Plan', 'Q&A'] } as any,
      { title: 'KPIs', layout: 'chart' as any, chart: { type: 'bar' as any, categories: ['M1','M2','M3'], series: [{ name: 'Rev', data: [10,12,14] }] } as any } as any,
    ];

    const buf = await generateSimplePpt(slides, THEME_ID, {
      includeMetadata: true,
      includeSpeakerNotes: true,
      author: 'QA Bot',
      company: 'AI PPT Gen',
      subject: 'Smoke Suite',
    });
    expectValidPptx(buf, 20000);
  });
});

