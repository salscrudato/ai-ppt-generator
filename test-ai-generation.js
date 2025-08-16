#!/usr/bin/env node

/**
 * Test script to verify AI content generation is working correctly
 */

const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5003/plsfixthx-ai/us-central1/api';

async function testAIGeneration() {
  console.log('🧪 Testing AI Content Generation...\n');

  try {
    // Test the generate endpoint with just prompt (should trigger AI generation)
    console.log('📝 Testing slide generation from prompt...');
    
    const response = await axios.post(`${BASE_URL}/generate`, {
      prompt: "Top NYC Restaurants: 20% Increase in Customer Satisfaction",
      audience: "business",
      tone: "professional", 
      industry: "hospitality",
      contentLength: "moderate",
      withImage: false
    }, {
      responseType: 'arraybuffer', // Since it returns a PowerPoint file
      timeout: 60000
    });

    console.log('✅ Response received');
    console.log('📊 Response size:', response.data.length, 'bytes');
    console.log('📄 Content type:', response.headers['content-type']);
    
    if (response.data.length < 1000) {
      console.log('⚠️ Response seems too small for a PowerPoint file');
      console.log('Raw response:', response.data.toString());
    } else {
      console.log('✅ PowerPoint file generated successfully');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data.toString());
    }
  }
}

// Test enhanced endpoint too
async function testEnhancedGeneration() {
  console.log('\n🚀 Testing Enhanced AI Generation...\n');

  try {
    const response = await axios.post(`${BASE_URL}/enhanced/slide`, {
      prompt: "Top NYC Restaurants: 20% Increase in Customer Satisfaction",
      audience: "business",
      tone: "professional",
      industry: "hospitality",
      contentLength: "moderate",
      withImage: false,
      features: {
        all: true
      }
    }, {
      timeout: 60000
    });

    console.log('✅ Enhanced generation response received');
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Enhanced test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

async function runTests() {
  await testAIGeneration();
  await testEnhancedGeneration();
}

runTests().catch(console.error);
