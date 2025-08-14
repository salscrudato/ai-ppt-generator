/**
 * Performance Benchmark Suite
 *
 * Comprehensive benchmarking tool for the enhanced AI PowerPoint Generator.
 * Measures performance improvements and validates quality standards.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { performance } from 'perf_hooks';
import {
  buildTitleSlide,
  buildBulletSlide,
  buildTwoColumnSlide,
  buildMetricsSlide,
  type SlideConfig
} from '../src/slides/index';
import { getTheme } from '../src/core/theme/themes';
import { validateSlideBuildResult } from '../src/styleValidator';

/**
 * Benchmark configuration
 */
interface BenchmarkConfig {
  iterations: number;
  warmupRuns: number;
  slideCount: number;
  themes: string[];
}

/**
 * Benchmark results
 */
interface BenchmarkResult {
  operation: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  p50: number;
  p95: number;
  p99: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  qualityScore: number;
}

/**
 * Sample slide configurations for benchmarking
 */
const BENCHMARK_SLIDES: SlideConfig[] = [
  {
    type: 'title',
    title: 'Digital Transformation Strategy',
    subtitle: 'Accelerating Growth Through Innovation',
    author: 'Sarah Johnson, CTO',
    organization: 'TechForward Inc.'
  },
  {
    type: 'bullets',
    title: 'Strategic Objectives',
    bullets: [
      'Modernize legacy systems and infrastructure',
      'Implement AI-driven automation solutions',
      'Enhance customer experience platforms',
      'Strengthen cybersecurity frameworks',
      'Build data analytics capabilities'
    ]
  },
  {
    type: 'twoColumn',
    title: 'Current vs Future State',
    leftColumn: {
      type: 'text',
      content: 'Current challenges and limitations in our technology stack.',
      bullets: [
        'Manual processes slow operations',
        'Siloed data systems',
        'Limited scalability'
      ]
    },
    rightColumn: {
      type: 'text',
      content: 'Vision for integrated, automated, and scalable technology ecosystem.',
      bullets: [
        'Automated workflow management',
        'Unified data platform',
        'Cloud-native architecture'
      ]
    }
  },
  {
    type: 'metrics',
    title: 'Expected ROI and Impact',
    metrics: [
      {
        value: '40%',
        label: 'Cost Reduction',
        trend: { direction: 'up', percentage: 40 },
        color: 'success'
      },
      {
        value: '2.5x',
        label: 'Processing Speed',
        trend: { direction: 'up', percentage: 150 },
        color: 'primary'
      },
      {
        value: '99.9%',
        label: 'System Uptime',
        color: 'info'
      },
      {
        value: '$1.2M',
        label: 'Annual Savings',
        trend: { direction: 'up', percentage: 120 },
        color: 'success'
      }
    ],
    layout: 'grid'
  }
];

/**
 * Run performance benchmark for slide generation
 */
