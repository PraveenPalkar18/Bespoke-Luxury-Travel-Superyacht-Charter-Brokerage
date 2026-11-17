import {
  IAircraft,
  IYacht,
  IDestination,
  IInquiry,
  IOverviewStats,
  IUser,
  PaginatedResult,
  IProposal,
} from '../types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:5000/api');

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

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

// Helper for fetch with JSON parsing and normalized error handling
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach Anti-CSRF token and XMLHttpRequest identifier for security
  const csrfToken = getCookie('aurelia_csrf');
  if (csrfToken && !headers.has('X-CSRF-Token')) {
    headers.set('X-CSRF-Token', csrfToken);
  }
  if (!headers.has('X-Requested-With')) {
    headers.set('X-Requested-With', 'XMLHttpRequest');
  }

  try {
    const res = await fetch(url, { ...options, headers, credentials: 'include' });
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

export async function logoutApi(token?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    await request<any>(`/auth/logout`, {
      method: 'POST',
      headers,
    });
    return true;
  } catch {
    return false;
  }
}

export async function fetchMe(token?: string): Promise<IUser> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await request<{ success: boolean; data: IUser }>(`/auth/me`, {
    headers,
  });
  return res.data;
}

export async function fetchBrokers(token: string): Promise<IUser[]> {
  const res = await request<{ success: boolean; data: IUser[] }>(`/auth/brokers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function inviteBrokerApi(
  token: string,
  data: { name: string; email: string; phone?: string; title?: string }
): Promise<{ id: string; email: string; name: string; expiresAt: string; inviteUrl: string; inviteToken?: string }> {
  const res = await request<{ success: boolean; data: any }>(`/auth/invite`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function fetchPendingInvitations(token: string): Promise<any[]> {
  const res = await request<{ success: boolean; data: any[] }>(`/auth/invitations/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function revokeInvitationApi(token: string, id: string): Promise<boolean> {
  const res = await request<{ success: boolean }>(`/auth/invitations/${id}/revoke`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.success;
}

export async function updateBrokerStatusApi(
  token: string,
  id: string,
  isActive: boolean,
  reason?: string
): Promise<IUser> {
  const res = await request<{ success: boolean; data: IUser }>(`/auth/brokers/${id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ isActive, reason }),
  });
  return res.data;
}

export async function fetchInvitationDetails(rawToken: string): Promise<{
  email: string;
  name: string;
  title?: string;
  expiresAt: string;
}> {
  const res = await request<{ success: boolean; data: any }>(`/auth/invite/${rawToken}`);
  return res.data;
}

export async function acceptInvitationApi(
  rawToken: string,
  password: string
): Promise<{ user: IUser; message: string }> {
  const res = await request<{ success: boolean; data: IUser; message: string }>(`/auth/accept-invite`, {
    method: 'POST',
    body: JSON.stringify({ token: rawToken, password }),
  });
  return { user: res.data, message: res.message };
}

export async function fetchAuditLogs(
  token: string,
  params?: { limit?: number; skip?: number; action?: string; resourceType?: string }
): Promise<{ logs: any[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.skip) query.set('skip', params.skip.toString());
  if (params?.action) query.set('action', params.action);
  if (params?.resourceType) query.set('resourceType', params.resourceType);
  const qStr = query.toString() ? `?${query.toString()}` : '';

  const res = await request<{ success: boolean; data: any[]; total: number }>(`/auth/audit-logs${qStr}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { logs: res.data, total: res.total };
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

// --- PROPOSALS & ITINERARIES ENDPOINTS ---

export async function fetchProposalsByInquiry(token: string, inquiryId: string): Promise<IProposal[]> {
  const res = await request<{ success: boolean; data: IProposal[] }>(`/proposals/inquiry/${inquiryId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function fetchProposalById(token: string, id: string): Promise<IProposal> {
  const res = await request<{ success: boolean; data: IProposal }>(`/proposals/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function createProposalApi(token: string, data: any): Promise<IProposal> {
  const res = await request<{ success: boolean; data: IProposal }>(`/proposals`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateProposalApi(token: string, id: string, data: any): Promise<IProposal> {
  const res = await request<{ success: boolean; data: IProposal }>(`/proposals/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function sendProposalApi(token: string, id: string): Promise<IProposal> {
  const res = await request<{ success: boolean; data: IProposal }>(`/proposals/${id}/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function deleteProposalApi(token: string, id: string): Promise<boolean> {
  const res = await request<{ success: boolean }>(`/proposals/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.success;
}

// Client Public Presentation
export async function fetchPublicProposal(token: string): Promise<IProposal> {
  const res = await request<{ success: boolean; data: IProposal }>(`/proposals/public/${token}`);
  return res.data;
}

export async function respondToPublicProposal(
  token: string,
  decision: 'accepted' | 'declined' | 'requested_changes',
  clientNotes?: string
): Promise<IProposal> {
  const res = await request<{ success: boolean; data: IProposal }>(`/proposals/public/${token}/respond`, {
    method: 'POST',
    body: JSON.stringify({ decision, clientNotes }),
  });
  return res.data;
}
