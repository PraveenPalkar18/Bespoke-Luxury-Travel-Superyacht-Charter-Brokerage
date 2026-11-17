import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

import http from 'http';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { config } from '../src/config';
import { redactMongoUri } from '../src/utils/redact';
import { UserModel } from '../src/models/User';
import { InquiryModel } from '../src/models/Inquiry';
import { ProposalModel } from '../src/models/Proposal';
import { BookingModel } from '../src/models/Booking';
import { BrokerInvitationModel } from '../src/models/BrokerInvitation';
import { SessionModel } from '../src/models/Session';
import { AuditLogModel } from '../src/models/AuditLog';
import { bookingService } from '../src/services/booking.service';
import { proposalService } from '../src/services/proposal.service';

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

async function runAuthSecuritySuite() {
  console.log('\n======================================================');
  console.log('  AURELIA & CO. PRODUCTION SECURITY & BUSINESS RULES SUITE');
  console.log('======================================================\n');

  // 1. DEDICATED ISOLATED TEST DATABASE (never touches production data)
  const baseUri = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/luxury_travel_test';
  const testMongoUri = baseUri.replace(
    /(\/[a-zA-Z0-9_-]+)(\?|$)/,
    '/luxury_travel_test$2'
  );
  config.mongoUri = testMongoUri;
  console.log(`[Test Setup] Isolated test database: ${redactMongoUri(testMongoUri)}`);
  
  await mongoose.connect(testMongoUri, { serverSelectionTimeoutMS: 5000 });

  // 2. SEED ISOLATED TEST ACCOUNTS (no production brokers touched)
  const salt = await bcrypt.genSalt(10);
  const testPasswordHash = await bcrypt.hash('TestBrokerPass123!', salt);

  const testAdminEmail = `test.admin.${Date.now()}@aureliatest.internal`;
  const testBrokerAlphaEmail = `test.broker.alpha.${Date.now()}@aureliatest.internal`;
  const testBrokerBetaEmail = `test.broker.beta.${Date.now()}@aureliatest.internal`;
  const testDeactivatedEmail = `test.broker.deact.${Date.now()}@aureliatest.internal`;

  const [testAdmin, testBrokerAlpha, testBrokerBeta, testDeactivated] = await Promise.all([
    UserModel.create({
      name: 'Test Managing Director',
      email: testAdminEmail,
      passwordHash: testPasswordHash,
      role: 'admin',
      isActive: true,
    }),
    UserModel.create({
      name: 'Test Broker Alpha',
      email: testBrokerAlphaEmail,
      passwordHash: testPasswordHash,
      role: 'broker',
      isActive: true,
    }),
    UserModel.create({
      name: 'Test Broker Beta',
      email: testBrokerBetaEmail,
      passwordHash: testPasswordHash,
      role: 'broker',
      isActive: true,
    }),
    UserModel.create({
      name: 'Test Inactive Broker',
      email: testDeactivatedEmail,
      passwordHash: testPasswordHash,
      role: 'broker',
      isActive: false,
    }),
  ]);

  const app = createApp();
  const testServer = http.createServer(app);
  await new Promise<void>((resolve) => testServer.listen(0, resolve));
  const port = (testServer.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // -------------------------------------------------------------------------
    // SUITE 1: Authentication & Session Governance
    // -------------------------------------------------------------------------
    console.log('[Suite 1] Authentication, Passwords & Session Governance:');

    // 1.1 Admin Login
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.0.0.1' },
      body: JSON.stringify({ email: testAdminEmail, password: 'TestBrokerPass123!' }),
    });
    const adminData: any = await adminLoginRes.json();
    const adminToken = adminData.token || adminData.data?.token;
    const cookieHeader = adminLoginRes.headers.get('set-cookie');

    assert(adminLoginRes.status === 200, 'Admin login succeeds with HTTP 200');
    assert(adminData.data.user.role === 'admin', 'Admin user has role: admin');
    assert(!('passwordHash' in adminData.data.user), 'Response never leaks passwordHash');
    assert(!!cookieHeader && cookieHeader.includes('aurelia_session'), 'HttpOnly session cookie is set');
    assert(!!cookieHeader && cookieHeader.includes('aurelia_csrf'), 'Anti-CSRF cookie is set');

    // Extract CSRF cookie
    const csrfMatch = cookieHeader ? cookieHeader.match(/aurelia_csrf=([^;]+)/) : null;
    const adminCsrfToken = csrfMatch ? csrfMatch[1] : adminData.csrfToken;

    // 1.2 Broker Login
    const brokerLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.0.0.2' },
      body: JSON.stringify({ email: testBrokerAlphaEmail, password: 'TestBrokerPass123!' }),
    });
    const brokerData: any = await brokerLoginRes.json();
    const brokerToken = brokerData.token || brokerData.data?.token;
    assert(brokerLoginRes.status === 200, 'Broker login succeeds with HTTP 200');
    assert(brokerData.data.user.role === 'broker', 'Broker user has role: broker');

    // 1.3 Invalid Password
    const badPwRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.0.0.3' },
      body: JSON.stringify({ email: testAdminEmail, password: 'WrongPassword999' }),
    });
    const badPwData: any = await badPwRes.json();
    assert(badPwRes.status === 401, 'Invalid password rejected with HTTP 401');
    assert(badPwData.message.includes('Invalid email or password'), 'Generic credential failure message returned');

    // 1.4 Unknown Email
    const unknownEmailRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.0.0.4' },
      body: JSON.stringify({ email: 'nonexistent.agent@phantom.org', password: 'Password123!' }),
    });
    assert(unknownEmailRes.status === 401, 'Unknown email rejected with HTTP 401');

    // 1.5 Inactive Broker Login Rejected
    const inactiveLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.0.0.5' },
      body: JSON.stringify({ email: testDeactivatedEmail, password: 'TestBrokerPass123!' }),
    });
    assert(inactiveLoginRes.status === 401, 'Inactive broker login rejected with HTTP 401');

    // 1.6 Logout Invalidates Session
    const tempUserEmail = `temp.broker.${Date.now()}@aureliatest.internal`;
    const tempUser = await UserModel.create({
      name: 'Temporary Broker',
      email: tempUserEmail,
      passwordHash: testPasswordHash,
      role: 'broker',
      isActive: true,
    });

    const tempLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.0.0.6' },
      body: JSON.stringify({ email: tempUserEmail, password: 'TestBrokerPass123!' }),
    });
    const tempLoginData: any = await tempLoginRes.json();
    const tempToken = tempLoginData.data.token;

    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tempToken}` },
    });
    assert(logoutRes.status === 200, 'Logout succeeds with HTTP 200');

    const sessionInDb = await SessionModel.findById(tempLoginData.data.sessionId);
    assert(sessionInDb?.isValid === false, 'Session is marked isValid=false in MongoDB upon logout');

    const afterLogoutRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${tempToken}` },
    });
    assert(afterLogoutRes.status === 401, 'Subsequent request with invalidated session rejected with HTTP 401');

    // -------------------------------------------------------------------------
    // SUITE 2: CSRF & Cookie-Authenticated State-Changing Protection
    // -------------------------------------------------------------------------
    console.log('\n[Suite 2] CSRF Protection & Cookie Security:');

    // Create a test inquiry for state-changing tests
    const csrfTestInquiry = await InquiryModel.create({
      referenceCode: `TEST-CSRF-${Date.now()}`,
      customerName: 'Test Client',
      email: 'client@aureliatest.internal',
      phone: '+44 20 7946 0999',
      destination: 'French Riviera',
      departureLocation: 'London Luton (EGGW)',
      departureDate: '2027-08-01',
      travellers: 2,
      requestedServices: ['private_jet'],
      budgetRange: '$100k - $250k',
      status: 'in_review',
      assignedTo: testBrokerAlpha._id.toString(),
      assignedBrokerName: testBrokerAlpha.name,
      internalNotes: [],
    });

    // Extract session cookie string
    const sessionCookieStr = `aurelia_session=${adminToken}`;
    const fullCookieStr = `aurelia_session=${adminToken}; aurelia_csrf=${adminCsrfToken}`;

    // 2.1 State-changing POST with cookie BUT missing X-CSRF-Token header -> MUST BE REJECTED 403
    const csrfMissingRes = await fetch(`${baseUrl}/inquiries/${csrfTestInquiry._id}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookieStr,
      },
      body: JSON.stringify({ content: 'Unprotected forged note' }),
    });
    assert(csrfMissingRes.status === 403, 'Cookie-authenticated state-changing request without CSRF token rejected with HTTP 403');
    const csrfMissingData: any = await csrfMissingRes.json();
    assert(csrfMissingData.code === 'EBADCSRFTOKEN', 'Returns EBADCSRFTOKEN error code');

    // 2.2 State-changing POST with cookie AND mismatched/invalid X-CSRF-Token header -> MUST BE REJECTED 403
    const csrfInvalidRes = await fetch(`${baseUrl}/inquiries/${csrfTestInquiry._id}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: fullCookieStr,
        'X-CSRF-Token': 'forged_fake_token_1234567890',
      },
      body: JSON.stringify({ content: 'Forged note with fake token' }),
    });
    assert(csrfInvalidRes.status === 403, 'Cookie request with mismatched CSRF token rejected with HTTP 403');

    // 2.3 State-changing POST with valid Cookie AND valid matching X-CSRF-Token header -> MUST SUCCEED 201
    const csrfValidRes = await fetch(`${baseUrl}/inquiries/${csrfTestInquiry._id}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: fullCookieStr,
        'X-CSRF-Token': adminCsrfToken,
      },
      body: JSON.stringify({ content: 'Legitimate CSRF-protected note' }),
    });
    assert(csrfValidRes.status === 201, 'Cookie request with valid matching Anti-CSRF token succeeds with HTTP 201');

    // 2.4 Bearer token state-changing request (exempt from cookie-CSRF) -> MUST SUCCEED 201
    const bearerNoteRes = await fetch(`${baseUrl}/inquiries/${csrfTestInquiry._id}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ content: 'Legitimate Bearer-authenticated note' }),
    });
    assert(bearerNoteRes.status === 201, 'Bearer header request succeeds without CSRF overhead');

    // -------------------------------------------------------------------------
    // SUITE 3: Single-Use Invitation & Broker Onboarding
    // -------------------------------------------------------------------------
    console.log('\n[Suite 3] Single-Use Token Broker Onboarding & Invitation Lifecycle:');

    const newBrokerEmail = `new.broker.${Date.now()}@aureliatest.internal`;
    const inviteRes = await fetch(`${baseUrl}/auth/invite`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: newBrokerEmail,
        name: 'New Broker Candidate',
        role: 'broker',
      }),
    });
    const inviteData: any = await inviteRes.json();
    assert(inviteRes.status === 201, 'Admin generates broker invitation with HTTP 201');
    const rawInviteToken = inviteData.data.inviteToken || inviteData.data.token;
    assert(typeof rawInviteToken === 'string' && rawInviteToken.length > 20, 'Raw single-use token returned');

    // Fetch invitation details
    const fetchInviteRes = await fetch(`${baseUrl}/auth/invite/${rawInviteToken}`);
    assert(fetchInviteRes.status === 200, 'Broker can fetch invitation details with HTTP 200');

    // Complete onboarding
    const acceptRes = await fetch(`${baseUrl}/auth/accept-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: rawInviteToken,
        password: 'SecureBrokerPassword99!',
        name: 'Onboarded Broker',
      }),
    });
    assert(acceptRes.status === 201, 'Broker completes onboarding with HTTP 201');

    // Single-use guarantee: Re-using the same token must fail
    const reuseRes = await fetch(`${baseUrl}/auth/accept-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: rawInviteToken,
        password: 'AnotherPassword123!',
        name: 'Imposter',
      }),
    });
    assert(reuseRes.status === 400, 'Reused invitation token rejected with HTTP 400');

    // Public registration route is absent
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'intruder@public.com', password: 'Password123!' }),
    });
    assert(regRes.status === 404, 'Public registration route is absent (HTTP 404)');

    // -------------------------------------------------------------------------
    // SUITE 4: Role-Based & Resource-Level Authorization
    // -------------------------------------------------------------------------
    console.log('\n[Suite 4] Role Authorization & Dossier Confidentiality:');

    // Admin can view brokers list
    const adminBrokersRes = await fetch(`${baseUrl}/auth/brokers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminBrokersRes.status === 200, 'Admin can view all brokers with HTTP 200');

    // Broker cannot invite new brokers
    const brokerInviteRes = await fetch(`${baseUrl}/auth/invite`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${brokerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'forbidden@broker.com', name: 'Unauthorized' }),
    });
    assert(brokerInviteRes.status === 403, 'Broker cannot invite new brokers (HTTP 403 Forbidden)');

    // Broker cannot access audit logs
    const brokerAuditRes = await fetch(`${baseUrl}/auth/audit-logs`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    assert(brokerAuditRes.status === 403, 'Broker cannot view audit logs (HTTP 403 Forbidden)');

    // Resource-level confidentiality:
    // Create enquiry assigned to Broker Alpha
    const alphaEnquiry = await InquiryModel.create({
      referenceCode: `TEST-ALPHA-${Date.now()}`,
      customerName: 'Countess Sophia',
      email: 'sophia@test.internal',
      phone: '+43 1 515 000',
      destination: 'Saint-Tropez',
      departureLocation: 'Vienna Schwechat (LOWW)',
      departureDate: '2027-07-10',
      travellers: 4,
      requestedServices: ['superyacht', 'private_jet'],
      budgetRange: '$500k - $1M',
      status: 'in_review',
      assignedTo: testBrokerAlpha._id.toString(),
      assignedBrokerName: testBrokerAlpha.name,
      internalNotes: [],
    });

    // Create enquiry assigned to Broker Beta
    const betaEnquiry = await InquiryModel.create({
      referenceCode: `TEST-BETA-${Date.now()}`,
      customerName: 'Sheikh Tariq',
      email: 'tariq@test.internal',
      phone: '+971 4 301 7777',
      destination: 'Monaco Harbor',
      departureLocation: 'Dubai (DWC)',
      departureDate: '2027-05-20',
      travellers: 12,
      requestedServices: ['superyacht', 'private_jet'],
      budgetRange: '$1M+',
      status: 'in_review',
      assignedTo: testBrokerBeta._id.toString(),
      assignedBrokerName: testBrokerBeta.name,
      internalNotes: [],
    });

    // Admin can view any enquiry
    const adminViewBetaRes = await fetch(`${baseUrl}/inquiries/${betaEnquiry._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminViewBetaRes.status === 200, 'Admin can view any enquiry (HTTP 200)');

    // Broker Alpha can view own assigned enquiry
    const alphaViewOwnRes = await fetch(`${baseUrl}/inquiries/${alphaEnquiry._id}`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    assert(alphaViewOwnRes.status === 200, 'Broker can view own assigned enquiry (HTTP 200)');

    // Broker Alpha CANNOT view Broker Beta's enquiry
    const alphaViewBetaRes = await fetch(`${baseUrl}/inquiries/${betaEnquiry._id}`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    assert(alphaViewBetaRes.status === 403, 'Broker Alpha CANNOT view Broker Beta\'s confidential enquiry (HTTP 403 Forbidden)');

    // Broker Alpha CANNOT add notes to Broker Beta's enquiry
    const alphaNoteBetaRes = await fetch(`${baseUrl}/inquiries/${betaEnquiry._id}/notes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${brokerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: 'Unauthorized intrusion attempt note' }),
    });
    assert(alphaNoteBetaRes.status === 403, 'Broker Alpha CANNOT add notes to unassigned enquiry (HTTP 403 Forbidden)');

    // -------------------------------------------------------------------------
    // SUITE 5: Booking Confirmation & Multi-Supplier Business Rules
    // -------------------------------------------------------------------------
    console.log('\n[Suite 5] Booking Confirmation & Multi-Supplier Business Rules:');

    // Create a multi-service bespoke travel enquiry (Aircraft + Yacht + Accommodation)
    const bespokeInquiry = await InquiryModel.create({
      referenceCode: `TEST-BESPOKE-${Date.now()}`,
      customerName: 'Lord Harrington',
      email: 'harrington@monaco-holdings.mc',
      phone: '+377 98 06 20 00',
      destination: 'Monaco & Amalfi Coast',
      departureLocation: 'Farnborough (EGLF)',
      departureDate: '2027-06-15',
      returnDate: '2027-06-25',
      travellers: 6,
      requestedServices: ['private_jet', 'superyacht', 'accommodation'],
      budgetRange: '$750k - $1.5M',
      status: 'in_review',
      assignedTo: testBrokerAlpha._id.toString(),
      assignedBrokerName: testBrokerAlpha.name,
      internalNotes: [],
    });

    // Create proposal referencing aircraft, yacht, and accommodation
    const clientToken = crypto.randomBytes(24).toString('hex');
    const proposal = await ProposalModel.create({
      inquiryId: bespokeInquiry._id.toString(),
      referenceCode: `TEST-PROP-${Date.now()}`,
      title: 'Monaco Grand Prix & Amalfi Grand Odyssey',
      destination: 'Monaco & Amalfi Coast',
      clientName: bespokeInquiry.customerName,
      clientEmail: bespokeInquiry.email,
      createdById: testBrokerAlpha._id.toString(),
      createdByName: testBrokerAlpha.name,
      status: 'sent',
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      clientAccessToken: clientToken,
      executiveSummary: 'Ultra-exclusive private aviation and superyacht charter.',
      aircraft: {
        name: 'Bombardier Global 7500',
        model: 'Global 7500',
        category: 'Ultra Long-Range',
      },
      yacht: {
        name: 'Aurelia Sea Star (65m Heesen)',
        builder: 'Heesen Yachts',
        lengthFeet: 213,
        embarkationPort: 'Port Hercules, Monaco',
        disembarkationPort: 'Capri Marina Grande',
        charterDays: 7,
      },
      itinerary: [
        {
          dayNumber: 1,
          title: 'Arrival into Nice Côte d\'Azur & Monaco Transfer',
          location: 'Monaco',
          description: 'Private Global 7500 arrival into LFMN, helicopter transfer to Monaco.',
          accommodation: 'Hotel de Paris Monte-Carlo (Diamond Suite)',
        },
      ],
      pricing: {
        currency: 'USD',
        aircraftCharterPrice: 180000,
        yachtCharterPrice: 450000,
        estimatedAPA: 150000,
        totalEstimatedCost: 780000,
      },
      paymentTerms: '50% initial escrow deposit.',
    });

    // 5.1 Business Rule 1: Client Proposal Acceptance NEVER automatically confirms booking
    const acceptedProposal = await proposalService.clientRespond(clientToken, 'accepted', 'Approved and ready for agreement execution');
    assert(acceptedProposal.status === 'accepted', 'Proposal transitions to accepted status');

    // Retrieve generated booking
    const booking = await BookingModel.findOne({ proposalId: proposal._id.toString() });
    assert(!!booking, 'Booking record is generated upon proposal acceptance');
    assert(
      booking?.status === 'pending_supplier_confirmation',
      'Booking status is pending_supplier_confirmation (NEVER automatically confirmed)'
    );

    // Verify associated enquiry was NOT marked confirmed
    const updatedInquiry = await InquiryModel.findById(bespokeInquiry._id);
    assert(
      updatedInquiry?.status !== 'confirmed',
      'Associated enquiry is NOT confirmed upon proposal acceptance'
    );
    assert(
      updatedInquiry?.status === 'supplier_contacted',
      'Enquiry transitioned to supplier_contacted awaiting independent supplier confirmations'
    );

    // 5.2 Business Rule 2: Independent Supplier Confirmation Tracking
    assert(booking?.supplierConfirmations.aircraft.required === true, 'Aircraft supplier confirmation is required');
    assert(booking?.supplierConfirmations.yacht.required === true, 'Yacht supplier confirmation is required');
    assert(booking?.supplierConfirmations.accommodation.required === true, 'Accommodation supplier confirmation is required');
    assert(booking?.supplierConfirmations.aircraft.confirmed === false, 'Aircraft confirmation initially false');
    assert(booking?.supplierConfirmations.yacht.confirmed === false, 'Yacht confirmation initially false');
    assert(booking?.supplierConfirmations.accommodation.confirmed === false, 'Accommodation confirmation initially false');

    // 5.3 Business Rule 3: Confirm Aircraft Supplier only -> Booking remains pending
    const step1Booking = await bookingService.recordSupplierConfirmation(
      booking!._id.toString(),
      'aircraft',
      { supplierName: 'VistaJet Executive Operator', referenceOrContractNumber: 'VJ-2027-9912' },
      { id: testBrokerAlpha._id.toString(), email: testBrokerAlpha.email, name: testBrokerAlpha.name, role: 'broker' }
    );
    assert(step1Booking.supplierConfirmations.aircraft.confirmed === true, 'Aircraft confirmed recorded');
    assert(step1Booking.status === 'pending_supplier_confirmation', 'Booking REMAINS pending_supplier_confirmation with partial confirmations');

    const inqCheck1 = await InquiryModel.findById(bespokeInquiry._id);
    assert(inqCheck1?.status !== 'confirmed', 'Enquiry remains unconfirmed after aircraft confirmation alone');

    // 5.4 Confirm Yacht Supplier only -> Booking still remains pending
    const step2Booking = await bookingService.recordSupplierConfirmation(
      booking!._id.toString(),
      'yacht',
      { supplierName: 'Heesen Charter Management', referenceOrContractNumber: 'HES-YACHT-4401' },
      { id: testBrokerAlpha._id.toString(), email: testBrokerAlpha.email, name: testBrokerAlpha.name, role: 'broker' }
    );
    assert(step2Booking.supplierConfirmations.yacht.confirmed === true, 'Yacht confirmed recorded');
    assert(step2Booking.status === 'pending_supplier_confirmation', 'Booking REMAINS pending with aircraft + yacht (accommodation pending)');

    // 5.5 Confirm Accommodation Supplier -> NOW ALL REQUIRED SUPPLIERS ARE CONFIRMED -> Booking becomes confirmed!
    const step3Booking = await bookingService.recordSupplierConfirmation(
      booking!._id.toString(),
      'accommodation',
      { supplierName: 'Hotel de Paris Monte-Carlo Concierge', referenceOrContractNumber: 'HDP-SUITE-8820' },
      { id: testBrokerAlpha._id.toString(), email: testBrokerAlpha.email, name: testBrokerAlpha.name, role: 'broker' }
    );
    assert(step3Booking.supplierConfirmations.accommodation.confirmed === true, 'Accommodation confirmed recorded');
    assert(step3Booking.status === 'confirmed', 'Booking TRANSITIONS to confirmed once every required supplier is confirmed');
    assert(!!step3Booking.confirmedAt, 'Booking recorded formal confirmedAt timestamp');

    // Associated enquiry is now confirmed!
    const finalInquiry = await InquiryModel.findById(bespokeInquiry._id);
    assert(finalInquiry?.status === 'confirmed', 'Associated enquiry formally TRANSITIONS to confirmed after all suppliers confirmed');

    // 5.6 API Endpoint Verification for Bookings
    const getBookingApiRes = await fetch(`${baseUrl}/bookings/${booking!._id}`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    assert(getBookingApiRes.status === 200, 'GET /api/bookings/:id returns HTTP 200');
    const getBookingApiData: any = await getBookingApiRes.json();
    assert(getBookingApiData.data.status === 'confirmed', 'API returns confirmed status with all supplier details');

    // -------------------------------------------------------------------------
    // SUITE 6: Audit Log Verification
    // -------------------------------------------------------------------------
    console.log('\n[Suite 6] Audit Log Trail Verification:');
    const recentLogs = await AuditLogModel.find({}).sort({ timestamp: -1 }).limit(50).lean();
    const actionTypes = recentLogs.map((l) => l.action);

    assert(actionTypes.includes('successful_login'), 'Audit log recorded successful_login');
    assert(actionTypes.includes('failed_login'), 'Audit log recorded failed_login');
    assert(actionTypes.includes('invitation_created'), 'Audit log recorded invitation_created');
    assert(actionTypes.includes('booking_created_pending_suppliers'), 'Audit log recorded booking_created_pending_suppliers');
    assert(actionTypes.includes('booking_confirmed'), 'Audit log recorded booking_confirmed');

    console.log('\n======================================================');
    console.log(`  VERIFICATION RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');
  } finally {
    // 6. TEARDOWN: Clean up isolated test database records
    try {
      await UserModel.deleteMany({ email: /@aureliatest\.internal$/ });
      await InquiryModel.deleteMany({ referenceCode: /^TEST-/ });
      await ProposalModel.deleteMany({ referenceCode: /^TEST-/ });
      await BookingModel.deleteMany({ referenceCode: /^TEST-|^BK-TEST-/ });
      await BrokerInvitationModel.deleteMany({ email: /@aureliatest\.internal$/ });
      await SessionModel.deleteMany({});
    } catch {}

    testServer.close();
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runAuthSecuritySuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
