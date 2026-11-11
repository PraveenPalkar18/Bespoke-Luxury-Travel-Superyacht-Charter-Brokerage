# Aurelia & Co. — Bespoke Luxury Travel & Superyacht Charter Brokerage

A full-stack, enterprise-grade digital luxury travel brokerage platform connecting discerning clients with elite charter brokers for private aviation, superyacht voyages, and ultra-bespoke expeditions.

---

## Architecture Stack

- **Client**: Next.js 15 (App Router), React 19, TypeScript, Custom Luxury Design System (Midnight Navy `#101C2C`, Champagne Gold `#C6A76A`, Ivory `#F7F5F0`).
- **Server**: Node.js, Express.js, TypeScript, REST API, Zod validation, JWT authentication, RBAC.
- **Database**: MongoDB with Mongoose ODM (Users, Aircraft, Yachts, Destinations, Inquiries).

---

## Directory Structure

```
├── client/                 # Next.js frontend application
│   ├── app/                # App Router pages and layouts
│   ├── components/         # Reusable luxury UI components
│   ├── lib/                # API client, auth context, utilities
│   └── public/             # Static luxury media assets
├── server/                 # Express.js REST API
│   ├── src/
│   │   ├── config/         # Environment & MongoDB connection
│   │   ├── models/         # Mongoose schemas
│   │   ├── controllers/    # API controllers
│   │   ├── services/       # Business logic layer
│   │   ├── routes/         # Express routing
│   │   ├── middleware/     # Auth, Zod validation, error handling
│   │   └── seed/           # Luxury seed data generator
├── docs/                   # Architectural & technical specs
│   ├── architecture.md
│   ├── database-design.md
│   └── api-documentation.md
└── README.md
```

---

## Quick Start Guide

### 1. Backend Server Setup
```bash
cd server
npm install
npm run seed     # Seeds realistic luxury jets, yachts, destinations, & demo broker
npm run dev      # Runs Express API on http://localhost:5000
```

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev      # Runs Next.js on http://localhost:3000
```

### 3. Demo Credentials
- **Admin**: `alexander.vance@aureliatravel.com` / `Password123!`
- **Charter Broker**: `elena.rostova@aureliatravel.com` / `Password123!`

