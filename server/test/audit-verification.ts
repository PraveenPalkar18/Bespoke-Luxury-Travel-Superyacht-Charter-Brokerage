import { createApp } from '../src/app';
import { isValidStatusTransition, VALID_STATUS_TRANSITIONS } from '../src/validators';
import { InquiryStatus } from '../src/types';
import http from 'http';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${details ? ` - ${details}` : ''}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('  AURELIA & CO. SYSTEM AUDIT & ARCHITECTURE TEST SUITE');
  console.log('======================================================\n');

  // TEST 1: Inquiry State Machine Transitions
  console.log('[Suite 1] Inquiry State Machine Transition Validation:');
  
  // Valid transitions
  assert(isValidStatusTransition('new', 'in_review'), 'Allows: new -> in_review');
  assert(isValidStatusTransition('in_review', 'supplier_contacted'), 'Allows: in_review -> supplier_contacted');
  assert(isValidStatusTransition('supplier_contacted', 'quote_sent'), 'Allows: supplier_contacted -> quote_sent');
  assert(isValidStatusTransition('quote_sent', 'negotiating'), 'Allows: quote_sent -> negotiating');
  assert(isValidStatusTransition('negotiating', 'confirmed'), 'Allows: negotiating -> confirmed');
  assert(isValidStatusTransition('new', 'archived'), 'Allows: new -> archived');
  assert(isValidStatusTransition('quote_sent', 'archived'), 'Allows: quote_sent -> archived');
  assert(isValidStatusTransition('archived', 'in_review'), 'Allows: archived -> in_review (re-opening)');
  assert(isValidStatusTransition('in_review', 'in_review'), 'Allows idempotent status: in_review -> in_review');

  // Invalid transitions
  assert(!isValidStatusTransition('new', 'confirmed'), 'Rejects skip: new -> confirmed');
  assert(!isValidStatusTransition('new', 'quote_sent'), 'Rejects skip: new -> quote_sent');
  assert(!isValidStatusTransition('confirmed', 'new'), 'Rejects backwards transition: confirmed -> new');
  assert(!isValidStatusTransition('confirmed', 'in_review'), 'Rejects backwards transition: confirmed -> in_review');

  // TEST 2: Express HTTP API Tests
  console.log('\n[Suite 2] Express API, Security Middleware & HTTP Handlers:');
  const app = createApp();
  const testServer = http.createServer(app);

  await new Promise<void>((resolve) => testServer.listen(0, resolve));
  const port = (testServer.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // 2.1 Health Check
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData: any = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint responds with HTTP 200 OK');
    assert(healthData.status === 'healthy', 'Health check reports status: "healthy"');

    // 2.2 Unauthenticated Route Security (RBAC)
    const inquiriesRes = await fetch(`${baseUrl}/inquiries`);
    assert(inquiriesRes.status === 401, 'Protected /api/inquiries rejects unauthenticated requests with HTTP 401');

    const statsRes = await fetch(`${baseUrl}/stats/overview`);
    assert(statsRes.status === 401, 'Protected /api/stats/overview rejects unauthenticated requests with HTTP 401');

    const meRes = await fetch(`${baseUrl}/auth/me`);
    assert(meRes.status === 401, 'Protected /api/auth/me rejects unauthenticated requests with HTTP 401');

    // 2.3 Database Disconnection Resilience (HTTP 503 instead of silent RAM corruption)
    // Since MongoDB is not connected in this test run, calling aircraft should return 503
    const aircraftRes = await fetch(`${baseUrl}/aircraft`);
    const aircraftData: any = await aircraftRes.json();
    assert(
      aircraftRes.status === 503,
      'Fleet endpoints return HTTP 503 Service Unavailable when MongoDB is disconnected'
    );
    assert(
      aircraftData.error === 'DatabaseUnavailableError',
      'Returns structured DatabaseUnavailableError error code'
    );
    assert(
      aircraftData.message.includes('currently unavailable'),
      'Provides actionable error message indicating MongoDB status'
    );

    // 2.4 Rate Limiter Verification on /api/auth/login (Max 5 attempts)
    console.log('\n[Suite 3] Security Rate Limiter Verification:');
    let rateLimitedTriggered = false;
    for (let i = 1; i <= 6; i++) {
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bad@example.com', password: 'wrongpassword' }),
      });

      if (loginRes.status === 429) {
        rateLimitedTriggered = true;
        const limitData: any = await loginRes.json();
        assert(true, `Rate limiter active: Attempt #${i} triggered HTTP 429 Too Many Requests`);
        assert(limitData.error === 'TooManyRequests', 'Rate limiter returns TooManyRequests error code');
        break;
      }
    }
    assert(rateLimitedTriggered, 'Auth rate limiter successfully blocked brute-force login attempts (> 5 attempts)');

  } finally {
    testServer.close();
  }

  console.log('\n======================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

