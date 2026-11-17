"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBrokerStatusSchema = exports.acceptInviteSchema = exports.inviteBrokerSchema = exports.clientResponseSchema = exports.updateProposalSchema = exports.createProposalSchema = exports.proposalPricingSchema = exports.itineraryDaySchema = exports.destinationSchema = exports.yachtSchema = exports.aircraftSchema = exports.addInternalNoteSchema = exports.updateInquirySchema = exports.createInquirySchema = exports.paginationQuerySchema = exports.loginSchema = exports.isValidStatusTransition = exports.VALID_STATUS_TRANSITIONS = void 0;
const zod_1 = require("zod");
exports.VALID_STATUS_TRANSITIONS = {
    new: ['in_review', 'archived'],
    in_review: ['supplier_contacted', 'archived'],
    supplier_contacted: ['quote_sent', 'archived'],
    quote_sent: ['negotiating', 'archived'],
    negotiating: ['confirmed', 'archived'],
    confirmed: ['archived'],
    archived: ['in_review'], // Allows re-activating an archived inquiry
};
const isValidStatusTransition = (current, target) => {
    if (current === target)
        return true;
    const allowed = exports.VALID_STATUS_TRANSITIONS[current] || [];
    return allowed.includes(target);
};
exports.isValidStatusTransition = isValidStatusTransition;
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please provide a valid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.paginationQuerySchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .pipe(zod_1.z.number().min(1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 20))
        .pipe(zod_1.z.number().min(1).max(100)),
    search: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    region: zod_1.z.string().optional(),
    status: zod_1.z
        .enum(['new', 'in_review', 'supplier_contacted', 'quote_sent', 'negotiating', 'confirmed', 'archived'])
        .optional(),
    assignedTo: zod_1.z.string().optional(),
    all: zod_1.z.enum(['true', 'false']).optional(),
});
exports.createInquirySchema = zod_1.z.object({
    customerName: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Valid email address is required'),
    phone: zod_1.z.string().min(6, 'Valid contact number is required'),
    preferredContactMethod: zod_1.z.enum(['phone', 'email', 'whatsapp']).default('email'),
    departureLocation: zod_1.z.string().min(2, 'Departure location is required'),
    destination: zod_1.z.string().min(2, 'Destination is required'),
    departureDate: zod_1.z.string().min(4, 'Departure date is required'),
    returnDate: zod_1.z.string().optional(),
    isFlexibleDates: zod_1.z.boolean().default(false),
    travellers: zod_1.z.number().int().min(1, 'At least 1 traveller is required'),
    requestedServices: zod_1.z.array(zod_1.z.enum(['private_jet', 'superyacht', 'both', 'accommodation', 'bespoke_experiences'])).min(1, 'Please select at least one requested service'),
    budgetRange: zod_1.z.string().min(1, 'Budget range is required'),
    travelPreferences: zod_1.z.array(zod_1.z.string()).default([]),
    specialRequests: zod_1.z.string().optional(),
    interestedAircraftId: zod_1.z.string().optional(),
    interestedYachtId: zod_1.z.string().optional(),
    interestedDestinationId: zod_1.z.string().optional(),
});
exports.updateInquirySchema = zod_1.z.object({
    status: zod_1.z
        .enum(['new', 'in_review', 'supplier_contacted', 'quote_sent', 'negotiating', 'confirmed', 'archived'])
        .optional(),
    priority: zod_1.z.enum(['standard', 'high', 'vip']).optional(),
    assignedTo: zod_1.z.string().optional(),
    assignedBrokerName: zod_1.z.string().optional(),
    supplierNotes: zod_1.z.string().optional(),
});
exports.addInternalNoteSchema = zod_1.z.object({
    content: zod_1.z.string().min(3, 'Note content must be at least 3 characters'),
    category: zod_1.z.enum(['internal', 'supplier', 'customer_call']).default('internal'),
});
exports.aircraftSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name is required'),
    model: zod_1.z.string().min(2, 'Model is required'),
    category: zod_1.z.enum(['Ultra Long-Range', 'Heavy Jet', 'Super Midsize', 'Midsize', 'VIP Airliner']),
    passengerCapacity: zod_1.z.number().int().min(1),
    range: zod_1.z.number().min(100),
    cruiseSpeed: zod_1.z.number().min(200),
    cabinHeight: zod_1.z.string().min(1),
    baggageCapacity: zod_1.z.string().min(1),
    hourlyRateEstimate: zod_1.z.number().optional(),
    amenities: zod_1.z.array(zod_1.z.string()).default([]),
    images: zod_1.z.array(zod_1.z.string()).min(1, 'At least one image is required'),
    featuredImage: zod_1.z.string().url('Featured image must be a valid URL'),
    description: zod_1.z.string().min(10),
    editorialSummary: zod_1.z.string().min(10),
    isPublished: zod_1.z.boolean().default(true),
    featured: zod_1.z.boolean().default(false),
});
exports.yachtSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name is required'),
    builder: zod_1.z.string().min(2, 'Builder is required'),
    yearBuilt: zod_1.z.number().int().min(1980),
    length: zod_1.z.number().min(10),
    lengthFeet: zod_1.z.number().min(30),
    guestCapacity: zod_1.z.number().int().min(1),
    cabins: zod_1.z.number().int().min(1),
    crew: zod_1.z.number().int().min(1),
    beam: zod_1.z.number().min(1),
    draft: zod_1.z.number().min(0.5),
    cruisingSpeed: zod_1.z.number().min(5),
    weeklyRateEstimate: zod_1.z.number().optional(),
    regions: zod_1.z.array(zod_1.z.string()).min(1),
    amenities: zod_1.z.array(zod_1.z.string()).default([]),
    tendersAndToys: zod_1.z.array(zod_1.z.string()).default([]),
    images: zod_1.z.array(zod_1.z.string()).min(1),
    featuredImage: zod_1.z.string().url(),
    description: zod_1.z.string().min(10),
    editorialSummary: zod_1.z.string().min(10),
    isPublished: zod_1.z.boolean().default(true),
    featured: zod_1.z.boolean().default(false),
});
exports.destinationSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    slug: zod_1.z.string().min(2),
    region: zod_1.z.string().min(2),
    tagline: zod_1.z.string().min(5),
    description: zod_1.z.string().min(10),
    highlights: zod_1.z.array(zod_1.z.string()).default([]),
    bestTimeToVisit: zod_1.z.string().min(2),
    nearestAirports: zod_1.z.array(zod_1.z.string()).default([]),
    featuredPorts: zod_1.z.array(zod_1.z.string()).default([]),
    images: zod_1.z.array(zod_1.z.string()).min(1),
    featuredImage: zod_1.z.string().url(),
    isPublished: zod_1.z.boolean().default(true),
    featured: zod_1.z.boolean().default(false),
});
exports.itineraryDaySchema = zod_1.z.object({
    dayNumber: zod_1.z.number().int().min(1),
    title: zod_1.z.string().min(2, 'Day title required'),
    location: zod_1.z.string().min(2, 'Location required'),
    description: zod_1.z.string().min(10, 'Description required'),
    highlights: zod_1.z.array(zod_1.z.string()).default([]),
    transportMode: zod_1.z
        .enum(['private_jet', 'superyacht', 'helicopter', 'chauffeur', 'leisure'])
        .default('leisure'),
    accommodation: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
});
exports.proposalPricingSchema = zod_1.z.object({
    currency: zod_1.z.enum(['USD', 'EUR', 'GBP']).default('USD'),
    aircraftCharterPrice: zod_1.z.number().nonnegative().optional(),
    yachtCharterPrice: zod_1.z.number().nonnegative().optional(),
    estimatedAPA: zod_1.z.number().nonnegative().optional(),
    conciergeAndCrewGratuity: zod_1.z.number().nonnegative().optional(),
    taxesAndFees: zod_1.z.number().nonnegative().optional(),
    totalEstimatedCost: zod_1.z.number().positive('Total estimated quotation amount is required'),
});
exports.createProposalSchema = zod_1.z.object({
    inquiryId: zod_1.z.string().min(1, 'Inquiry reference is required'),
    title: zod_1.z.string().min(3, 'Proposal title is required'),
    destination: zod_1.z.string().min(2, 'Destination is required'),
    clientName: zod_1.z.string().min(2, 'Client name is required'),
    clientEmail: zod_1.z.string().email('Valid client email is required'),
    validUntil: zod_1.z.string().min(4, 'Validity date is required'),
    executiveSummary: zod_1.z.string().min(15, 'Executive summary is required'),
    brokerPersonalNote: zod_1.z.string().optional(),
    aircraft: zod_1.z
        .object({
        aircraftId: zod_1.z.string().optional(),
        name: zod_1.z.string(),
        model: zod_1.z.string(),
        category: zod_1.z.string(),
        departureFBO: zod_1.z.string().optional(),
        arrivalFBO: zod_1.z.string().optional(),
        flightHours: zod_1.z.number().optional(),
        passengerCount: zod_1.z.number().optional(),
        featuredImage: zod_1.z.string().optional(),
    })
        .optional(),
    yacht: zod_1.z
        .object({
        yachtId: zod_1.z.string().optional(),
        name: zod_1.z.string(),
        builder: zod_1.z.string(),
        lengthFeet: zod_1.z.number(),
        embarkationPort: zod_1.z.string(),
        disembarkationPort: zod_1.z.string(),
        charterDays: zod_1.z.number(),
        guestCount: zod_1.z.number().optional(),
        featuredImage: zod_1.z.string().optional(),
    })
        .optional(),
    itinerary: zod_1.z.array(exports.itineraryDaySchema).min(1, 'At least one itinerary day is required'),
    pricing: exports.proposalPricingSchema,
    inclusions: zod_1.z.array(zod_1.z.string()).default([]),
    exclusions: zod_1.z.array(zod_1.z.string()).default([]),
    paymentTerms: zod_1.z.string().optional(),
});
exports.updateProposalSchema = exports.createProposalSchema.partial().extend({
    status: zod_1.z.enum(['draft', 'sent', 'viewed', 'accepted', 'declined', 'expired']).optional(),
});
exports.clientResponseSchema = zod_1.z.object({
    decision: zod_1.z.enum(['accepted', 'declined', 'requested_changes']),
    clientNotes: zod_1.z.string().optional(),
});
exports.inviteBrokerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Valid work email address is required'),
    phone: zod_1.z.string().optional(),
    title: zod_1.z.string().optional().default('Charter Broker'),
});
exports.acceptInviteSchema = zod_1.z.object({
    token: zod_1.z.string().min(10, 'Valid invitation token is required'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});
exports.updateBrokerStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
    reason: zod_1.z.string().optional(),
});
