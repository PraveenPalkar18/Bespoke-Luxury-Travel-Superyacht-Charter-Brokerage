# Aurelia & Co. — Database Design Specification

### 1. Technology Choice
- **Database Engine**: MongoDB (Mongoose ODM v8+)
- **Data Model**: Document-oriented with typed schemas, schema validation, and compound indexes for high query performance.

---

### 2. Entity Schemas

#### 2.1 Users Collection (`users`)
Stores broker and administrator accounts.
```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string;              // unique index, lowercase
  passwordHash: string;       // bcrypt hashed (12 salt rounds)
  role: 'admin' | 'broker';   // role-based access
  phone?: string;
  title?: string;             // e.g. "Managing Director", "Charter Broker"
  isActive: boolean;          // active session authorization toggle
  lastLogin?: Date;
  deactivatedAt?: Date;
  deactivatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ email: 1 }` (unique)
- `{ role: 1, isActive: 1 }`

---

#### 2.1.1 Broker Invitations Collection (`brokerinvitations`)
Governs single-use onboarding invitation tokens.
```typescript
interface IBrokerInvitation {
  _id: ObjectId;
  email: string;              // target candidate work email
  name: string;
  role: 'broker';
  phone?: string;
  title?: string;
  tokenHash: string;          // SHA-256 hash of random 64-char token (unique index)
  expiresAt: Date;            // e.g. 7 days
  isUsed: boolean;            // single-use enforcement
  usedAt?: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  invitedBy: ObjectId;        // ref to Admin User
  invitedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ tokenHash: 1 }` (unique)
- `{ email: 1, isUsed: 1, isRevoked: 1 }`
- `{ expiresAt: 1 }`

---

#### 2.1.2 Sessions Collection (`sessions`)
Tracks active server-side sessions with cryptographic hashes and TTL expiration.
```typescript
interface ISession {
  _id: ObjectId;
  userId: ObjectId;           // ref to User
  tokenHash: string;          // SHA-256 hash of session token (unique index)
  ipAddress?: string;
  userAgent?: string;
  isValid: boolean;           // invalidated upon logout or deactivation
  expiresAt: Date;            // TTL automatic expiration
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ tokenHash: 1 }` (unique)
- `{ userId: 1, isValid: 1 }`
- `{ expiresAt: 1 }` (TTL index with `expireAfterSeconds: 0`)

---

#### 2.1.3 Audit Logs Collection (`auditlogs`)
Persistent non-editable log of sensitive actions, authentication events, and authorization rejections.
```typescript
interface IAuditLog {
  _id: ObjectId;
  actor: {
    id?: string;
    email?: string;
    name?: string;
    role?: 'admin' | 'broker' | 'system' | 'anonymous';
  };
  action: string;             // e.g. "successful_login", "broker_deactivated", "unauthorized_access_attempt"
  resourceType: string;       // e.g. "auth", "user", "inquiry", "proposal"
  resourceId?: string;
  metadata?: Record<string, any>; // sanitized (no passwords, tokens or secrets)
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
```
**Indexes**:
- `{ action: 1, timestamp: -1 }`
- `{ 'actor.id': 1, timestamp: -1 }`
- `{ resourceType: 1, resourceId: 1 }`

---

#### 2.2 Aircraft Collection (`aircraft`)
Stores private aviation inventory.
```typescript
interface IAircraft {
  _id: ObjectId;
  name: string;               // e.g. "Gulfstream G700"
  model: string;              // e.g. "G700-ER"
  category: 'Ultra Long-Range' | 'Heavy Jet' | 'Super Midsize' | 'Midsize' | 'VIP Airliner';
  passengerCapacity: number;  // e.g. 19
  range: number;              // nautical miles, e.g. 7750
  cruiseSpeed: number;        // knots, e.g. 516 (Mach 0.90)
  cabinHeight: string;        // e.g. "6 ft 3 in / 1.91 m"
  baggageCapacity: string;    // e.g. "195 cu ft"
  hourlyRateEstimate?: number;// USD guidance e.g. 14500
  amenities: string[];        // ["Master Suite", "Ka-band High-Speed WiFi", "Enclosed Stateroom", "Full Galley"]
  images: string[];           // Array of high-resolution URLs
  featuredImage: string;
  description: string;
  editorialSummary: string;
  isPublished: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ isPublished: 1, category: 1 }`
- `{ featured: 1 }`

---

#### 2.3 Yachts Collection (`yachts`)
Stores luxury charter yachts and megayachts.
```typescript
interface IYacht {
  _id: ObjectId;
  name: string;               // e.g. "AQUILA"
  builder: string;            // e.g. "Derecktor"
  yearBuilt: number;          // e.g. 2010 (refit 2021)
  length: number;             // meters, e.g. 85.6
  lengthFeet: number;         // feet, e.g. 281
  guestCapacity: number;      // e.g. 12
  cabins: number;             // e.g. 7
  crew: number;               // e.g. 28
  beam: number;               // meters, e.g. 14.3
  draft: number;              // meters, e.g. 4.0
  cruisingSpeed: number;      // knots, e.g. 15
  weeklyRateEstimate?: number;// USD guidance e.g. 945000
  regions: string[];          // ["Mediterranean", "Caribbean", "Bahamas"]
  amenities: string[];        // ["Beach Club", "Helipad", "Gym & Spa", "Elevator", "Jacuzzi", "Submersible", "Cinema"]
  tendersAndToys: string[];   // ["Custom 11m Limo Tender", "Sea-Doo RXT", "Fliteboards", "Diving Gear"]
  images: string[];
  featuredImage: string;
  description: string;
  editorialSummary: string;
  isPublished: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ isPublished: 1, guestCapacity: 1 }`
