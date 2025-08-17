#!/usr/bin/env node

/**
 * Basic Functionality Test
 * 
 * Simple test to verify core PowerPoint generation is working
 * after codebase optimization and simplification.
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const CONFIG = {
  apiBaseUrl: 'http://localhost:5001/plsfixthx-ai/us-central1/api',
  timeout: 30000,
  outputDir: './test-output'
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

/**
 * Test basic slide generation
 */
async function testBasicSlideGeneration() {
  console.log('\n🧪 Testing Basic Slide Generation...');
  
  try {
    const response = await fetch(`${CONFIG.apiBaseUrl}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Create a slide about quarterly sales results showing 25% growth',
        audience: 'executives',
        tone: 'professional',
        contentLength: 'brief'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Slide generation successful');
    console.log(`   Title: ${data.spec?.title || 'N/A'}`);
    console.log(`   Layout: ${data.spec?.layout || 'N/A'}`);
    console.log(`   Has bullets: ${data.spec?.bullets ? 'Yes' : 'No'}`);
    
    return data.spec;
  } catch (error) {
    console.error('❌ Slide generation failed:', error.message);
    throw error;
  }
}

/**
 * Test PowerPoint file generation
 */
async function testPowerPointGeneration(slideSpec) {
  console.log('\n🎯 Testing PowerPoint File Generation...');
  
  try {
    const response = await fetch(`${CONFIG.apiBaseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spec: slideSpec,
        themeId: 'corporate-blue',
        withValidation: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PowerPoint generation failed: ${errorData.error || response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const outputPath = path.join(CONFIG.outputDir, 'basic-test.pptx');
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    
    const stats = fs.statSync(outputPath);
    console.log('✅ PowerPoint generation successful');
    console.log(`   File: ${outputPath}`);
    console.log(`   Size: ${Math.round(stats.size / 1024)}KB`);
    
    return outputPath;
  } catch (error) {
    console.error('❌ PowerPoint generation failed:', error.message);
    throw error;
  }
}

/**
 * Test health endpoint
 */
async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint...');
  
  try {
    const response = await fetch(`${CONFIG.apiBaseUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Health check successful');
    console.log(`   Status: ${data.status}`);
    console.log(`   Version: ${data.version}`);
    console.log(`   API Key: ${data.apiKeyStatus}`);
    
    return data;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    throw error;
  }
}

/**
 * Main test runner
 */
async function runBasicTests() {
  console.log('🚀 Starting Basic Functionality Tests');
  console.log('=====================================');
  
  const startTime = Date.now();
  let passed = 0;
  let failed = 0;
  
  const tests = [
    { name: 'Health Check', fn: testHealthEndpoint },
    { name: 'Slide Generation', fn: testBasicSlideGeneration },
  ];
  
  let slideSpec = null;
  
  for (const test of tests) {
    try {
      console.log(`\n📋 Running: ${test.name}`);
      const result = await test.fn();
      if (test.name === 'Slide Generation') {
        slideSpec = result;
      }
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error.message);
      failed++;
    }
  }
  
  // Only test PowerPoint generation if slide generation succeeded
  if (slideSpec) {
    try {
      console.log(`\n📋 Running: PowerPoint Generation`);
      await testPowerPointGeneration(slideSpec);
      passed++;
    } catch (error) {
      console.error(`❌ PowerPoint Generation failed:`, error.message);
      failed++;
    }
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('\n📊 Test Results');
  console.log('================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`📁 Output: ${CONFIG.outputDir}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Core functionality is working.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runBasicTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runBasicTests, testBasicSlideGeneration, testPowerPointGeneration, testHealthEndpoint };