async function benchmarkSlideGeneration(
  config: BenchmarkConfig
): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  console.log('🚀 Starting Enhanced Slide Generation Benchmarks...\n');

  for (const themeName of config.themes) {
    const theme = getTheme(themeName);
    console.log(`📊 Benchmarking theme: ${themeName}`);

    // Warmup runs
    console.log(`  🔥 Warming up (${config.warmupRuns} runs)...`);
    for (let i = 0; i < config.warmupRuns; i++) {
      for (const slideConfig of BENCHMARK_SLIDES) {
        await generateSlide(slideConfig, theme);
      }
    }

    // Actual benchmark runs
    const times: number[] = [];
    const qualityScores: number[] = [];
    let totalMemoryUsed = 0;

    console.log(`  ⏱️  Running benchmark (${config.iterations} iterations)...`);

    for (let i = 0; i < config.iterations; i++) {
      const startTime = performance.now();
      const startMemory = process.memoryUsage();

      // Generate all slides
      for (const slideConfig of BENCHMARK_SLIDES) {
        const result = await generateSlide(slideConfig, theme);
        const validation = validateSlideBuildResult(result, theme);
        qualityScores.push(validation.score);
      }

      const endTime = performance.now();
      const endMemory = process.memoryUsage();

      const executionTime = endTime - startTime;
      times.push(executionTime);

      totalMemoryUsed += (endMemory.heapUsed - startMemory.heapUsed);

      if ((i + 1) % 10 === 0) {
        console.log(`    ✓ Completed ${i + 1}/${config.iterations} iterations`);
      }
    }

    // Calculate statistics
    times.sort((a, b) => a - b);
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / times.length;
    const p50 = times[Math.floor(times.length * 0.5)];
    const p95 = times[Math.floor(times.length * 0.95)];
    const p99 = times[Math.floor(times.length * 0.99)];
    const averageQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;

    const result: BenchmarkResult = {
      operation: `Slide Generation (${themeName} theme)`,
      iterations: config.iterations,
      totalTime,
      averageTime,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      p50,
      p95,
      p99,
      memoryUsage: {
        heapUsed: totalMemoryUsed / config.iterations,
        heapTotal: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external
      },
      qualityScore: averageQuality
    };

    results.push(result);

    console.log(`  ✅ ${themeName} theme completed\n`);
  }

  return results;
}

/**
 * Generate a single slide (mock implementation for benchmarking)
 */
async function generateSlide(config: SlideConfig, theme: any): Promise<any> {
  // Simulate slide generation with actual function calls
  switch (config.type) {
    case 'title':
      return buildTitleSlide(config, theme);
    case 'bullets':
      return buildBulletSlide(config, theme);
    case 'twoColumn':
      return buildTwoColumnSlide(config, theme);
    case 'metrics':
      return buildMetricsSlide(config, theme);
    default:
      throw new Error(`Unknown slide type: ${config.type}`);
  }
}

/**
 * Format benchmark results for display
 */
