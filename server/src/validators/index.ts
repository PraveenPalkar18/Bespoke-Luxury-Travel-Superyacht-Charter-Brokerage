import { z } from 'zod';
import { InquiryStatus } from '../types';

export const VALID_STATUS_TRANSITIONS: Record<InquiryStatus, InquiryStatus[]> = {
  new: ['in_review', 'archived'],
  in_review: ['supplier_contacted', 'archived'],
  supplier_contacted: ['quote_sent', 'archived'],
  quote_sent: ['negotiating', 'archived'],
  negotiating: ['confirmed', 'archived'],
  confirmed: ['archived'],
  archived: ['in_review'], // Allows re-activating an archived inquiry
};

export const isValidStatusTransition = (
  current: InquiryStatus,
  target: InquiryStatus
): boolean => {
  if (current === target) return true;
  const allowed = VALID_STATUS_TRANSITIONS[current] || [];
  return allowed.includes(target);
};

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().min(1).max(100)),
  search: z.string().optional(),
  category: z.string().optional(),
  region: z.string().optional(),
  status: z
    .enum(['new', 'in_review', 'supplier_contacted', 'quote_sent', 'negotiating', 'confirmed', 'archived'])
    .optional(),
  assignedTo: z.string().optional(),
  all: z.enum(['true', 'false']).optional(),
});

export const createInquirySchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(6, 'Valid contact number is required'),
  preferredContactMethod: z.enum(['phone', 'email', 'whatsapp']).default('email'),
  departureLocation: z.string().min(2, 'Departure location is required'),
  destination: z.string().min(2, 'Destination is required'),
  departureDate: z.string().min(4, 'Departure date is required'),
  returnDate: z.string().optional(),
  isFlexibleDates: z.boolean().default(false),
  travellers: z.number().int().min(1, 'At least 1 traveller is required'),
  requestedServices: z.array(
    z.enum(['private_jet', 'superyacht', 'both', 'accommodation', 'bespoke_experiences'])
  ).min(1, 'Please select at least one requested service'),
  budgetRange: z.string().min(1, 'Budget range is required'),
  travelPreferences: z.array(z.string()).default([]),
  specialRequests: z.string().optional(),
  interestedAircraftId: z.string().optional(),
  interestedYachtId: z.string().optional(),
  interestedDestinationId: z.string().optional(),
});

export const updateInquirySchema = z.object({
  status: z
    .enum(['new', 'in_review', 'supplier_contacted', 'quote_sent', 'negotiating', 'confirmed', 'archived'])
    .optional(),
  priority: z.enum(['standard', 'high', 'vip']).optional(),
  assignedTo: z.string().optional(),
  assignedBrokerName: z.string().optional(),
  supplierNotes: z.string().optional(),
});

export const addInternalNoteSchema = z.object({
  content: z.string().min(3, 'Note content must be at least 3 characters'),
  category: z.enum(['internal', 'supplier', 'customer_call']).default('internal'),
});

export const aircraftSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  model: z.string().min(2, 'Model is required'),
  category: z.enum(['Ultra Long-Range', 'Heavy Jet', 'Super Midsize', 'Midsize', 'VIP Airliner']),
  passengerCapacity: z.number().int().min(1),
  range: z.number().min(100),
  cruiseSpeed: z.number().min(200),
  cabinHeight: z.string().min(1),
  baggageCapacity: z.string().min(1),
  hourlyRateEstimate: z.number().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  featuredImage: z.string().url('Featured image must be a valid URL'),
  description: z.string().min(10),
  editorialSummary: z.string().min(10),
  isPublished: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export const yachtSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  builder: z.string().min(2, 'Builder is required'),
  yearBuilt: z.number().int().min(1980),
  length: z.number().min(10),
  lengthFeet: z.number().min(30),
  guestCapacity: z.number().int().min(1),
  cabins: z.number().int().min(1),
  crew: z.number().int().min(1),
  beam: z.number().min(1),
  draft: z.number().min(0.5),
  cruisingSpeed: z.number().min(5),
  weeklyRateEstimate: z.number().optional(),
  regions: z.array(z.string()).min(1),
  amenities: z.array(z.string()).default([]),
  tendersAndToys: z.array(z.string()).default([]),
  images: z.array(z.string()).min(1),
  featuredImage: z.string().url(),
  description: z.string().min(10),
  editorialSummary: z.string().min(10),
  isPublished: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export const destinationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  region: z.string().min(2),
  tagline: z.string().min(5),
  description: z.string().min(10),
  highlights: z.array(z.string()).default([]),
  bestTimeToVisit: z.string().min(2),
  nearestAirports: z.array(z.string()).default([]),
  featuredPorts: z.array(z.string()).default([]),
  images: z.array(z.string()).min(1),
  featuredImage: z.string().url(),
  isPublished: z.boolean().default(true),
  featured: z.boolean().default(false),
});
