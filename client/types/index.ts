export type UserRole = 'admin' | 'broker';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  phone?: string;
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
