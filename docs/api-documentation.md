# Aurelia & Co. — REST API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.aureliatravel.com/api`

All requests and responses use `application/json`.
Protected routes require the `Authorization: Bearer <JWT_TOKEN>` header.

---

### Authentication & Access Governance Endpoints

#### 1. `POST /api/auth/login`
Authenticates a broker or admin, creates a server-tracked session in MongoDB, sets a secure HttpOnly cookie (`aurelia_session`), and returns credentials.
- **Access**: Public (Protected by rate limiter)
- **Request Body**:
```json
{
  "email": "alexander.vance@aureliatravel.com",
  "password": "Password123!"
}
```
- **Response 200 OK**:
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "6724...",
    "name": "Alexander Vance",
    "email": "alexander.vance@aureliatravel.com",
    "role": "admin",
    "title": "Managing Director"
  },
  "sessionId": "6afbdb...",
  "message": "Authentication successful"
}
```

#### 2. `POST /api/auth/logout`
Invalidates active server session in MongoDB and clears the `aurelia_session` HttpOnly cookie.
- **Access**: Private (Admin or Broker)

#### 3. `GET /api/auth/me`
Fetches current session user profile along with evaluated RBAC permissions.
- **Access**: Private (Admin or Broker)

#### 4. `GET /api/auth/brokers`
Returns broker roster. Admins receive all accounts with active status and assigned dossier counts; brokers receive active contacts.
- **Access**: Private (Admin or Broker)

#### 5. `POST /api/auth/invite`
Admin-only generation of a single-use onboarding invitation token (hashed via SHA-256 in MongoDB).
- **Access**: Admin only (`brokers.invite` permission)
- **Request Body**:
```json
{
  "name": "Julian de Valois",
  "email": "j.valois@aureliatravel.com",
  "title": "Senior Superyacht Charter Specialist",
  "phone": "+33 4 93 34 00 00"
}
```

#### 6. `GET /api/auth/invite/:token`
Validates that an invitation token exists, is unexpired, and has not been used or revoked.
- **Access**: Public (Rate-limited)

#### 7. `POST /api/auth/accept-invite`
Completes broker onboarding by verifying token and hashing a user-chosen password with bcrypt (salt cost 12).
- **Access**: Public (Rate-limited)
- **Request Body**:
```json
{
  "token": "<raw_crypto_token>",
  "password": "ComplexPassword2026!"
}
```

#### 8. `PATCH /api/auth/brokers/:id/status`
Admin-only activation or deactivation of a broker account. Deactivation immediately invalidates all active sessions for the broker in real-time.
- **Access**: Admin only (`brokers.deactivate` permission)
- **Request Body**:
```json
{
  "isActive": false,
  "reason": "Administrative leave"
}
```

#### 9. `POST /api/auth/invitations/:id/revoke`
Admin-only revocation of a pending invitation.
- **Access**: Admin only (`brokers.invite` permission)

#### 10. `GET /api/auth/audit-logs`
Administrative audit trail query endpoint with pagination and filtering by action/resource.
- **Access**: Admin only (`audit.read` permission)


---

### Aircraft Fleet Endpoints

#### 1. `GET /api/aircraft`
Returns published aircraft for public, or all aircraft if authenticated.
- **Query Params**: `category`, `minCapacity`, `maxCapacity`, `search`, `page`, `limit`
- **Access**: Public

#### 2. `GET /api/aircraft/:id`
Returns single aircraft specifications and image gallery.
- **Access**: Public

#### 3. `POST /api/aircraft`
Creates a new aircraft listing.
- **Access**: Private (Admin only)

#### 4. `PATCH /api/aircraft/:id`
Updates an aircraft listing.
- **Access**: Private (Admin only)

#### 5. `DELETE /api/aircraft/:id`
Deletes or archives an aircraft.
- **Access**: Private (Admin only)

---

### Superyacht Fleet Endpoints

#### 1. `GET /api/yachts`
Returns published yachts with filtering.
- **Query Params**: `region`, `minLength`, `minGuests`, `search`, `page`, `limit`
- **Access**: Public

#### 2. `GET /api/yachts/:id`
Returns full yacht specifications, deck arrangements, and toys.
- **Access**: Public

#### 3. `POST /api/yachts`
Creates a new yacht listing.
- **Access**: Private (Admin only)

#### 4. `PATCH /api/yachts/:id`
Updates a yacht listing.
- **Access**: Private (Admin only)

#### 5. `DELETE /api/yachts/:id`
Deletes or archives a yacht.
- **Access**: Private (Admin only)

---

### Destination Endpoints

#### 1. `GET /api/destinations`
Returns curated luxury destinations.
- **Query Params**: `region`, `search`
- **Access**: Public

#### 2. `GET /api/destinations/:id` (or `:slug`)
Returns destination editorial, ports, airports, and season guides.
- **Access**: Public

#### 3. `POST /api/destinations`
Creates a destination record.
- **Access**: Private (Admin only)

#### 4. `PATCH /api/destinations/:id`
Updates a destination.
- **Access**: Private (Admin only)

---

### Inquiries & Pipeline Endpoints

#### 1. `POST /api/inquiries`
Submits a bespoke multi-step enquiry from the public website.
- **Access**: Public
- **Request Body**:
```json
{
  "customerName": "Lord Evelyn Sterling",
  "email": "sterling@familyoffice.co.uk",
  "phone": "+44 20 7946 0912",
  "preferredContactMethod": "email",
  "departureLocation": "London Farnborough (EGLF)",
  "destination": "Nice Côte d'Azur / Monaco",
  "departureDate": "2026-06-15",
  "returnDate": "2026-06-25",
  "isFlexibleDates": false,
  "travellers": 8,
  "requestedServices": ["private_jet", "superyacht"],
  "budgetRange": "$250k - $500k",
  "travelPreferences": ["Transatlantic Heavy Jet", "Motor Yacht >50m with Helipad"],
  "specialRequests": "Discretion required. Master stateroom plus 3 VIP cabins."
}
```
- **Response 201 Created**:
```json
{
  "success": true,
  "data": {
    "referenceCode": "AUR-2026-8941",
    "status": "new",
    "customerName": "Lord Evelyn Sterling",
    "createdAt": "2026-11-09T06:00:00.000Z"
  },
  "message": "Your bespoke travel enquiry has been received. Our charter director will contact you within 2 hours."
}
```

#### 2. `GET /api/inquiries`
Lists all customer inquiries with pagination, status filters, and search.
- **Access**: Private (Admin, Broker)
- **Query Params**: `status`, `assignedTo`, `search`, `page`, `limit`

#### 3. `GET /api/inquiries/:id`
Fetches complete enquiry details including private broker notes.
- **Access**: Private (Admin, Broker)

#### 4. `PATCH /api/inquiries/:id`
Updates status, priority, or assigned broker.
- **Access**: Private (Admin, Broker)

#### 5. `POST /api/inquiries/:id/notes`
Adds an internal private note or supplier interaction record.
- **Access**: Private (Admin, Broker)
- **Request Body**:
```json
{
  "content": "Contacted VistaJet regarding Global 7500 availability for June 15. Awaiting firm slot confirmation.",
  "category": "supplier"
}
```

#### 6. `GET /api/stats/overview`
Returns high-level broker metrics: total enquiries, new, in-progress, confirmed, distribution by service.
- **Access**: Private (Admin, Broker)

---

### Proposals, Quotations & Itinerary Engine Endpoints

#### 1. `POST /api/proposals`
Creates a tailored client proposal with day-by-day itinerary and quotation pricing.
- **Access**: Private (Admin, Broker)
- **Request Body**: `createProposalSchema` (inquiryId, title, destination, clientName, clientEmail, validUntil, executiveSummary, aircraft, yacht, itinerary, pricing, inclusions, exclusions)

#### 2. `GET /api/proposals/inquiry/:inquiryId`
Lists all bespoke proposals created for a specific enquiry dossier.
- **Access**: Private (Admin, Broker)

#### 3. `GET /api/proposals/:id`
Fetches full details of a specific proposal.
- **Access**: Private (Admin, Broker)

#### 4. `PATCH /api/proposals/:id`
Updates proposal pricing, itinerary waypoints, or fleet allocations.
- **Access**: Private (Admin, Broker)

#### 5. `POST /api/proposals/:id/send`
Dispatches proposal to client: marks status as `sent`, updates inquiry to `quote_sent`, and activates client presentation link.
- **Access**: Private (Admin, Broker)

#### 6. `GET /api/proposals/public/:token`
Client-facing digital proposal presentation (token-authenticated, no login required for UHNW principal). Automatically records first view as `viewed`.
- **Access**: Public (Valid Client Access Token)

#### 7. `POST /api/proposals/public/:token/respond`
Client decision interaction (accept proposal, request adjustments, or decline). Acceptance automatically updates inquiry status to `confirmed` and logs client instructions.
- **Access**: Public (Valid Client Access Token)
- **Request Body**:
```json
{
  "decision": "accepted",
  "clientNotes": "Confirmed. Ready for formal MYBA agreement."
}
```

