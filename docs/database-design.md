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
  title?: string;             // e.g. "Senior Charter Director"
  isActive: boolean;          // soft-disable toggle
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ email: 1 }` (unique)
- `{ role: 1, isActive: 1 }`

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

