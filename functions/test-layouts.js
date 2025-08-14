const https = require('https');

// Test various layout types and content scenarios
const layoutTests = [
  {
    name: "Timeline Layout Test",
    params: {
      prompt: "History of Apple Inc from founding to present day with major milestones",
      audience: "general",
      tone: "educational",
      contentLength: "detailed",
      withImage: false
    }
  },
  {
    name: "Comparison Table Test",
    params: {
      prompt: "Compare iPhone vs Samsung Galaxy features, pricing, and market share",
      audience: "executives",
      tone: "analytical",
      contentLength: "moderate",
      withImage: false
    }
  },
  {
    name: "Chart/Data Visualization Test",
    params: {
      prompt: "Quarterly sales performance data showing growth trends across different product lines",
      audience: "executives",
      tone: "professional",
      contentLength: "brief",
      withImage: false
    }
  },
  {
    name: "Process Flow Test",
    params: {
      prompt: "Software development lifecycle from requirements gathering to deployment",
      audience: "technical",
      tone: "professional",
      contentLength: "detailed",
      withImage: false
    }
  },
  {
    name: "Problem-Solution Layout Test",
    params: {
      prompt: "Customer service response time issues and our new AI chatbot solution",
      audience: "executives",
      tone: "persuasive",
      contentLength: "moderate",
      withImage: true
    }
  }
];

// API endpoints
const draftUrl = 'https://api-rh444yt5aq-uc.a.run.app/draft';
const generateUrl = 'https://api-rh444yt5aq-uc.a.run.app/generate';

async function testLayoutGeneration(testCase) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testCase.params);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📋 Parameters:`, JSON.stringify(testCase.params, null, 2));

    const req = https.request(draftUrl, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            console.log(`✅ Draft Success! Layout: ${result.layout}`);
            console.log(`📊 Title: "${result.title}"`);
            console.log(`📝 Content Structure:`, {
              hasParagraph: !!result.paragraph,
              hasBullets: !!result.bullets,
              bulletsCount: result.bullets?.length,
              hasLeft: !!result.left,
              hasRight: !!result.right,
              hasChart: !!result.chart,
              hasTimeline: !!result.timeline,
              hasComparisonTable: !!result.comparisonTable,
              hasProcessSteps: !!result.processSteps
            });
            
            // Test PowerPoint generation
            testPowerPointGeneration(result).then(() => {
              resolve(result);
            }).catch(reject);
          } catch (error) {
            console.log(`❌ JSON Parse Error:`, error.message);
            reject(error);
          }
        } else {
          console.log(`❌ Draft Error! Status: ${res.statusCode}`);
          console.log(`📄 Response:`, data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request error:`, error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testPowerPointGeneration(slideSpec) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      spec: slideSpec,
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

    console.log(`🎯 Testing PowerPoint generation for layout: ${slideSpec.layout}`);

    const req = https.request(generateUrl, options, (res) => {
      let dataLength = 0;
      res.on('data', (chunk) => {
        dataLength += chunk.length;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ PowerPoint Success! File size: ${dataLength} bytes`);
          console.log(`📄 Content-Type: ${res.headers['content-type']}`);
          resolve();
        } else {
          console.log(`❌ PowerPoint Error! Status: ${res.statusCode}`);
          reject(new Error(`PowerPoint generation failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ PowerPoint generation error:`, error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run all layout tests
async function runLayoutTests() {
  console.log('🚀 Starting Layout Testing Suite...\n');
  
  for (const testCase of layoutTests) {
    try {
      await testLayoutGeneration(testCase);
      console.log(`\n⏱️  Waiting 3 seconds before next test...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`❌ Test failed for ${testCase.name}:`, error.message);
    }
  }
  
  console.log('\n🏁 All layout tests completed!');
}

runLayoutTests();
