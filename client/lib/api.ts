import {
  IAircraft,
  IYacht,
  IDestination,
  IInquiry,
  IOverviewStats,
  IUser,
  PaginatedResult,
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  statusCode: number;
  errors?: Array<{ field?: string; message: string }>;

  constructor(message: string, statusCode: number, errors?: Array<{ field?: string; message: string }>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Helper for fetch with JSON parsing and normalized error handling
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(
        data.message || `Request failed with status ${res.status}`,
        res.status,
        data.errors
      );
    }

    return data;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network communication failure with brokerage server', 500);
  }
}

// --- PUBLIC WEBSITE ENDPOINTS ---

export async function fetchAircraft(params?: { category?: string; search?: string; page?: number; limit?: number }): Promise<IAircraft[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  const queryString = query.toString() ? `?${query.toString()}` : '';

  const res = await request<{ success: boolean; data: IAircraft[] }>(`/aircraft${queryString}`);
  return res.data;
}

export async function fetchAircraftById(id: string): Promise<IAircraft> {
  const res = await request<{ success: boolean; data: IAircraft }>(`/aircraft/${id}`);
  return res.data;
}

export async function fetchYachts(params?: { region?: string; search?: string; page?: number; limit?: number }): Promise<IYacht[]> {
  const query = new URLSearchParams();
  if (params?.region) query.set('region', params.region);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  const queryString = query.toString() ? `?${query.toString()}` : '';

  const res = await request<{ success: boolean; data: IYacht[] }>(`/yachts${queryString}`);
  return res.data;
}

export async function fetchYachtById(id: string): Promise<IYacht> {
  const res = await request<{ success: boolean; data: IYacht }>(`/yachts/${id}`);
  return res.data;
}

export async function fetchDestinations(params?: { region?: string; search?: string; page?: number; limit?: number }): Promise<IDestination[]> {
  const query = new URLSearchParams();
  if (params?.region) query.set('region', params.region);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  const queryString = query.toString() ? `?${query.toString()}` : '';

  const res = await request<{ success: boolean; data: IDestination[] }>(`/destinations${queryString}`);
  return res.data;
}

export async function fetchDestinationByIdOrSlug(idOrSlug: string): Promise<IDestination> {
  const res = await request<{ success: boolean; data: IDestination }>(`/destinations/${idOrSlug}`);
  return res.data;
}

export async function submitInquiry(inquiryData: {
  customerName: string;
  email: string;
  phone: string;
  preferredContactMethod?: 'phone' | 'email' | 'whatsapp';
  departureLocation: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  isFlexibleDates?: boolean;
  travellers: number;
  requestedServices: any[];
  budgetRange: string;
  travelPreferences?: string[];
  specialRequests?: string;
  interestedAircraftId?: string;
  interestedYachtId?: string;
  interestedDestinationId?: string;
}): Promise<{ referenceCode: string; message: string; data: any }> {
  const res = await request<any>(`/inquiries`, {
    method: 'POST',
    body: JSON.stringify(inquiryData),
  });
  return {
    referenceCode: res.data?.referenceCode || res.referenceCode || '',
    message: res.message || '',
    data: res.data,
  };
}

// --- AUTHENTICATION ENDPOINTS ---

export async function loginApi(email: string, password: string): Promise<{ token: string; user: IUser; message: string }> {
  const res = await request<any>(`/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const token = res.token || res.data?.token || '';
  const user = res.user || res.data?.user || ({} as IUser);
  return { token, user, message: res.message || 'Authentication successful' };
}

export async function fetchMe(token: string): Promise<IUser> {
  const res = await request<{ success: boolean; data: IUser }>(`/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function fetchBrokers(token: string): Promise<Array<{ id: string; name: string; email: string; role: string; title?: string }>> {
  const res = await request<{ success: boolean; data: any[] }>(`/auth/brokers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// --- BROKER DASHBOARD ENDPOINTS ---

export async function fetchStats(token: string): Promise<IOverviewStats> {
  const res = await request<{ success: boolean; data: IOverviewStats }>(`/stats/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function fetchInquiries(
  token: string,
  params?: { status?: string; search?: string; assignedTo?: string; page?: number; limit?: number }
): Promise<IInquiry[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.assignedTo) query.set('assignedTo', params.assignedTo);
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  const queryString = query.toString() ? `?${query.toString()}` : '';

  const res = await request<{ success: boolean; data: IInquiry[] }>(`/inquiries${queryString}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function fetchInquiryById(token: string, id: string): Promise<IInquiry> {
  const res = await request<{ success: boolean; data: IInquiry }>(`/inquiries/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateInquiryApi(
  token: string,
  id: string,
  data: Partial<IInquiry>
): Promise<IInquiry> {
  const res = await request<{ success: boolean; data: IInquiry }>(`/inquiries/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function addInquiryNoteApi(
  token: string,
  id: string,
  content: string,
  category: 'internal' | 'supplier' | 'customer_call' = 'internal'
): Promise<IInquiry> {
  const res = await request<{ success: boolean; data: IInquiry }>(`/inquiries/${id}/notes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content, category }),
  });
  return res.data;
}

// --- CATALOGUE MANAGEMENT ---

export async function createAircraftApi(token: string, data: Partial<IAircraft>): Promise<IAircraft> {
  const res = await request<{ success: boolean; data: IAircraft }>(`/aircraft`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateAircraftApi(token: string, id: string, data: Partial<IAircraft>): Promise<IAircraft> {
  const res = await request<{ success: boolean; data: IAircraft }>(`/aircraft/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteAircraftApi(token: string, id: string): Promise<boolean> {
  const res = await request<{ success: boolean }>(`/aircraft/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.success;
}

export async function createYachtApi(token: string, data: Partial<IYacht>): Promise<IYacht> {
  const res = await request<{ success: boolean; data: IYacht }>(`/yachts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateYachtApi(token: string, id: string, data: Partial<IYacht>): Promise<IYacht> {
  const res = await request<{ success: boolean; data: IYacht }>(`/yachts/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteYachtApi(token: string, id: string): Promise<boolean> {
  const res = await request<{ success: boolean }>(`/yachts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.success;
}

export async function updateDestinationApi(token: string, id: string, data: Partial<IDestination>): Promise<IDestination> {
  const res = await request<{ success: boolean; data: IDestination }>(`/destinations/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return res.data;
}
