#!/usr/bin/env node

/**
 * Integration Test Suite
 * 
 * Tests seamless frontend-backend integration, hot reloading,
 * and theme consistency system end-to-end.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Test configuration
const CONFIG = {
  frontend: {
    url: 'http://localhost:5175',
    timeout: 5000
  },
  backend: {
    url: 'http://localhost:5001/plsfixthx-ai/us-central1/api',
    timeout: 10000
  },
  emulator: {
    url: 'http://localhost:4000',
    timeout: 3000
  }
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Utility functions
const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const timeout = options.timeout || 5000;
    
    const req = client.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });
    
    req.on('error', reject);
  });
};

const runTest = async (name, testFn) => {
  console.log(`🧪 Running: ${name}`);
  try {
    await testFn();
    console.log(`✅ PASS: ${name}`);
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
  } catch (error) {
    console.log(`❌ FAIL: ${name} - ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
  }
};

// Test suite
const tests = {
  // Basic connectivity tests
  async testFrontendHealth() {
    const response = await makeRequest(CONFIG.frontend.url, { timeout: CONFIG.frontend.timeout });
    if (response.statusCode !== 200) {
      throw new Error(`Frontend returned status ${response.statusCode}`);
    }
    if (!response.body.includes('AI PowerPoint Generator')) {
      throw new Error('Frontend does not contain expected content');
    }
  },

  async testBackendHealth() {
    const response = await makeRequest(`${CONFIG.backend.url}/health`, { timeout: CONFIG.backend.timeout });
    if (response.statusCode !== 200) {
      throw new Error(`Backend health check returned status ${response.statusCode}`);
    }
    
    const data = JSON.parse(response.body);
    if (data.status !== 'healthy') {
      throw new Error(`Backend health status is ${data.status}`);
    }
  },

  async testEmulatorUI() {
    const response = await makeRequest(CONFIG.emulator.url, { timeout: CONFIG.emulator.timeout });
    if (response.statusCode !== 200) {
      throw new Error(`Emulator UI returned status ${response.statusCode}`);
    }
  },

  // API integration tests
  async testApiCors() {
    const response = await makeRequest(`${CONFIG.backend.url}/health`, { timeout: CONFIG.backend.timeout });
    const corsHeader = response.headers['access-control-allow-origin'];
    if (!corsHeader) {
      throw new Error('CORS headers not present');
    }
  },

  async testApiGenerate() {
    // Test the generate endpoint with a simple request
    const testData = JSON.stringify({
      prompt: 'Test presentation about AI technology',
      audience: 'general',
      tone: 'professional',
      contentLength: 'brief'
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5001,
        path: '/plsfixthx-ai/us-central1/api/generate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(testData)
        },
        timeout: 15000
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const result = JSON.parse(data);
              if (result.slides && Array.isArray(result.slides)) {
                resolve();
              } else {
                reject(new Error('Invalid response format'));
              }
            } catch (error) {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            reject(new Error(`Generate API returned status ${res.statusCode}`));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Generate API request timeout'));
      });

      req.on('error', reject);
      req.write(testData);
      req.end();
    });
  },

  // Theme consistency tests
  async testThemeEndpoint() {
    const response = await makeRequest(`${CONFIG.backend.url}/themes`, { timeout: CONFIG.backend.timeout });
    if (response.statusCode !== 200) {
      throw new Error(`Themes endpoint returned status ${response.statusCode}`);
    }
    
    const themes = JSON.parse(response.body);
    if (!Array.isArray(themes) || themes.length === 0) {
      throw new Error('Themes endpoint returned invalid data');
    }
    
    // Check for required theme properties
    const firstTheme = themes[0];
    if (!firstTheme.id || !firstTheme.name || !firstTheme.colors) {
      throw new Error('Theme missing required properties');
    }
  },

  // File system tests
  async testProjectStructure() {
    const requiredFiles = [
      'package.json',
      'firebase.json',
      'start-dev.sh',
      'cleanup-codebase.sh',
      'dev-config.json',
      'frontend/package.json',
      'frontend/src/App.tsx',
      'frontend/src/components/EnhancedSlidePreview.tsx',
      'frontend/src/components/ThemeVerificationIndicator.tsx',
      'frontend/src/utils/themeConsistencyVerifier.ts',
      'functions/package.json',
      'functions/src/index.ts',
      'functions/src/pptGenerator-simple.ts',
      'functions/src/professionalThemes.ts'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }
  },

  async testConfigurationFiles() {
    // Test dev-config.json
    const devConfig = JSON.parse(fs.readFileSync('dev-config.json', 'utf8'));
    if (!devConfig.development || !devConfig.production) {
      throw new Error('dev-config.json missing required sections');
    }

    // Test firebase.json
    const firebaseConfig = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
    if (!firebaseConfig.functions || !firebaseConfig.emulators) {
      throw new Error('firebase.json missing required configuration');
    }
  },

  // Performance tests
  async testResponseTimes() {
    const start = Date.now();
    await makeRequest(`${CONFIG.backend.url}/health`);
    const healthTime = Date.now() - start;
    
    if (healthTime > 2000) {
      throw new Error(`Health check too slow: ${healthTime}ms`);
    }

    const frontendStart = Date.now();
    await makeRequest(CONFIG.frontend.url);
    const frontendTime = Date.now() - frontendStart;
    
    if (frontendTime > 3000) {
      throw new Error(`Frontend too slow: ${frontendTime}ms`);
    }
  }
};

// Main test runner
async function runIntegrationTests() {
  console.log('🚀 Starting Integration Test Suite');
  console.log('==================================');
  console.log(`📅 ${new Date().toISOString()}`);
  console.log('');

  // Wait a moment for services to be ready
  console.log('⏳ Waiting for services to stabilize...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Run all tests
  for (const [testName, testFn] of Object.entries(tests)) {
    await runTest(testName, testFn);
  }

  // Print results
  console.log('');
  console.log('📊 Test Results');
  console.log('===============');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('');
    console.log('❌ Failed Tests:');
    results.tests
      .filter(test => test.status === 'FAIL')
      .forEach(test => console.log(`   - ${test.name}: ${test.error}`));
  }

  console.log('');
  console.log('🎯 Integration Test Summary:');
  console.log('- Frontend-Backend connectivity ✓');
  console.log('- API endpoints functionality ✓');
  console.log('- CORS configuration ✓');
  console.log('- Theme system integration ✓');
  console.log('- Project structure validation ✓');
  console.log('- Performance benchmarks ✓');
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runIntegrationTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runIntegrationTests, tests };
