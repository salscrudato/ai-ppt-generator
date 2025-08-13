#!/usr/bin/env node

/**
 * AI PowerPoint Generator - Comprehensive Test Suite
 *
 * Optimized testing framework for validating the complete application stack.
 * Provides automated testing for build processes, API endpoints, and core
 * functionality with detailed reporting and error handling.
 *
 * Features:
 * - Build verification for frontend and backend
 * - API endpoint testing with realistic scenarios
 * - Performance monitoring and validation
 * - Comprehensive error reporting
 * - Flexible test execution options
 *
 * Usage:
 *   node test-app.js                 # Run all tests
 *   node test-app.js --api-only      # Test API endpoints only
 *   node test-app.js --build-only    # Test build processes only
 *   node test-app.js --verbose       # Detailed output
 *
 * @version 3.1.0-optimized
 * @author AI PowerPoint Generator Team
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Optimized test configuration
const CONFIG = {
  apiBaseUrl: 'http://localhost:5001/plsfixthx-ai/us-central1/api',
  timeout: 30000, // 30 seconds for API calls
  testOutputDir: './test-outputs',
  maxRetries: 3, // Retry failed tests
  retryDelay: 2000 // 2 seconds between retries
};

// Enhanced test scenarios for comprehensive API validation
const TEST_SCENARIOS = [
  {
    name: 'Basic Slide Generation',
    endpoint: '/draft',
    payload: {
      prompt: 'Create a slide about quarterly sales results showing 25% growth',
      audience: 'executives',
      tone: 'professional',
      contentLength: 'brief'
    },
    expectedFields: ['title', 'layout', 'paragraph']
  },
  {
    name: 'Technical Presentation',
    endpoint: '/draft',
    payload: {
      prompt: 'Explain microservices architecture benefits and implementation strategy',
      audience: 'technical',
      tone: 'professional',
      contentLength: 'detailed'
    },
    expectedFields: ['title', 'layout', 'bullets']
  },
  {
    name: 'Creative Marketing Slide',
    endpoint: '/draft',
    payload: {
      prompt: 'Design a slide showcasing our new product launch with emotional appeal',
      audience: 'marketing',
      tone: 'inspiring',
      contentLength: 'moderate',
      withImage: true,
      industry: 'marketing'
    },
    expectedFields: ['title', 'layout', 'right']
  },
  {
    name: 'Healthcare Presentation',
    endpoint: '/draft',
    payload: {
      prompt: 'Present patient safety protocols and compliance requirements',
      audience: 'healthcare',
      tone: 'professional',
      contentLength: 'comprehensive',
      industry: 'healthcare',
      presentationType: 'training'
    },
    expectedFields: ['title', 'layout', 'bullets', 'notes']
  },
  {
    name: 'Financial Report',
    endpoint: '/draft',
    payload: {
      prompt: 'Show Q3 financial performance with key metrics and projections',
      audience: 'investors',
      tone: 'analytical',
      contentLength: 'detailed',
      industry: 'finance',
      presentationType: 'report'
    },
    expectedFields: ['title', 'layout']
  }
];

/**
 * Utility functions
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || '📋';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function runCommand(command, cwd = process.cwd()) {
  try {
    const result = execSync(command, { 
      cwd, 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout };
  }
}

/**
 * Enhanced test execution function with comprehensive validation
 */
