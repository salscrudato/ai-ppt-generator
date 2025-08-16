#!/usr/bin/env node

/**
 * Debug script to see the actual AI response and understand why content is missing
 */

const API_BASE_URL = 'https://api-rh444yt5aq-uc.a.run.app';

async function debugAIResponse() {
  console.log('🔍 Debugging AI Response Generation...\n');

  try {
    // Test with a simple, clear prompt that should generate bullets
    const testPayload = {
      prompt: 'Top 3 benefits of exercise for office workers',
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

    console.log('📤 Sending request with payload:');
    console.log(JSON.stringify(testPayload, null, 2));

    const response = await fetch(`${API_BASE_URL}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Request failed: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    
    console.log('\n📥 Full API Response:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n🔍 Detailed Analysis:');
    console.log(`Title: "${data.spec.title}"`);
    console.log(`Layout: "${data.spec.layout}"`);
    console.log(`Theme: "${data.spec.design?.theme || 'none'}"`);
    console.log(`Has Paragraph: ${!!data.spec.paragraph}`);
    console.log(`Paragraph Content: "${data.spec.paragraph || 'none'}"`);
    console.log(`Has Bullets: ${!!data.spec.bullets}`);
    console.log(`Bullets Array: ${JSON.stringify(data.spec.bullets || [])}`);
    console.log(`Bullets Count: ${data.spec.bullets?.length || 0}`);
    console.log(`Has Notes: ${!!data.spec.notes}`);
    console.log(`Notes: "${data.spec.notes || 'none'}"`);
    console.log(`Quality Score: ${data.quality?.score || 'N/A'}`);

    // Check if the issue is with the layout type
    if (data.spec.layout === 'mixed-content' && !data.spec.bullets && !data.spec.paragraph) {
      console.log('\n⚠️  Issue detected: mixed-content layout but no content generated');
    }

    if (data.spec.bullets && data.spec.bullets.length === 0) {
      console.log('\n⚠️  Issue detected: bullets array exists but is empty');
    }

  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);
    process.exit(1);
  }
}

// Run the debug
debugAIResponse();
