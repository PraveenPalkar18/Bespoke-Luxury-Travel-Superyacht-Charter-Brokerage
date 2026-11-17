"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrfProtection = void 0;
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
/**
 * Robust Anti-CSRF Middleware for Cookie-Authenticated Requests.
 * - Exempts safe idempotent methods (GET, HEAD, OPTIONS).
 * - Exempts Bearer header authorization (immune to cross-site ambient credential CSRF).
 * - Exempts unauthenticated public submissions (no session cookie attached).
 * - Enforces cryptographically verified X-CSRF-Token header matching aurelia_csrf cookie
 *   for all state-changing requests (POST, PATCH, PUT, DELETE) that rely on session cookies.
 */
const csrfProtection = (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) {
        return next();
    }
    const cookieSession = req.cookies?.aurelia_session;
    const authHeader = req.headers.authorization;
    // Header-based Bearer auth is exempt as browsers never attach custom Bearer tokens automatically
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return next();
    }
    // If no session cookie is attached, request does not use ambient session credentials
    if (!cookieSession) {
        return next();
    }
    // Cookie-authenticated state-changing request: verify Anti-CSRF token
    const headerCsrf = req.headers['x-csrf-token'];
    const cookieCsrf = req.cookies?.aurelia_csrf;
    if (!headerCsrf || !cookieCsrf || headerCsrf !== cookieCsrf) {
        res.status(403).json({
            success: false,
            error: 'Forbidden',
            code: 'EBADCSRFTOKEN',
            message: 'CSRF validation failed: Missing or invalid anti-CSRF token header for cookie-authenticated operation.',
        });
        return;
    }
    next();
};
exports.csrfProtection = csrfProtection;