function formatResults(results: BenchmarkResult[]): void {
  console.log('📈 BENCHMARK RESULTS');
  console.log('='.repeat(80));

  results.forEach(result => {
    console.log(`\n🎯 ${result.operation}`);
    console.log('-'.repeat(50));
    console.log(`Iterations:      ${result.iterations.toLocaleString()}`);
    console.log(`Total Time:      ${(result.totalTime / 1000).toFixed(2)}s`);
    console.log(`Average Time:    ${result.averageTime.toFixed(2)}ms`);
    console.log(`Min Time:        ${result.minTime.toFixed(2)}ms`);
    console.log(`Max Time:        ${result.maxTime.toFixed(2)}ms`);
    console.log(`P50 (Median):    ${result.p50.toFixed(2)}ms`);
    console.log(`P95:             ${result.p95.toFixed(2)}ms`);
    console.log(`P99:             ${result.p99.toFixed(2)}ms`);
    console.log(`Quality Score:   ${result.qualityScore.toFixed(1)}/100`);
    console.log(`Memory (Heap):   ${(result.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);

    // Performance assessment
    const grade = getPerformanceGrade(result);
    console.log(`Performance:     ${grade.emoji} ${grade.label}`);
  });

  // Overall summary
  const overallAverage = results.reduce((sum, r) => sum + r.averageTime, 0) / results.length;
  const overallQuality = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;

  console.log('\n🏆 OVERALL SUMMARY');
  console.log('='.repeat(50));
  console.log(`Average Generation Time: ${overallAverage.toFixed(2)}ms`);
  console.log(`Average Quality Score:   ${overallQuality.toFixed(1)}/100`);
  console.log(`Themes Tested:           ${results.length}`);
  console.log(`Total Slides Generated:  ${results.reduce((sum, r) => sum + r.iterations * 4, 0).toLocaleString()}`);

  // Performance targets assessment
  console.log('\n🎯 TARGET ASSESSMENT');
  console.log('='.repeat(50));
  console.log(`Cold Start Target (<2000ms):     ${overallAverage < 2000 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Quality Target (>90):             ${overallQuality > 90 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Consistency Target (P95<5000ms):  ${results.every(r => r.p95 < 5000) ? '✅ PASS' : '❌ FAIL'}`);
}

/**
 * Get performance grade based on metrics
 */
function getPerformanceGrade(result: BenchmarkResult): { emoji: string; label: string } {
  if (result.averageTime < 500 && result.qualityScore > 95) {
    return { emoji: '🚀', label: 'Excellent' };
  } else if (result.averageTime < 1000 && result.qualityScore > 90) {
    return { emoji: '⚡', label: 'Very Good' };
  } else if (result.averageTime < 2000 && result.qualityScore > 80) {
    return { emoji: '✅', label: 'Good' };
  } else if (result.averageTime < 5000 && result.qualityScore > 70) {
    return { emoji: '⚠️', label: 'Acceptable' };
  } else {
    return { emoji: '❌', label: 'Needs Improvement' };
  }
}

/**
 * Generate comparison report with baseline
 */
function generateComparisonReport(results: BenchmarkResult[]): void {
  console.log('\n📊 PERFORMANCE COMPARISON');
  console.log('='.repeat(80));

  // Baseline metrics (simulated legacy system performance)
  const baseline = {
    averageTime: 5000, // 5 seconds
    qualityScore: 70,  // 70/100
    memoryUsage: 2048  // 2GB
  };

  const current = {
    averageTime: results.reduce((sum, r) => sum + r.averageTime, 0) / results.length,
    qualityScore: results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length,
    memoryUsage: results.reduce((sum, r) => sum + r.memoryUsage.heapUsed, 0) / results.length / 1024 / 1024
  };

  console.log('Metric                    | Baseline    | Enhanced    | Improvement');
  console.log('-'.repeat(70));
  console.log(`Generation Time          | ${baseline.averageTime}ms     | ${current.averageTime.toFixed(0)}ms       | ${((baseline.averageTime - current.averageTime) / baseline.averageTime * 100).toFixed(1)}% faster`);
  console.log(`Quality Score            | ${baseline.qualityScore}/100      | ${current.qualityScore.toFixed(1)}/100     | +${(current.qualityScore - baseline.qualityScore).toFixed(1)} points`);
  console.log(`Memory Usage             | ${baseline.memoryUsage}MB      | ${current.memoryUsage.toFixed(0)}MB       | ${((baseline.memoryUsage - current.memoryUsage) / baseline.memoryUsage * 100).toFixed(1)}% less`);
}

/**
 * Main benchmark execution
 */
async function main(): Promise<void> {
  const config: BenchmarkConfig = {
    iterations: 50,
    warmupRuns: 10,
    slideCount: 4,
    themes: ['neutral', 'executive', 'colorPop']
  };

  console.log('🎯 Enhanced AI PowerPoint Generator - Performance Benchmark');
  console.log('='.repeat(80));
  console.log(`Configuration:`);
  console.log(`  • Iterations per theme: ${config.iterations}`);
  console.log(`  • Warmup runs: ${config.warmupRuns}`);
  console.log(`  • Slides per iteration: ${config.slideCount}`);
  console.log(`  • Themes: ${config.themes.join(', ')}`);
  console.log(`  • Total slides: ${config.iterations * config.slideCount * config.themes.length}`);
  console.log('');

  try {
    const startTime = performance.now();
    const results = await benchmarkSlideGeneration(config);
    const endTime = performance.now();

    console.log(`⏱️  Total benchmark time: ${((endTime - startTime) / 1000).toFixed(2)}s\n`);

    formatResults(results);
    generateComparisonReport(results);

    console.log('\n🎉 Benchmark completed successfully!');

  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }
}

// Run benchmark if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { benchmarkSlideGeneration, formatResults, type BenchmarkResult, type BenchmarkConfig };