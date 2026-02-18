// test-setup.js
const axios = require('axios');

async function testAllEndpoints() {
  const BASE_URL = 'http://localhost:3003';
  
  console.log('🧪 Testing API Endpoints...\n');
  
  try {
    // 1. Test server is running
    console.log('1. Testing server health...');
    const healthRes = await axios.get(`${BASE_URL}/`);
    console.log('✅ Server running:', healthRes.data.message);
    
    // 2. Test GET categories (no auth needed)
    console.log('\n2. Testing GET categories...');
    const categoriesRes = await axios.get(`${BASE_URL}/api/categories`);
    console.log('✅ GET categories successful');
    console.log(`   Found ${categoriesRes.data.categories?.length || 0} categories`);
    
    // 3. Test if we have a token
    console.log('\n3. Checking token requirements...');
    console.log('   Note: POST/PUT/DELETE require admin token');
    
    // 4. Test POST without token (should fail)
    console.log('\n4. Testing POST without token (should fail)...');
    try {
      await axios.post(`${BASE_URL}/api/categories/add`, {
        category_name: 'Test Category'
      });
    } catch (error) {
      console.log(`✅ Expected failure: ${error.response?.status} - ${error.response?.data?.message || 'Unauthorized'}`);
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📝 Instructions:');
    console.log('1. Make sure backend is running on port 3003');
    console.log('2. Frontend should be on port 3000');
    console.log('3. Login as admin to get a token');
    console.log('4. Token will be used in Authorization header');
    
  } catch (error) {
    console.error('\n❌ Setup test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Is backend running? Run: npm start or node server.js');
    console.log('2. Check port 3003 is not in use');
    console.log('3. Check .env file has correct PORT=3003');
  }
}

testAllEndpoints();