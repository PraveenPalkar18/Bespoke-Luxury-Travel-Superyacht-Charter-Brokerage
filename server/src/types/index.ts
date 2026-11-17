export type UserRole = 'admin' | 'broker';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  title?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  deactivatedAt?: Date;
  deactivatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AircraftCategory = 
  | 'Ultra Long-Range' 
  | 'Heavy Jet' 
  | 'Super Midsize' 
  | 'Midsize' 
  | 'VIP Airliner';

export interface IAircraft {
  _id: string;
  name: string;
  model: string;
  category: AircraftCategory;
  passengerCapacity: number;
  range: number; // nautical miles
  cruiseSpeed: number; // knots
  cabinHeight: string;
  baggageCapacity: string;
  hourlyRateEstimate?: number;
  amenities: string[];
  images: string[];
  featuredImage: string;
  description: string;
  editorialSummary: string;
  isPublished: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IYacht {
  _id: string;
  name: string;
  builder: string;
  yearBuilt: number;
  length: number; // meters
  lengthFeet: number;
  guestCapacity: number;
  cabins: number;
  crew: number;
  beam: number;
  draft: number;
  cruisingSpeed: number;
  weeklyRateEstimate?: number;
  regions: string[];
  amenities: string[];
  tendersAndToys: string[];
  images: string[];
  featuredImage: string;
  description: string;
  editorialSummary: string;
  isPublished: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDestination {
  _id: string;
  name: string;
  slug: string;
  region: string;
  tagline: string;
  description: string;
  highlights: string[];
  bestTimeToVisit: string;
  nearestAirports: string[];
  featuredPorts: string[];
  images: string[];
  featuredImage: string;
  isPublished: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type InquiryStatus = 
  | 'new' 
  | 'in_review' 
  | 'supplier_contacted' 
  | 'quote_sent' 
  | 'negotiating' 
  | 'confirmed' 
  | 'archived';

export type InquiryPriority = 'standard' | 'high' | 'vip';

export interface IInternalNote {
  _id: string;
  authorId: string;
  authorName: string;
  content: string;
  category: 'internal' | 'supplier' | 'customer_call';
  createdAt: Date;
}

export interface IInquiry {
  _id: string;
  referenceCode: string;
  customerName: string;
  email: string;
  phone: string;
  preferredContactMethod: 'phone' | 'email' | 'whatsapp';
  
  departureLocation: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  isFlexibleDates: boolean;
  travellers: number;
  
  requestedServices: Array<'private_jet' | 'superyacht' | 'both' | 'accommodation' | 'bespoke_experiences'>;
  budgetRange: string;
  travelPreferences: string[];
  specialRequests?: string;
  
  interestedAircraftId?: string;
  interestedYachtId?: string;
  interestedDestinationId?: string;
  
  status: InquiryStatus;
  priority: InquiryPriority;
  assignedTo?: string;
  assignedBrokerName?: string;
  internalNotes: IInternalNote[];
  supplierNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUserPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  sessionId?: string;
  permissions?: string[];
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMetadata;
}

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';

export interface IItineraryDay {
  dayNumber: number;
  title: string;
  location: string;
  description: string;
  highlights: string[];
  transportMode?: 'private_jet' | 'superyacht' | 'helicopter' | 'chauffeur' | 'leisure';
  accommodation?: string;
  image?: string;
}

export interface IProposalPricing {
  currency: 'USD' | 'EUR' | 'GBP';
  aircraftCharterPrice?: number;
  yachtCharterPrice?: number;
  estimatedAPA?: number;
  conciergeAndCrewGratuity?: number;
  taxesAndFees?: number;
  totalEstimatedCost: number;
}

export interface IProposalAircraftSpec {
  aircraftId?: string;
  name: string;
  model: string;
  category: string;
  departureFBO?: string;
  arrivalFBO?: string;
  flightHours?: number;
  passengerCount?: number;
  featuredImage?: string;
}

export interface IProposalYachtSpec {
  yachtId?: string;
  name: string;
  builder: string;
  lengthFeet: number;
  embarkationPort: string;
  disembarkationPort: string;
  charterDays: number;
  guestCount?: number;
  featuredImage?: string;
}

export interface IProposal {
  _id: string;
  inquiryId: string;
  referenceCode: string;
  title: string;
  destination: string;
  clientName: string;
  clientEmail: string;
  createdById: string;
  createdByName: string;
  status: ProposalStatus;
  validUntil: Date;
  clientAccessToken: string;
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

