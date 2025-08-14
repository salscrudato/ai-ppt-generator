const https = require('https');

// Test slide spec with mixed-content layout and paragraph text
const testSlideSpec = {
  title: "Test Slide with Text Content",
  layout: "mixed-content",
  paragraph: "This is a test paragraph to see if text content is being rendered correctly in the PowerPoint. It should appear on the left side of the slide with an image on the right side.",
  bullets: ["First bullet point", "Second bullet point", "Third bullet point"],
  right: {
    imagePrompt: "A simple test image showing colorful geometric shapes"
  },
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

console.log('🧪 Testing PowerPoint generation with mixed-content layout...');
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
