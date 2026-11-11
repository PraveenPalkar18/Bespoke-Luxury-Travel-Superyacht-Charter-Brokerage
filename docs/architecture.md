# Aurelia & Co. — Bespoke Luxury Travel & Superyacht Charter Brokerage
## System Architecture Specification

### 1. Executive Overview
The platform is an ultra-high-end digital brokerage solution engineered for ultra-high-net-worth individuals (UHNWIs), family offices, corporate flight departments, and charter brokers. It bridges customer discovery of private aviation, superyachts, and bespoke global journeys with an internal broker management and operational workflow system.

### 2. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT LAYER                                         |
|                                                                                         |
|   +------------------------------------+   +----------------------------------------+   |
|   |       Public Luxury Website        |   |       Broker / Admin Dashboard         |   |
|   |  - Next.js App Router (SSR & CSR)  |   |  - Protected Route Guards              |   |
|   |  - Bespoke Midnight & Gold UI      |   |  - Real-time Enquiry Pipeline & Notes  |   |
|   |  - Multi-step Journey Planner      |   |  - Fleet & Destination Content Mgmt    |   |
|   |  - Jet / Yacht / Destination View  |   |  - Role-based Access (Admin / Broker)  |   |
|   +-----------------+------------------+   +-------------------+--------------------+   |
|                     |                                          |                        |
+---------------------|------------------------------------------|------------------------+
                      | HTTPS / REST                             | HTTPS / JWT REST
                      v                                          v
+-----------------------------------------------------------------------------------------+
|                                 APPLICATION API LAYER                                   |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   |  Node.js / Express.js Modular Monolith with TypeScript                          |   |
|   |                                                                                 |   |
|   |  +--------------------+  +--------------------+  +---------------------------+  |   |
|   |  | Authentication     |  | Enquiry & Pipeline |  | Catalogue Management      |  |   |
|   |  | - JWT Tokens       |  | - Submission       |  | - Aircraft Fleet CRUD     |  |   |
|   |  | - BCrypt Hashing   |  | - Assignment       |  | - Superyacht Fleet CRUD   |  |   |
|   |  | - RBAC Guard       |  | - Status Lifecycle |  | - Destination Content     |  |   |
|   |  | - Broker Sessions  |  | - Internal Notes   |  | - Publishing Controls     |  |   |
|   |  +--------------------+  +--------------------+  +---------------------------+  |   |
|   |                                                                                 |   |
|   |  Cross-Cutting Concerns:                                                        |   |
|   |  - Zod Input Validation Middleware                                              |   |
|   |  - Centralized Error Handling & HTTP Status Normalization                       |   |
|   |  - Security: Helmet, CORS, Rate Limiting, Sanitization                          |   |
|   +---------------------------------------+-----------------------------------------+   |
|                                           |                                             |
+-------------------------------------------|---------------------------------------------+
                                            | Mongoose ODM
                                            v
+-----------------------------------------------------------------------------------------+
|                                    PERSISTENCE LAYER                                    |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   |  MongoDB Document Database                                                      |   |
|   |  - Users Collection (Admins, Senior Brokers, Charter Specialists)               |   |
|   |  - Aircraft Collection (Heavy Jets, Ultra Long-Range, VIP Airliners)            |   |
|   |  - Yachts Collection (Superyachts, Megayachts, Explorer Yachts)                 |   |
|   |  - Destinations Collection (Riviera, Mediterranean, Maldives, Caribbean, etc.) |   |
|   |  - Inquiries Collection (Enquiries, Preferences, Statuses, Audit Logs & Notes)  |   |
|   +---------------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------------+
```

### 3. Core Subsystems

#### 3.1 Customer Experience Subsystem
- **Design Language**: Deep Midnight Navy (`#101C2C`), Ivory Alabaster (`#F7F5F0`), Champagne Gold (`#C6A76A`), Warm Beige (`#EAE6DF`), Muted Charcoal (`#1F2937`).
- **Typography**: Editorial Serif titles (Cormorant Garamond / Playfair Display) paired with crisp geometric Sans-Serif body (Inter / Manrope).
- **Navigation & Discovery**: Fluid, responsive, immersive showcases with comprehensive technical specs (cabin layout, avionics/range, crew ratios, yacht draft, tenders & toys).
- **Plan Your Journey**: 4-step wizard capturing journey legs, air/sea requirements, budget brackets, discretion and special concierge requests.

#### 3.2 Operational Broker Subsystem
- **Security & Authorization**: JWT with bearer token exchange. Strict separation between `admin` (full user & catalogue mutation) and `broker` (enquiry management, private notes, status tracking).
- **Enquiry Lifecycle**: `new` -> `in_review` -> `supplier_contacted` -> `quote_sent` -> `negotiating` -> `confirmed` -> `archived`.
- **Private Broker Notes**: Timestamped chronological internal logs that are never exposed to the client-facing APIs.
- **Supplier Interaction Logs**: Tracking operator quotes, FBO handling details, and yacht management correspondence.

#### 3.3 Extensibility Blueprint (Phase 2 & Beyond)
- **Proposals & Quotations**: Architecture supports child `proposals` linked to `inquiry_id` with PDF generation.
- **Itinerary Builder**: Day-by-day waypoint schedule with map coordinates.
- **Live Supplier Connectors**: Ready for APG, Avinode, or YachtFolio API integrations.

