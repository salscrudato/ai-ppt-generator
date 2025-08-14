const https = require('https');

// Test slide spec with mixed-content layout and paragraph text (NO IMAGE)
const testSlideSpec = {
  title: "Test Slide - Text Only",
  layout: "mixed-content",
  paragraph: "This is a test paragraph to see if text content is being rendered correctly in the PowerPoint. This test has no image to isolate the text rendering issue.",
  bullets: ["First bullet point", "Second bullet point", "Third bullet point"],
  design: {
    layout: "mixed-content",
    adaptive: true
  }
};

// API endpoint
const apiUrl = 'https://api-rh444yt5aq-uc.a.run.app/generate';

const postData = JSON.stringify({
  spec: testSlideSpec,
  themeId: 'corporate-blue',
  withValidation: true
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing PowerPoint generation with text-only mixed-content layout...');
console.log('📋 Slide spec:', JSON.stringify(testSlideSpec, null, 2));

const req = https.request(apiUrl, options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ PowerPoint generated successfully!');
      console.log(`📁 Content-Length: ${res.headers['content-length']} bytes`);
      console.log(`📄 Content-Type: ${res.headers['content-type']}`);
    } else {
      console.log('❌ Error generating PowerPoint:');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
});

req.write(postData);
req.end();
