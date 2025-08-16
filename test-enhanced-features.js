/**
 * Enhanced Features Test Suite
 * 
 * Comprehensive test suite for all enhanced AI PowerPoint generator features
 * including AI orchestration, dynamic themes, intelligent layouts, and premium features.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://127.0.0.1:5003/plsfixthx-ai/us-central1/api';
const OUTPUT_DIR = './test-outputs';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Test data for various scenarios
 */
const TEST_SCENARIOS = {
  business: {
    prompt: "Create a quarterly business review presentation showing our company's performance, key achievements, market analysis, and strategic goals for the next quarter.",
    audience: "executives",
    tone: "professional",
    industry: "technology",
    contentLength: "comprehensive",
    withImage: true
  },
  technical: {
    prompt: "Explain the architecture of our new microservices platform, including API design, database structure, security measures, and deployment strategy.",
    audience: "technical",
    tone: "informative",
    industry: "technology",
    contentLength: "detailed",
    withImage: true
  },
  creative: {
    prompt: "Present our new brand identity including logo design, color palette, typography choices, and brand guidelines for marketing campaigns.",
    audience: "marketing",
    tone: "inspiring",
    industry: "marketing",
    contentLength: "moderate",
    withImage: true
  },
  educational: {
    prompt: "Create a training presentation about sustainable business practices, covering environmental impact, cost benefits, and implementation strategies.",
    audience: "employees",
    tone: "educational",
    industry: "consulting",
    contentLength: "comprehensive",
    withImage: true
  }
};

/**
 * Enhanced feature configurations for testing
 */
const ENHANCED_FEATURES = {
  all: {
    useIntelligentLayout: true,
    useDynamicTheme: true,
    useStorytellingFramework: true,
    enablePerformanceOptimization: true,
    enableQualityAssessment: true
  },
  minimal: {
    useIntelligentLayout: false,
    useDynamicTheme: false,
    useStorytellingFramework: false,
    enablePerformanceOptimization: true,
    enableQualityAssessment: false
  },
  layout_only: {
    useIntelligentLayout: true,
    useDynamicTheme: false,
    useStorytellingFramework: false,
    enablePerformanceOptimization: false,
    enableQualityAssessment: false
  },
  theme_only: {
    useIntelligentLayout: false,
    useDynamicTheme: true,
    useStorytellingFramework: false,
    enablePerformanceOptimization: false,
    enableQualityAssessment: false
  }
};

/**
 * Utility functions
 */
function logTest(testName, status, details = '') {
  const timestamp = new Date().toISOString();
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳';
  console.log(`[${timestamp}] ${statusIcon} ${testName} - ${status} ${details}`);
}

function saveTestResult(testName, result) {
  const filename = path.join(OUTPUT_DIR, `${testName.replace(/\s+/g, '_').toLowerCase()}_result.json`);
  fs.writeFileSync(filename, JSON.stringify(result, null, 2));
  console.log(`📁 Test result saved to: ${filename}`);
}

async function makeRequest(endpoint, data, method = 'POST') {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      timeout: 60000, // 60 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }
}

/**
 * Test 1: Enhanced Single Slide Generation
 */
