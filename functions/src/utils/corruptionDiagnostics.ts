/**
 * PowerPoint Corruption Diagnostics
 * 
 * Advanced diagnostic tools to identify, analyze, and fix PowerPoint corruption issues.
 * This module provides real-time corruption detection, detailed analysis, and automated fixes.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { logger, type LogContext } from './smartLogger';
import { SlideSpec } from '../schema';

// ============================================================================
// CORRUPTION DETECTION TYPES
// ============================================================================

export interface CorruptionIssue {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'structure' | 'content' | 'buffer' | 'layout' | 'theme' | 'validation';
  title: string;
  description: string;
  slideIndex?: number;
  slideSpec?: any;
  bufferInfo?: {
    size: number;
    signature: string;
    isValid: boolean;
  };
  suggestedFix: string;
  autoFixAvailable: boolean;
  context: LogContext;
}

export interface DiagnosticReport {
  id: string;
  timestamp: string;
  presentationTitle: string;
  slideCount: number;
  issues: CorruptionIssue[];
  overallHealth: 'healthy' | 'warning' | 'critical';
  recommendations: string[];
  fixesApplied: string[];
}

// ============================================================================
// CORRUPTION DIAGNOSTICS CLASS
// ============================================================================

export class CorruptionDiagnostics {
  private issues: CorruptionIssue[] = [];
  private reports: DiagnosticReport[] = [];

  /**
   * Analyze slide specifications for potential corruption issues
   */
  analyzeSlideSpecs(specs: SlideSpec[], context: LogContext): CorruptionIssue[] {
    const issues: CorruptionIssue[] = [];
    
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      const slideContext = { ...context, slideIndex: i };
      
      // Check for missing or invalid title
      if (!spec.title || typeof spec.title !== 'string' || spec.title.trim() === '') {
        issues.push(this.createIssue(
          'critical',
          'structure',
          'Missing or Invalid Slide Title',
          `Slide ${i + 1} has missing or invalid title which can cause corruption`,
          slideContext,
          'Ensure all slides have valid, non-empty string titles',
          true,
          i,
          spec
        ));
      }
      
      // Check for invalid layout
      const validLayouts = ['title', 'title-bullets', 'title-paragraph', 'two-column', 'mixed-content', 'chart', 'quote'];
      if (!spec.layout || !validLayouts.includes(spec.layout)) {
        issues.push(this.createIssue(
          'high',
          'layout',
          'Invalid Layout Type',
          `Slide ${i + 1} has invalid layout '${spec.layout}' which may cause corruption`,
          slideContext,
          `Use one of the valid layouts: ${validLayouts.join(', ')}`,
          true,
          i,
          spec
        ));
      }
      
      // Check mixed-content structure
      if (spec.layout === 'mixed-content') {
        const specAny = spec as any;
        
        if (!specAny.left && !specAny.right && !spec.paragraph && !spec.bullets) {
          issues.push(this.createIssue(
            'high',
            'content',
            'Empty Mixed-Content Slide',
            `Slide ${i + 1} has mixed-content layout but no content structure`,
            slideContext,
            'Add left/right content structure or fallback to paragraph/bullets',
            true,
            i,
            spec
          ));
        }
        
        if (specAny.left && typeof specAny.left !== 'object') {
          issues.push(this.createIssue(
            'medium',
            'structure',
            'Invalid Left Column Structure',
            `Slide ${i + 1} has invalid left column structure`,
            slideContext,
            'Ensure left column is an object with type and content properties',
            true,
            i,
            spec
          ));
        }
        
        if (specAny.right && typeof specAny.right !== 'object') {
          issues.push(this.createIssue(
            'medium',
            'structure',
            'Invalid Right Column Structure',
            `Slide ${i + 1} has invalid right column structure`,
            slideContext,
            'Ensure right column is an object with type and content properties',
            true,
            i,
            spec
          ));
        }
      }
      
      // Check for excessively long content that might cause issues
      if (spec.title && spec.title.length > 200) {
        issues.push(this.createIssue(
          'low',
          'content',
          'Excessively Long Title',
          `Slide ${i + 1} title is very long (${spec.title.length} characters)`,
          slideContext,
          'Consider shortening the title to under 200 characters',
          false,
          i,
          spec
        ));
      }
      
      if (spec.paragraph && spec.paragraph.length > 2000) {
        issues.push(this.createIssue(
          'low',
          'content',
          'Excessively Long Paragraph',
          `Slide ${i + 1} paragraph is very long (${spec.paragraph.length} characters)`,
          slideContext,
          'Consider breaking long paragraphs into bullet points or multiple slides',
          false,
          i,
          spec
        ));
      }
      
      // Check for too many bullets
      if (spec.bullets && spec.bullets.length > 10) {
        issues.push(this.createIssue(
          'medium',
          'content',
          'Too Many Bullet Points',
          `Slide ${i + 1} has ${spec.bullets.length} bullet points which may cause layout issues`,
          slideContext,
          'Consider limiting bullet points to 7-8 maximum for better readability',
          false,
          i,
          spec
        ));
      }
      
      // Check for special characters that might cause encoding issues
      const problematicChars = /[^\x00-\x7F]/g;
      if (spec.title && problematicChars.test(spec.title)) {
        issues.push(this.createIssue(
          'low',
          'content',
          'Special Characters in Title',
          `Slide ${i + 1} title contains special characters that might cause encoding issues`,
          slideContext,
          'Consider using standard ASCII characters or ensure proper encoding',
          false,
          i,
          spec
        ));
      }
    }
    
    return issues;
  }

  /**
   * Analyze buffer for corruption issues
   */
  analyzeBuffer(buffer: Buffer, context: LogContext): CorruptionIssue[] {
    const issues: CorruptionIssue[] = [];
    
    // Check buffer validity
    if (!buffer || buffer.length === 0) {
      issues.push(this.createIssue(
        'critical',
        'buffer',
        'Empty or Null Buffer',
        'Generated buffer is empty or null',
        context,
        'Check PowerPoint generation process for errors',
        false
      ));
      return issues;
    }
    
    // Check ZIP signature
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    const signatureValid = signature.equals(expectedSignature);
    
    if (!signatureValid) {
      issues.push(this.createIssue(
        'critical',
        'buffer',
        'Invalid ZIP Signature',
        'PowerPoint file has invalid ZIP signature',
        context,
        'Regenerate the PowerPoint file - current file is corrupted',
        false,
        undefined,
        undefined,
        {
          size: buffer.length,
          signature: Array.from(signature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
          isValid: false
        }
      ));
    }
    
    // Check minimum file size
    if (buffer.length < 1000) {
      issues.push(this.createIssue(
        'high',
        'buffer',
        'File Too Small',
        `PowerPoint file is suspiciously small (${buffer.length} bytes)`,
        context,
        'Check slide content and generation process',
        false,
        undefined,
        undefined,
        {
          size: buffer.length,
          signature: signatureValid ? 'valid' : 'invalid',
          isValid: signatureValid
        }
      ));
    }
    
    // Check maximum reasonable file size (100MB)
    if (buffer.length > 100 * 1024 * 1024) {
      issues.push(this.createIssue(
        'medium',
        'buffer',
        'File Unusually Large',
        `PowerPoint file is very large (${Math.round(buffer.length / 1024 / 1024)}MB)`,
        context,
        'Consider optimizing images and content to reduce file size',
        false,
        undefined,
        undefined,
        {
          size: buffer.length,
          signature: signatureValid ? 'valid' : 'invalid',
          isValid: signatureValid
        }
      ));
    }
    
    return issues;
  }

  /**
   * Generate comprehensive diagnostic report
   */
  generateReport(
    presentationTitle: string,
    specs: SlideSpec[],
    buffer?: Buffer,
    context: LogContext = {}
  ): DiagnosticReport {
    const reportId = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const issues: CorruptionIssue[] = [];
    
    // Analyze slide specifications
    issues.push(...this.analyzeSlideSpecs(specs, context));
    
    // Analyze buffer if provided
    if (buffer) {
      issues.push(...this.analyzeBuffer(buffer, context));
    }
    
    // Determine overall health
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const highIssues = issues.filter(i => i.severity === 'high');
    
    let overallHealth: 'healthy' | 'warning' | 'critical';
    if (criticalIssues.length > 0) {
      overallHealth = 'critical';
    } else if (highIssues.length > 0 || issues.length > 5) {
      overallHealth = 'warning';
    } else {
      overallHealth = 'healthy';
    }
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(issues);
    
    // Apply auto-fixes
    const fixesApplied = this.applyAutoFixes(issues, specs);
    
    const report: DiagnosticReport = {
      id: reportId,
      timestamp: new Date().toISOString(),
      presentationTitle,
      slideCount: specs.length,
      issues,
      overallHealth,
      recommendations,
      fixesApplied
    };
    
    this.reports.push(report);
    
    // Log the report
    logger.info(`Corruption diagnostic report generated`, context, {
      reportId,
      presentationTitle,
      issueCount: issues.length,
      overallHealth,
      criticalIssues: criticalIssues.length,
      highIssues: highIssues.length,
      fixesApplied: fixesApplied.length
    });
    
    return report;
  }

  private createIssue(
    severity: 'low' | 'medium' | 'high' | 'critical',
    type: 'structure' | 'content' | 'buffer' | 'layout' | 'theme' | 'validation',
    title: string,
    description: string,
    context: LogContext,
    suggestedFix: string,
    autoFixAvailable: boolean,
    slideIndex?: number,
    slideSpec?: any,
    bufferInfo?: { size: number; signature: string; isValid: boolean }
  ): CorruptionIssue {
    return {
      id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      severity,
      type,
      title,
      description,
      slideIndex,
      slideSpec,
      bufferInfo,
      suggestedFix,
      autoFixAvailable,
      context
    };
  }

  private generateRecommendations(issues: CorruptionIssue[]): string[] {
    const recommendations: string[] = [];
    
    if (issues.some(i => i.type === 'layout')) {
      recommendations.push('Review slide layouts and ensure they match supported types');
    }
    
    if (issues.some(i => i.type === 'structure')) {
      recommendations.push('Validate slide structure before generation');
    }
    
    if (issues.some(i => i.type === 'content')) {
      recommendations.push('Review content length and complexity');
    }
    
    if (issues.some(i => i.type === 'buffer')) {
      recommendations.push('Check PowerPoint generation process for errors');
    }
    
    if (issues.filter(i => i.severity === 'critical').length > 0) {
      recommendations.push('Address critical issues immediately to prevent corruption');
    }
    
    return recommendations;
  }

  private applyAutoFixes(issues: CorruptionIssue[], specs: SlideSpec[]): string[] {
    const fixesApplied: string[] = [];
    
    for (const issue of issues) {
      if (!issue.autoFixAvailable || issue.slideIndex === undefined) continue;
      
      const spec = specs[issue.slideIndex];
      if (!spec) continue;
      
      switch (issue.type) {
        case 'structure':
          if (issue.title.includes('Missing or Invalid Slide Title')) {
            if (!spec.title || spec.title.trim() === '') {
              spec.title = `Slide ${issue.slideIndex + 1}`;
              fixesApplied.push(`Fixed missing title for slide ${issue.slideIndex + 1}`);
            }
          }
          break;
          
        case 'layout':
          if (issue.title.includes('Invalid Layout Type')) {
            spec.layout = 'title-bullets'; // Safe default
            fixesApplied.push(`Fixed invalid layout for slide ${issue.slideIndex + 1}`);
          }
          break;
          
        case 'content':
          if (issue.title.includes('Empty Mixed-Content Slide')) {
            // Convert to title-paragraph layout if no content structure
            spec.layout = 'title-paragraph';
            if (!spec.paragraph) {
              spec.paragraph = 'Content will be added here.';
            }
            fixesApplied.push(`Fixed empty mixed-content slide ${issue.slideIndex + 1}`);
          }
          break;
      }
    }
    
    return fixesApplied;
  }

  /**
   * Get recent diagnostic reports
   */
  getRecentReports(count: number = 10): DiagnosticReport[] {
    return this.reports.slice(-count);
  }

  /**
   * Get issues by severity
   */
  getIssuesBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): CorruptionIssue[] {
    return this.issues.filter(issue => issue.severity === severity);
  }

  /**
   * Validate a generated PowerPoint file
   */
  validateGeneratedFile(buffer: Buffer, context: LogContext = {}): {
    passed: boolean;
    issues: CorruptionIssue[];
    report: DiagnosticReport;
  } {
    // Analyze the buffer for issues
    const issues = this.analyzeBuffer(buffer, context);

    // Generate a diagnostic report
    const report = this.generateReport(
      'Generated File Validation',
      [], // No slide specs available for this validation
      buffer,
      context
    );

    // File passes validation if there are no critical issues
    const passed = !issues.some(issue => issue.severity === 'critical');

    return {
      passed,
      issues,
      report
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const corruptionDiagnostics = new CorruptionDiagnostics();
export default corruptionDiagnostics;
