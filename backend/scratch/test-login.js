const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function runTests() {
    console.log('=== STARTING SECURITY ENDPOINT TESTS ===\n');

    // 1. Test Incorrect Credentials
    console.log('1. Testing login with incorrect credentials...');
    try {
        await axios.post(`${API_URL}/auth/login`, {
            username: 'admin123',
            password: 'wrongpassword'
        });
        console.error('❌ FAIL: Login with wrong password succeeded (expected failure)');
    } catch (err) {
        if (err.response && err.response.status === 400) {
            console.log('✅ PASS: Login with wrong password failed with 400 Bad Request');
        } else {
            console.error('❌ FAIL: Expected 400 Bad Request but got', err.response ? err.response.status : err.message);
        }
    }

    // 2. Test Correct Credentials & Cookie Setting
    console.log('\n2. Testing login with correct credentials...');
    let cookie = '';
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            username: 'admin123',
            password: '123456'
        });
        
        console.log('✅ PASS: Login succeeded with 200 OK');
        
        // Check for cookie header
        const setCookieHeaders = res.headers['set-cookie'];
        if (setCookieHeaders && setCookieHeaders.some(h => h.includes('adminToken'))) {
            cookie = setCookieHeaders.find(h => h.includes('adminToken')).split(';')[0];
            console.log('✅ PASS: adminToken Cookie is set correctly in response headers:', cookie);
            if (setCookieHeaders.some(h => h.includes('HttpOnly'))) {
                console.log('✅ PASS: Cookie has HttpOnly flag set');
            } else {
                console.warn('⚠️ WARNING: Cookie is missing HttpOnly flag');
            }
        } else {
            console.error('❌ FAIL: adminToken Cookie is NOT set in response headers');
        }
    } catch (err) {
        console.error('❌ FAIL: Login with correct credentials failed:', err.message);
    }

    // 3. Test Verify Endpoint with and without Cookie
    console.log('\n3. Testing /auth/verify endpoint...');
    
    // 3.a. Without cookie
    try {
        await axios.get(`${API_URL}/auth/verify`);
        console.error('❌ FAIL: /auth/verify succeeded without auth cookie (expected failure)');
    } catch (err) {
        if (err.response && err.response.status === 401) {
            console.log('✅ PASS: /auth/verify failed with 401 Unauthorized when token is missing');
        } else {
            console.error('❌ FAIL: Expected 401 but got', err.response ? err.response.status : err.message);
        }
    }

    // 3.b. With cookie
    if (cookie) {
        try {
            const res = await axios.get(`${API_URL}/auth/verify`, {
                headers: { Cookie: cookie }
            });
            if (res.status === 200 && res.data.valid === true) {
                console.log('✅ PASS: /auth/verify succeeded with valid auth cookie');
            } else {
                console.error('❌ FAIL: /auth/verify returned invalid response data:', res.data);
            }
        } catch (err) {
            console.error('❌ FAIL: /auth/verify failed with auth cookie:', err.response ? err.response.data : err.message);
        }
    } else {
        console.log('Skipping verification test with cookie as cookie was not set.');
    }

    // 4. Test Rate Limiting (making more requests rapidly)
    console.log('\n4. Testing rate limiting (max 5 requests per 15 minutes)...');
    console.log('Sending multiple login requests to exceed limit...');
    
    let rateLimited = false;
    // We already sent 2 login requests above. We need to send 4 more to hit the limit of 5.
    for (let i = 0; i < 6; i++) {
        try {
            await axios.post(`${API_URL}/auth/login`, {
                username: 'admin123',
                password: 'wrongpassword'
            });
        } catch (err) {
            if (err.response && err.response.status === 429) {
                rateLimited = true;
                console.log(`✅ PASS: Request ${i + 3} was blocked with 429 Too Many Requests:`, err.response.data.message);
                break;
            }
        }
    }

    if (!rateLimited) {
        console.error('❌ FAIL: Rate limiter did not trigger after 5 requests');
    } else {
        console.log('✅ PASS: Rate limiter successfully blocked abusive attempts.');
    }

    console.log('\n=== TESTS COMPLETED ===');
}

runTests();