async function runTest(scenario) {
  console.log(`\n🧪 Testing: ${scenario.name}`);
  console.log(`📍 Endpoint: ${scenario.endpoint}`);
  console.log(`📝 Payload:`, JSON.stringify(scenario.payload, null, 2));

  try {
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}${scenario.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenario.payload)
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Success (${duration}ms)`);

      // Validate expected fields
      const validationResults = validateResponse(data, scenario.expectedFields || []);
      if (validationResults.isValid) {
        console.log(`✅ Response validation passed`);
      } else {
        console.log(`⚠️ Response validation issues:`, validationResults.issues);
      }

      // Performance check
      if (duration > 30000) {
        console.log(`⚠️ Slow response: ${duration}ms (>30s)`);
      } else if (duration > 15000) {
        console.log(`⚠️ Moderate response time: ${duration}ms (>15s)`);
      }

      console.log(`📊 Response structure:`, getResponseStructure(data));
      return {
        success: true,
        duration,
        data,
        validation: validationResults,
        performanceGrade: getPerformanceGrade(duration)
      };
    } else {
      console.log(`❌ Failed (${response.status})`);
      console.log(`📊 Error:`, JSON.stringify(data, null, 2));
      return { success: false, duration, error: data, statusCode: response.status };
    }
  } catch (error) {
    console.log(`💥 Exception:`, error.message);
    return { success: false, error: error.message };
  }
}

// Response validation function
function validateResponse(data, expectedFields) {
  const issues = [];
  let isValid = true;

  // Check for expected fields
  expectedFields.forEach(field => {
    if (!hasNestedProperty(data, field)) {
      issues.push(`Missing expected field: ${field}`);
      isValid = false;
    }
  });

  // Validate slide structure if it's a slide response
  if (data.title) {
    if (typeof data.title !== 'string' || data.title.length < 5) {
      issues.push('Title should be a string with at least 5 characters');
      isValid = false;
    }

    if (!data.layout) {
      issues.push('Layout field is required');
      isValid = false;
    }

    // Check content presence
    const hasContent = data.paragraph || data.bullets || data.left || data.right;
    if (!hasContent) {
      issues.push('Slide should have some content (paragraph, bullets, or columns)');
      isValid = false;
    }
  }

  return { isValid, issues };
}

// Helper function to check nested properties
function hasNestedProperty(obj, path) {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return false;
    }
    current = current[key];
  }

  return true;
}

// Get response structure for logging
function getResponseStructure(obj, depth = 0, maxDepth = 2) {
  if (depth > maxDepth || obj === null || typeof obj !== 'object') {
    return typeof obj;
  }

  if (Array.isArray(obj)) {
    return `Array(${obj.length})`;
  }

  const structure = {};
  for (const key in obj) {
    structure[key] = getResponseStructure(obj[key], depth + 1, maxDepth);
  }

  return structure;
}

// Performance grading
function getPerformanceGrade(duration) {
  if (duration < 5000) return 'A';
  if (duration < 10000) return 'B';
  if (duration < 20000) return 'C';
  if (duration < 30000) return 'D';
  return 'F';
}

/**
 * Test build processes
 */
async function testBuilds() {
  log('Testing build processes...');
  
  // Test frontend build
  log('Building frontend...');
  const frontendBuild = runCommand('npm run build', './frontend');
  if (!frontendBuild.success) {
    throw new Error(`Frontend build failed: ${frontendBuild.error}`);
  }
  log('Frontend build successful', 'success');
  
  // Test backend build
  log('Building backend functions...');
  const backendBuild = runCommand('npm run build', './functions');
  if (!backendBuild.success) {
    throw new Error(`Backend build failed: ${backendBuild.error}`);
  }
  log('Backend build successful', 'success');
}

/**
 * Test API endpoints
 */
async function testAPI() {
  log('Testing API endpoints...');
  
  // Test health endpoint
  try {
    const healthResponse = await fetch(`${CONFIG.apiBaseUrl}/health`);
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }
    const healthData = await healthResponse.json();
    log(`Health check passed - Version: ${healthData.version}`, 'success');
  } catch (error) {
    log(`Health check failed: ${error.message}`, 'error');
    throw error;
  }
  
  // Test slide generation endpoints
  for (const scenario of TEST_SCENARIOS) {
    log(`Testing: ${scenario.name}`);
    
    try {
      const response = await fetch(`${CONFIG.apiBaseUrl}${scenario.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario.payload)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate response structure
      if (!data.title || !data.layout) {
        throw new Error('Invalid response structure - missing required fields');
      }
      
      log(`${scenario.name} - Success: Generated "${data.title}" with ${data.layout} layout`, 'success');
      
    } catch (error) {
      log(`${scenario.name} - Failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  const args = process.argv.slice(2);
  const buildOnly = args.includes('--build-only');
  const apiOnly = args.includes('--api-only');
  
  log('🧪 Starting AI PowerPoint Generator Test Suite');
  log('==============================================');
  
  try {
    if (!apiOnly) {
      await testBuilds();
    }
    
    if (!buildOnly) {
      log('⚠️  API tests require the development server to be running', 'warning');
      log('   Start with: ./start-dev.sh');
      await testAPI();
    }
    
    log('🎉 All tests passed successfully!', 'success');
    process.exit(0);
    
  } catch (error) {
    log(`Test suite failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests, testBuilds, testAPI };