async function testEnhancedSlideGeneration() {
  console.log('\n🧪 Testing Enhanced Single Slide Generation...');
  
  for (const [scenarioName, scenario] of Object.entries(TEST_SCENARIOS)) {
    for (const [featureName, features] of Object.entries(ENHANCED_FEATURES)) {
      const testName = `Enhanced Slide - ${scenarioName} - ${featureName}`;
      logTest(testName, 'RUNNING');
      
      const requestData = {
        ...scenario,
        features,
        customizations: {
          themeConfig: {
            style: scenarioName === 'creative' ? 'creative' : 'modern',
            accessibility: 'AA'
          }
        }
      };
      
      const result = await makeRequest('/enhanced/slide', requestData);
      
      if (result.success) {
        logTest(testName, 'PASS', `Quality: ${Math.round(result.data.metadata.qualityScore)}%`);
        saveTestResult(testName, result.data);
      } else {
        logTest(testName, 'FAIL', result.error);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Test 2: Enhanced Presentation Generation
 */
async function testEnhancedPresentationGeneration() {
  console.log('\n🧪 Testing Enhanced Presentation Generation...');
  
  const testScenario = TEST_SCENARIOS.business;
  const testName = 'Enhanced Presentation - Business Scenario';
  
  logTest(testName, 'RUNNING');
  
  const requestData = {
    ...testScenario,
    slideCount: 5,
    features: ENHANCED_FEATURES.all,
    customizations: {
      themeConfig: {
        style: 'corporate',
        accessibility: 'AAA'
      },
      accessibilityConfig: {
        level: 'AAA',
        features: {
          highContrast: false,
          largeText: true,
          screenReader: true,
          keyboardNavigation: true,
          colorBlindFriendly: true,
          reducedMotion: false
        },
        customizations: {
          fontSize: 16,
          lineHeight: 1.6,
          colorAdjustments: {},
          alternativeText: true
        }
      }
    }
  };
  
  const result = await makeRequest('/enhanced/presentation', requestData);
  
  if (result.success) {
    const slides = result.data.slides;
    const quality = result.data.metadata.qualityAssessment.score;
    logTest(testName, 'PASS', `${slides.length} slides, Quality: ${Math.round(quality)}%`);
    saveTestResult(testName, result.data);
  } else {
    logTest(testName, 'FAIL', result.error);
  }
}

/**
 * Test 3: Template Recommendations
 */
async function testTemplateRecommendations() {
  console.log('\n🧪 Testing Template Recommendations...');
  
  for (const [scenarioName, scenario] of Object.entries(TEST_SCENARIOS)) {
    const testName = `Template Recommendations - ${scenarioName}`;
    logTest(testName, 'RUNNING');
    
    const requestData = {
      prompt: scenario.prompt,
      audience: scenario.audience,
      tone: scenario.tone,
      industry: scenario.industry
    };
    
    const result = await makeRequest('/enhanced/templates', requestData);
    
    if (result.success) {
      const recommendations = result.data.recommendations;
      logTest(testName, 'PASS', `${recommendations.length} recommendations`);
      saveTestResult(testName, result.data);
    } else {
      logTest(testName, 'FAIL', result.error);
    }
  }
}

/**
 * Test 4: Performance Analytics
 */
async function testPerformanceAnalytics() {
  console.log('\n🧪 Testing Performance Analytics...');
  
  const testName = 'Performance Analytics';
  logTest(testName, 'RUNNING');
  
  const result = await makeRequest('/enhanced/analytics', {}, 'GET');
  
  if (result.success) {
    const analytics = result.data;
    logTest(testName, 'PASS', `${analytics.summary.totalOperations} operations tracked`);
    saveTestResult(testName, analytics);
  } else {
    logTest(testName, 'FAIL', result.error);
  }
}

/**
 * Test 5: Collaboration Features
 */
async function testCollaborationFeatures() {
  console.log('\n🧪 Testing Collaboration Features...');
  
  const testName = 'Collaboration Session Creation';
  logTest(testName, 'RUNNING');
  
  const requestData = {
    presentationId: 'test-presentation-123',
    owner: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'owner',
      isActive: true,
      lastSeen: new Date().toISOString()
    },
    permissions: {
      allowEdit: true,
      allowComment: true,
      allowExport: true,
      allowShare: true,
      allowThemeChange: true,
      allowSlideReorder: true
    }
  };
  
  const result = await makeRequest('/enhanced/collaboration', requestData);
  
  if (result.success) {
    const session = result.data;
    logTest(testName, 'PASS', `Session ID: ${session.id}`);
    saveTestResult(testName, session);
  } else {
    logTest(testName, 'FAIL', result.error);
  }
}

/**
 * Test 6: Health Check and Basic Functionality
 */
async function testBasicFunctionality() {
  console.log('\n🧪 Testing Basic Functionality...');
  
  // Health check
  const healthResult = await makeRequest('/health', {}, 'GET');
  if (healthResult.success) {
    logTest('Health Check', 'PASS', healthResult.data.status);
  } else {
    logTest('Health Check', 'FAIL', healthResult.error);
  }
  
  // Theme presets
  const themesResult = await makeRequest('/theme-presets', {}, 'GET');
  if (themesResult.success) {
    logTest('Theme Presets', 'PASS', `${themesResult.data.length} themes available`);
  } else {
    logTest('Theme Presets', 'FAIL', themesResult.error);
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting Enhanced Features Test Suite...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  
  const startTime = Date.now();
  
  try {
    // Run all test suites
    await testBasicFunctionality();
    await testEnhancedSlideGeneration();
    await testEnhancedPresentationGeneration();
    await testTemplateRecommendations();
    await testPerformanceAnalytics();
    await testCollaborationFeatures();
    
    const duration = Date.now() - startTime;
    console.log(`\n✅ Test suite completed in ${Math.round(duration / 1000)}s`);
    console.log(`📊 Check ${OUTPUT_DIR} for detailed test results`);
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

/**
 * Run tests if this file is executed directly
 */
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testEnhancedSlideGeneration,
  testEnhancedPresentationGeneration,
  testTemplateRecommendations,
  testPerformanceAnalytics,
  testCollaborationFeatures,
  testBasicFunctionality
};
