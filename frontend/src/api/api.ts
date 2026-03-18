import type {
  Show,
  Performance,
  Hall,
  Seat,
  SeatAvailability,
  CreateReservationRequest,
  ReservationResponse,
  AdminReservation,
  User,
  LoginResponse,
  RegisterResponse,
  UserReservation,
} from './types';

const BASE = '/api';
const TOKEN_KEY = 'klara-token';

function authHeader(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeader() });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function del<T = void>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE', headers: authHeader() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `HTTP ${res.status}: ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const showsApi = {
  getAll: () => get<Show[]>('/shows'),
  getById: (id: number) => get<Show>(`/shows/${id}`),
  create: (show: Omit<Show, 'id'>) => post<Show>('/shows', show),
  update: (id: number, show: Omit<Show, 'id'>) => put<Show>(`/shows/${id}`, show),
  delete: (id: number) => del(`/shows/${id}`),
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}/shows/upload`, {
      method: 'POST',
      headers: authHeader(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(err.message ?? `HTTP ${res.status}`);
    }
    return res.json();
  },
};

export const performancesApi = {
  getAll: () => get<Performance[]>('/performances'),
  getById: (id: number) => get<Performance>(`/performances/${id}`),
  getByShow: (showId: number) => get<Performance[]>(`/performances/show/${showId}`),
  getByHall: (hallId: number) => get<Performance[]>(`/performances/hall/${hallId}`),
  getSeatMap: (performanceId: number) => get<SeatAvailability[]>(`/performances/${performanceId}/seats`),
  getOccupiedSeatIds: (performanceId: number) => get<number[]>(`/performances/${performanceId}/occupied-seats`),
  create: (p: { show: { id: number }; hall: { id: number }; startTime: string; status: string }) =>
    post<Performance>('/performances', p),
  update: (id: number, p: { show: { id: number }; hall: { id: number }; startTime: string; status: string }) =>
    put<Performance>(`/performances/${id}`, p),
  delete: (id: number) => del(`/performances/${id}`),
};

export const hallsApi = {
  getAll: () => get<Hall[]>('/halls'),
  getById: (id: number) => get<Hall>(`/halls/${id}`),
  create: (hall: Omit<Hall, 'id'>) => post<Hall>('/halls', hall),
  update: (id: number, hall: Omit<Hall, 'id'>) => put<Hall>(`/halls/${id}`, hall),
  delete: (id: number) => del(`/halls/${id}`),
};

export const seatsApi = {
  getAll: () => get<Seat[]>('/seats'),
  getById: (id: number) => get<Seat>(`/seats/${id}`),
  getByHall: (hallId: number) => get<Seat[]>(`/seats/hall/${hallId}`),
  create: (seat: { rowNumber: number; seatNumber: number; price: number; hall: { id: number } }) =>
    post<Seat>('/seats', seat),
  update: (id: number, seat: { rowNumber: number; seatNumber: number; price: number }) =>
    put<Seat>(`/seats/${id}`, seat),
  delete: (id: number) => del(`/seats/${id}`),
};

export const reservationsApi = {
  getAll: () => get<AdminReservation[]>('/reservations'),
  create: (req: CreateReservationRequest) => post<ReservationResponse>('/reservations', req),
  cancel: (id: number) => del<unknown>(`/reservations/${id}/cancel`),
  getById: (id: number) => get<ReservationResponse>(`/reservations/${id}`),
};

export const usersApi = {
  getAll: () => get<User[]>('/users'),
  getReservations: (userId: number) => get<UserReservation[]>(`/users/${userId}/reservations`),
};

export const authApi = {
  login: (email: string, password: string) =>
    post<LoginResponse>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    post<RegisterResponse>('/auth/register', { name, email, password }),
  verify: (token: string) =>
    get<{ message: string }>(`/auth/verify?token=${encodeURIComponent(token)}`),
};
