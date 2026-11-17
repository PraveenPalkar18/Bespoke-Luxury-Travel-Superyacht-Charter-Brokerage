import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

import http from 'http';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { connectDatabase } from '../src/config/database';
import { UserModel } from '../src/models/User';
import { InquiryModel } from '../src/models/Inquiry';
import { ProposalModel } from '../src/models/Proposal';
import { BrokerInvitationModel } from '../src/models/BrokerInvitation';
import { SessionModel } from '../src/models/Session';
import { AuditLogModel } from '../src/models/AuditLog';

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
  console.log('  AURELIA & CO. AUTHENTICATION & RBAC SECURITY SUITE');
  console.log('======================================================\n');

  // Connect to persistent MongoDB Atlas
  await connectDatabase();

  const app = createApp();
  const testServer = http.createServer(app);
  await new Promise<void>((resolve) => testServer.listen(0, resolve));
  const port = (testServer.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // -------------------------------------------------------------------------
    // SUITE 1: Authentication & Session Verification
    // -------------------------------------------------------------------------
    console.log('[Suite 1] Authentication, Passwords & Session Governance:');

    // 1.1 Admin Login
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.0.0.1' },
      body: JSON.stringify({ email: 'alexander.vance@aureliatravel.com', password: 'Password123!' }),
    });
    const adminData: any = await adminLoginRes.json();
    const adminToken = adminData.token || adminData.data?.token;
    const cookieHeader = adminLoginRes.headers.get('set-cookie');

    assert(adminLoginRes.status === 200, 'Admin login succeeds with HTTP 200');
    assert(adminData.data.user.role === 'admin', 'Admin user has role: admin');
    assert(!('passwordHash' in adminData.data.user), 'Response never leaks passwordHash');
    assert(!!cookieHeader && cookieHeader.includes('aurelia_session'), 'HttpOnly cookie aurelia_session is set');

    // 1.2 Broker Login
    const brokerLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.0.0.2' },
      body: JSON.stringify({ email: 'elena.rostova@aureliatravel.com', password: 'Password123!' }),
    });
    const brokerData: any = await brokerLoginRes.json();
    const brokerToken = brokerData.token || brokerData.data?.token;
    assert(brokerLoginRes.status === 200, 'Broker login succeeds with HTTP 200');
    assert(brokerData.data.user.role === 'broker', 'Broker user has role: broker');

    // 1.3 Invalid Password
    const badPwRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.0.0.3' },
      body: JSON.stringify({ email: 'alexander.vance@aureliatravel.com', password: 'WrongPassword999' }),
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
    const inactiveUserEmail = `test.inactive.${Date.now()}@aureliatravel.com`;
    const salt = await bcrypt.genSalt(10);
    const testHash = await bcrypt.hash('Password123!', salt);
    const inactiveUser = await UserModel.create({
      name: 'Deactivated Broker Test',
      email: inactiveUserEmail,
      passwordHash: testHash,
      role: 'broker',
      isActive: false,
    });

    const inactiveLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.0.0.5' },
      body: JSON.stringify({ email: inactiveUserEmail, password: 'Password123!' }),
    });
    assert(inactiveLoginRes.status === 401, 'Inactive broker login rejected with HTTP 401');

    // 1.6 Logout Invalidates Session
    const tempUserEmail = `temp.broker.${Date.now()}@aureliatravel.com`;
    const tempUser = await UserModel.create({
      name: 'Temporary Broker',
      email: tempUserEmail,
      passwordHash: testHash,
      role: 'broker',
      isActive: true,
    });

    const tempLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.0.0.6' },
      body: JSON.stringify({ email: tempUserEmail, password: 'Password123!' }),
    });
    const tempLoginData: any = await tempLoginRes.json();
    const tempToken = tempLoginData.data.token;

    // Logout
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tempToken}` },
    });
    assert(logoutRes.status === 200, 'Logout succeeds with HTTP 200');

    // Verify session invalidation in DB
    const sessionInDb = await SessionModel.findById(tempLoginData.data.sessionId);
    assert(sessionInDb?.isValid === false, 'Session is marked isValid=false in MongoDB upon logout');

    // Subsequent request with that session token is rejected
    const afterLogoutRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${tempToken}` },
    });
    assert(afterLogoutRes.status === 401, 'Subsequent request with invalidated session rejected with HTTP 401');

    // 1.7 Deactivated Broker Session Rejected in Real Time
    tempUser.isActive = true;
    await tempUser.save();

    const reloginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.0.0.7' },
      body: JSON.stringify({ email: tempUserEmail, password: 'Password123!' }),
    });
    const reloginData: any = await reloginRes.json();
    const activeToken = reloginData.data.token;

    // Admin deactivates tempUser
    const deactivateRes = await fetch(`${baseUrl}/auth/brokers/${tempUser._id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: false, reason: 'Security Audit Test' }),
    });
    assert(deactivateRes.status === 200, 'Admin can deactivate broker account with HTTP 200');

    // Broker attempts API request immediately
    const immediateBlockedRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    assert(immediateBlockedRes.status === 401, 'Deactivated broker session rejected immediately with HTTP 401');

    // -------------------------------------------------------------------------
    // SUITE 2: Admin-Managed Broker Onboarding
    // -------------------------------------------------------------------------
    console.log('\n[Suite 2] Single-Use Token Broker Onboarding & Invitation Lifecycle:');

    // 2.1 Admin Invites Broker
    const newBrokerEmail = `onboarding.${Date.now()}@aureliatravel.com`;
    const inviteRes = await fetch(`${baseUrl}/auth/invite`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Julian de Valois',
        email: newBrokerEmail,
        title: 'Senior Superyacht Charter Specialist',
        phone: '+33 4 93 34 00 00',
      }),
    });
    const inviteData: any = await inviteRes.json();
    assert(inviteRes.status === 201, 'Admin generates broker invitation with HTTP 201');
    assert(!!inviteData.data.inviteToken, 'Invitation returns token URL for administrative delivery');

    // Verify token hash in DB (token is hashed, NOT stored raw)
    const rawInviteToken = inviteData.data.inviteToken;
    const computedHash = crypto.createHash('sha256').update(rawInviteToken).digest('hex');
    const storedInvite = await BrokerInvitationModel.findOne({ tokenHash: computedHash });
    assert(!!storedInvite, 'Cryptographic SHA-256 hash stored in MongoDB');
    assert(storedInvite?.tokenHash !== rawInviteToken, 'Raw token is never stored in plaintext');

    // 2.2 Broker Retrieves Invitation Details
    const verifyInviteRes = await fetch(`${baseUrl}/auth/invite/${rawInviteToken}`);
    const verifyInviteData: any = await verifyInviteRes.json();
    assert(verifyInviteRes.status === 200, 'Broker can fetch invitation details with HTTP 200');
    assert(verifyInviteData.data.email === newBrokerEmail, 'Invitation returns designated email');

    // 2.3 Broker Accepts Invitation and Sets Password
    const acceptRes = await fetch(`${baseUrl}/auth/accept-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: rawInviteToken,
        password: 'LuxuryPassword2026!',
      }),
    });
    const acceptData: any = await acceptRes.json();
    assert(acceptRes.status === 201, 'Broker completes onboarding with HTTP 201');
    assert(acceptData.data.email === newBrokerEmail, 'Created broker account has matching email');

    // 2.4 Reused Invitation Rejected
    const reuseRes = await fetch(`${baseUrl}/auth/accept-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: rawInviteToken,
        password: 'AnotherPassword2026!',
      }),
    });
    assert(reuseRes.status === 400, 'Reused invitation token rejected with HTTP 400');

    // 2.5 Expired Invitation Rejected
    const expiredToken = crypto.randomBytes(32).toString('hex');
    const expiredHash = crypto.createHash('sha256').update(expiredToken).digest('hex');
    await BrokerInvitationModel.create({
      name: 'Expired Test',
      email: `expired.${Date.now()}@aureliatravel.com`,
      tokenHash: expiredHash,
      expiresAt: new Date(Date.now() - 10000), // In the past
      role: 'broker',
      invitedBy: adminData.data.user.id || adminData.data.user._id,
      isUsed: false,
      isRevoked: false,
    });
    const expiredRes = await fetch(`${baseUrl}/auth/invite/${expiredToken}`);
    assert(expiredRes.status === 400, 'Expired invitation token rejected with HTTP 400');

    // 2.6 Revoked Invitation Rejected
    const revokeToken = crypto.randomBytes(32).toString('hex');
    const revokeHash = crypto.createHash('sha256').update(revokeToken).digest('hex');
    const revokedInvite = await BrokerInvitationModel.create({
      name: 'Revoke Test',
      email: `revoked.${Date.now()}@aureliatravel.com`,
      tokenHash: revokeHash,
      expiresAt: new Date(Date.now() + 1000000),
      role: 'broker',
      invitedBy: adminData.data.user.id || adminData.data.user._id,
      isUsed: false,
      isRevoked: true,
      revokedAt: new Date(),
    });
    const revokedRes = await fetch(`${baseUrl}/auth/invite/${revokeToken}`);
    assert(revokedRes.status === 400, 'Revoked invitation token rejected with HTTP 400');

    // 2.7 Public Registration Rejected (Route Does Not Exist)
    const publicRegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hacker@malicious.com', password: 'Password123!' }),
    });
    assert(publicRegRes.status === 404, 'Public registration route is absent (HTTP 404)');

    // -------------------------------------------------------------------------
    // SUITE 3: Role-Based Access Control (RBAC)
    // -------------------------------------------------------------------------
    console.log('\n[Suite 3] Role Authorization & Permission Enforcement:');

    // 3.1 Admin Accesses Broker Management
    const adminBrokersRes = await fetch(`${baseUrl}/auth/brokers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminBrokersRes.status === 200, 'Admin can view all brokers with HTTP 200');

    // 3.2 Broker Cannot Invite Another Broker
    const brokerInviteRes = await fetch(`${baseUrl}/auth/invite`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${brokerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Unauthorized Invite', email: 'unauth@aurelia.com' }),
    });
    assert(brokerInviteRes.status === 403, 'Broker cannot invite new brokers (HTTP 403 Forbidden)');

    // 3.3 Broker Cannot Deactivate Users
    const brokerDeactivateRes = await fetch(`${baseUrl}/auth/brokers/${adminData.data.user.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${brokerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: false }),
    });
    assert(brokerDeactivateRes.status === 403, 'Broker cannot deactivate users (HTTP 403 Forbidden)');

    // 3.4 Admin Accesses Audit Logs
    const adminAuditRes = await fetch(`${baseUrl}/auth/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminAuditRes.status === 200, 'Admin can view audit logs with HTTP 200');

    // 3.5 Broker Cannot Access Audit Logs
    const brokerAuditRes = await fetch(`${baseUrl}/auth/audit-logs`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    assert(brokerAuditRes.status === 403, 'Broker cannot view audit logs (HTTP 403 Forbidden)');

    // -------------------------------------------------------------------------
    // SUITE 4: Resource-Level Authorization (Confidentiality)
    // -------------------------------------------------------------------------
    console.log('\n[Suite 4] Resource-Level Authorization & Dossier Confidentiality:');

    // Create Broker A (Elena) and Broker B (Julian)
    const elena = await UserModel.findOne({ email: 'elena.rostova@aureliatravel.com' });
    const elenaId = elena!._id.toString();

    // Create enquiry assigned to Elena
    const elenaEnquiry = await InquiryModel.create({
      referenceCode: `AUR-ELENA-${Date.now()}`,
      customerName: 'Countess Sophia von Habsburg',
      email: 'sophia@habsburg-capital.at',
      phone: '+43 1 515 000',
      destination: 'Saint-Tropez & Portofino',
      departureLocation: 'Vienna Schwechat (LOWW)',
      departureDate: '2027-07-10',
      travellers: 4,
      requestedServices: ['superyacht', 'private_jet'],
      budgetRange: '$500k - $1M',
      status: 'in_review',
      assignedTo: elenaId,
      assignedBrokerName: 'Elena Rostova',
      internalNotes: [],
    });

    // Create enquiry assigned to another broker (e.g. Julian or dummy broker)
    const julianId = new mongoose.Types.ObjectId().toString();
    const julianEnquiry = await InquiryModel.create({
      referenceCode: `AUR-JULIAN-${Date.now()}`,
      customerName: 'Sheikh Tariq Al-Maktoum',
      email: 'tariq@almaktoum-holdings.ae',
      phone: '+971 4 301 7777',
      destination: 'Monaco Grand Prix VIP Anchorage',
      departureLocation: 'Dubai Al Maktoum (DWC)',
      departureDate: '2027-05-20',
      travellers: 12,
      requestedServices: ['superyacht', 'private_jet'],
      budgetRange: '$1M+',
      status: 'in_review',
      assignedTo: julianId,
      assignedBrokerName: 'Julian Montgomery',
      internalNotes: [],
    });

    // 4.1 Admin Can View Julian's Confidential Enquiry
    const adminViewJulianRes = await fetch(`${baseUrl}/inquiries/${julianEnquiry._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminViewJulianRes.status === 200, 'Admin can view any enquiry (HTTP 200)');

    // 4.2 Broker Elena Can View Her Assigned Enquiry
    const elenaViewOwnRes = await fetch(`${baseUrl}/inquiries/${elenaEnquiry._id}`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    assert(elenaViewOwnRes.status === 200, 'Broker can view own assigned enquiry (HTTP 200)');

    // 4.3 Broker Elena CANNOT View Julian's Enquiry (Resource-level 403 Forbidden)
    const elenaViewJulianRes = await fetch(`${baseUrl}/inquiries/${julianEnquiry._id}`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    assert(elenaViewJulianRes.status === 403, 'Broker Elena CANNOT view Julian\'s confidential enquiry (HTTP 403 Forbidden)');

    // 4.4 Broker Elena CANNOT Add Internal Notes to Julian's Enquiry
    const elenaNoteJulianRes = await fetch(`${baseUrl}/inquiries/${julianEnquiry._id}/notes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${brokerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: 'Unauthorized intrusion attempt note' }),
    });
    assert(elenaNoteJulianRes.status === 403, 'Broker Elena CANNOT add notes to unassigned enquiry (HTTP 403 Forbidden)');

    // 4.5 Broker Elena CANNOT Modify Julian's Enquiry Status
    const elenaPatchJulianRes = await fetch(`${baseUrl}/inquiries/${julianEnquiry._id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${brokerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'archived' }),
    });
    assert(elenaPatchJulianRes.status === 403, 'Broker Elena CANNOT modify unassigned enquiry (HTTP 403 Forbidden)');

    // 4.6 Broker Elena CANNOT Reassign Enquiry
    const elenaReassignRes = await fetch(`${baseUrl}/inquiries/${elenaEnquiry._id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${brokerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assignedTo: julianId }),
    });
    assert(elenaReassignRes.status === 403, 'Broker cannot reassign enquiry to another broker (HTTP 403 Forbidden)');

    // 4.7 Broker Elena Queries Enquiry List - Only sees Assigned Enquiries
    const elenaListRes = await fetch(`${baseUrl}/inquiries`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    const elenaListData: any = await elenaListRes.json();
    const allAssignedToElena = elenaListData.data.every((inq: any) => inq.assignedTo === elenaId);
    assert(allAssignedToElena, 'Enquiry pipeline for Broker strictly returns only assigned records');

    // -------------------------------------------------------------------------
    // SUITE 5: Audit Log Trail Verification
    // -------------------------------------------------------------------------
    console.log('\n[Suite 5] Audit Log Verification:');
    const recentLogs = await AuditLogModel.find({}).sort({ timestamp: -1 }).limit(50).lean();
    const actionTypes = recentLogs.map((l) => l.action);

    assert(actionTypes.includes('successful_login'), 'Audit log recorded successful_login');
    assert(actionTypes.includes('failed_login'), 'Audit log recorded failed_login');
    assert(actionTypes.includes('invitation_created'), 'Audit log recorded invitation_created');
    assert(actionTypes.includes('unauthorized_access_attempt'), 'Audit log recorded unauthorized_access_attempt');

    // Cleanup temporary test records
    await UserModel.deleteMany({ email: { $in: [inactiveUserEmail, tempUserEmail, newBrokerEmail] } });
    await BrokerInvitationModel.deleteMany({ email: { $in: [newBrokerEmail] } });
    await InquiryModel.deleteMany({ _id: { $in: [elenaEnquiry._id, julianEnquiry._id] } });

    console.log('\n======================================================');
    console.log(`  VERIFICATION RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');
  } finally {
    testServer.close();
  }
}

runAuthSecuritySuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
