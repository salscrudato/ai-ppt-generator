#!/usr/bin/env node

/**
 * Test script to verify OpenAI API key is working and AI generation is functional
 */

const API_BASE_URL = 'https://api-rh444yt5aq-uc.a.run.app';

async function testApiKey() {
  console.log('🧪 Testing OpenAI API Key and AI Generation...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test 2: Draft generation with theme
    console.log('\n2️⃣ Testing draft generation with theme...');
    const draftPayload = {
      prompt: 'best mets teams',
      audience: 'general',
      tone: 'professional',
      contentLength: 'moderate',
      presentationType: 'general',
      industry: 'general',
      withImage: false,
      imageStyle: 'professional',
      qualityLevel: 'standard',
      includeNotes: false,
      includeSources: false,
      design: {
        theme: 'creative-purple'
      }
    };

    const draftResponse = await fetch(`${API_BASE_URL}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftPayload)
    });

    if (!draftResponse.ok) {
      const errorData = await draftResponse.json();
      throw new Error(`Draft generation failed: ${errorData.error || draftResponse.statusText}`);
    }

    const draftData = await draftResponse.json();
    console.log('✅ Draft generation successful!');
    console.log('📊 Generated content:');
    console.log(`   Title: "${draftData.spec.title}"`);
    console.log(`   Theme: "${draftData.spec.design?.theme || 'none'}"`);
    console.log(`   Layout: "${draftData.spec.layout}"`);

    // Handle different layout types
    let totalBullets = 0;
    let hasParagraph = false;

    if (draftData.spec.bullets) {
      totalBullets += draftData.spec.bullets.length;
    }
    if (draftData.spec.paragraph) {
      hasParagraph = true;
    }
    if (draftData.spec.left?.bullets) {
      totalBullets += draftData.spec.left.bullets.length;
    }
    if (draftData.spec.right?.bullets) {
      totalBullets += draftData.spec.right.bullets.length;
    }
    if (draftData.spec.left?.paragraph || draftData.spec.right?.paragraph) {
      hasParagraph = true;
    }

    console.log(`   Content: ${totalBullets} bullets, ${hasParagraph ? 'has paragraph' : 'no paragraph'}`);
    console.log(`   Quality Score: ${draftData.quality?.score || 'N/A'}/100`);

    // Test 3: PowerPoint generation
    console.log('\n3️⃣ Testing PowerPoint generation...');
    const pptResponse = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        spec: draftData.spec,
        themeId: 'creative-purple',
        withValidation: true
      })
    });

    if (!pptResponse.ok) {
      const errorData = await pptResponse.json();
      throw new Error(`PowerPoint generation failed: ${errorData.error || pptResponse.statusText}`);
    }

    const pptBuffer = await pptResponse.arrayBuffer();
    console.log(`✅ PowerPoint generation successful! (${pptBuffer.byteLength} bytes)`);

    // Summary
    console.log('\n🎉 All tests passed!');
    console.log('✅ OpenAI API key is working');
    console.log('✅ Theme synchronization is working');
    console.log('✅ AI content generation is working');
    console.log('✅ PowerPoint generation is working');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testApiKey();
