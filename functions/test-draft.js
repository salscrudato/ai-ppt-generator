const https = require('https');

// Test draft generation with various scenarios
const testCases = [
  {
    name: "Executive Business Presentation",
    params: {
      prompt: "Q4 financial results showing 25% revenue growth and expansion into new markets",
      audience: "executives",
      tone: "professional",
      contentLength: "moderate",
      withImage: true
    }
  },
  {
    name: "Technical Architecture Overview",
    params: {
      prompt: "New microservices architecture that improves system performance and scalability",
      audience: "technical",
      tone: "professional",
      contentLength: "detailed",
      withImage: false
    }
  },
  {
    name: "Marketing Campaign Results",
    params: {
      prompt: "Social media campaign results showing increased engagement and brand awareness",
      audience: "general",
      tone: "inspiring",
      contentLength: "brief",
      withImage: true
    }
  }
];

// API endpoint
const apiUrl = 'https://api-rh444yt5aq-uc.a.run.app/draft';

async function testDraftGeneration(testCase) {
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

    const req = https.request(apiUrl, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            console.log(`✅ Success! Status: ${res.statusCode}`);
            console.log(`📊 Generated slide:`, JSON.stringify(result, null, 2));
            resolve(result);
          } catch (error) {
            console.log(`❌ JSON Parse Error:`, error.message);
            console.log(`📄 Raw response:`, data);
            reject(error);
          }
        } else {
          console.log(`❌ Error! Status: ${res.statusCode}`);
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

// Run all test cases
async function runAllTests() {
  console.log('🚀 Starting AI Prompt Testing Suite...\n');
  
  for (const testCase of testCases) {
    try {
      await testDraftGeneration(testCase);
      console.log(`\n⏱️  Waiting 2 seconds before next test...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Test failed for ${testCase.name}:`, error.message);
    }
  }
  
  console.log('\n🏁 All tests completed!');
}

runAllTests();