- `{ regions: 1, isPublished: 1 }`
- `{ featured: 1 }`

---

#### 2.4 Destinations Collection (`destinations`)
Stores curated luxury destinations and regional travel guides.
```typescript
interface IDestination {
  _id: ObjectId;
  name: string;               // e.g. "French Riviera & Monaco"
  slug: string;               // e.g. "french-riviera" (unique)
  region: string;             // e.g. "Western Mediterranean"
  tagline: string;            // e.g. "The Glamour of the Côte d'Azur"
  description: string;
  highlights: string[];       // ["Monaco Port Hercule Berth", "Saint-Tropez Pampelonne Beach Club Access"]
  bestTimeToVisit: string;    // e.g. "May through October"
  nearestAirports: string[];  // ["Nice Côte d'Azur (LFMN / NCE)", "Cannes Mandelieu (LFMD / CEQ)"]
  featuredPorts: string[];    // ["Port Hercule, Monaco", "Port de Saint-Tropez"]
  images: string[];
  featuredImage: string;
  isPublished: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ slug: 1 }` (unique)
- `{ isPublished: 1, featured: 1 }`

---

#### 2.5 Inquiries Collection (`inquiries`)
Stores customer charter enquiries, preferences, broker assignment, and internal notes.
```typescript
interface IInternalNote {
  _id: ObjectId;
  authorId: ObjectId;         // ref: User
  authorName: string;
  content: string;
  category: 'internal' | 'supplier' | 'customer_call';
  createdAt: Date;
}

interface IInquiry {
  _id: ObjectId;
  referenceCode: string;      // e.g. "AUR-2026-8941" (unique index)
  customerName: string;
  email: string;
  phone: string;
  preferredContactMethod: 'phone' | 'email' | 'whatsapp';
  
  // Journey Details
  departureLocation: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  isFlexibleDates: boolean;
  travellers: number;
  
  // Requested Services
  requestedServices: Array<'private_jet' | 'superyacht' | 'both' | 'accommodation' | 'bespoke_experiences'>;
  
  // Preferences & Budget
  budgetRange: '$50k - $100k' | '$100k - $250k' | '$250k - $500k' | '$500k - $1M' | '$1M+';
  travelPreferences: string[];
  specialRequests?: string;
  
  // Specific Assets of Interest (Optional)
  interestedAircraftId?: ObjectId; // ref: Aircraft
  interestedYachtId?: ObjectId;    // ref: Yacht
  interestedDestinationId?: ObjectId; // ref: Destination
  
  // Broker Workflow
  status: 'new' | 'in_review' | 'supplier_contacted' | 'quote_sent' | 'negotiating' | 'confirmed' | 'archived';
  priority: 'standard' | 'high' | 'vip';
  assignedTo?: ObjectId;      // ref: User
  assignedBrokerName?: string;
  internalNotes: IInternalNote[];
  supplierNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ referenceCode: 1 }` (unique)
- `{ status: 1, createdAt: -1 }`
- `{ assignedTo: 1, status: 1 }`
- `{ email: 1 }`

---

#### 2.6 Proposals Collection (`proposals`)
Stores bespoke travel quotations, allocated fleet assets, day-by-day itineraries, and client digital access tokens.
```typescript
interface IItineraryDay {
  dayNumber: number;
  title: string;
  location: string;
  description: string;
  highlights: string[];
  transportMode?: 'private_jet' | 'superyacht' | 'helicopter' | 'chauffeur' | 'leisure';
  accommodation?: string;
  image?: string;
}

interface IProposalPricing {
  currency: 'USD' | 'EUR' | 'GBP';
  aircraftCharterPrice?: number;
  yachtCharterPrice?: number;
  estimatedAPA?: number;
  conciergeAndCrewGratuity?: number;
  taxesAndFees?: number;
  totalEstimatedCost: number;
}

interface IProposal {
  _id: ObjectId;
  inquiryId: ObjectId;          // ref: Inquiry
  referenceCode: string;        // e.g. "PROP-2026-8941" (unique index)
  title: string;
  destination: string;
  clientName: string;
  clientEmail: string;
  createdById: ObjectId;        // ref: User
  createdByName: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';
  validUntil: Date;
  clientAccessToken: string;    // secure cryptographically random token (unique index)
  executiveSummary: string;
  brokerPersonalNote?: string;
  aircraft?: IProposalAircraftSpec;
  yacht?: IProposalYachtSpec;
  itinerary: IItineraryDay[];
  pricing: IProposalPricing;
  inclusions: string[];
  exclusions: string[];
  paymentTerms: string;
  clientFeedback?: {
    respondedAt?: Date;
    decision?: 'accepted' | 'declined' | 'requested_changes';
    clientNotes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ referenceCode: 1 }` (unique)
- `{ clientAccessToken: 1 }` (unique)
- `{ inquiryId: 1, createdAt: -1 }`
- `{ status: 1 }`

