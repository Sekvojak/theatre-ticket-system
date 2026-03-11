import type {
  Show,
  Performance,
  Seat,
  SeatAvailability,
  CreateReservationRequest,
  ReservationResponse,
  User,
  LoginResponse,
} from './types';

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const showsApi = {
  getAll: () => get<Show[]>('/shows'),
  create: (show: Omit<Show, 'id'>) => post<Show>('/shows', show),
};

export const performancesApi = {
  getAll: () => get<Performance[]>('/performances'),
  getByShow: (showId: number) => get<Performance[]>(`/performances/show/${showId}`),
  getByHall: (hallId: number) => get<Performance[]>(`/performances/hall/${hallId}`),
  getSeatMap: (performanceId: number) => get<SeatAvailability[]>(`/performances/${performanceId}/seats`),
  getOccupiedSeatIds: (performanceId: number) => get<number[]>(`/performances/${performanceId}/occupied-seats`),
};

export const seatsApi = {
  getAll: () => get<Seat[]>('/seats'),
  getByHall: (hallId: number) => get<Seat[]>(`/seats/hall/${hallId}`),
};

export const reservationsApi = {
  create: (req: CreateReservationRequest) => post<ReservationResponse>('/reservations', req),
  cancel: (id: number) => del<unknown>(`/reservations/${id}/cancel`),
  getById: (id: number) => get<ReservationResponse>(`/reservations/${id}`),
};

export const usersApi = {
  getAll: () => get<User[]>('/users'),
  create: (user: { name: string; email: string; password?: string }) => post<User>('/users', user),
};

export const authApi = {
  login: (email: string, password: string) =>
    post<LoginResponse>('/auth/login', { email, password }),
};
