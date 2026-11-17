export type UserRole = 'admin' | 'broker';

export interface IUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  phone?: string;
  isActive?: boolean;
  lastLogin?: string;
  assignedEnquiriesCount?: number;
  permissions?: string[];
  createdAt?: string;
}

export interface IBrokerInvitation {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  title?: string;
  expiresAt: string;
  isUsed: boolean;
  isRevoked: boolean;
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  actor: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  };
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
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
  range: number;
  cruiseSpeed: number;
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
}

export interface IYacht {
  _id: string;
  name: string;
  builder: string;
  yearBuilt: number;
  length: number;
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

export type RequestedService = 
  | 'private_jet' 
  | 'superyacht' 
  | 'both' 
  | 'accommodation' 
  | 'bespoke_experiences';

export interface IInternalNote {
  _id: string;
  authorId: string;
  authorName: string;
  content: string;
  category: 'internal' | 'supplier' | 'customer_call';
  createdAt: string;
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
  
  requestedServices: RequestedService[];
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
  
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMetadata;
}

export interface IOverviewStats {
  totalEnquiries: number;
  newEnquiries: number;
  inProgressEnquiries: number;
  confirmedEnquiries: number;
  serviceDistribution: {
    private_jet: number;
    superyacht: number;
    both: number;
    other: number;
  };
  recentEnquiries: IInquiry[];
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
  validUntil: string;
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
    respondedAt?: string;
    decision?: 'accepted' | 'declined' | 'requested_changes';
    clientNotes?: string;
  };
  createdAt: string;
  updatedAt: string;
}
