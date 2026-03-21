export interface Show {
  id: number;
  title: string;
  description: string | null;
  genres: string[];
  durationMinutes: number;
  imageUrl?: string | null;
}

export interface Hall {
  id: number;
  name: string;
  capacity: number;
}

export type PerformanceStatus = 'SCHEDULED' | 'CANCELED' | 'FINISHED';

export interface Performance {
  id: number;
  startTime: string; // ISO 8601
  status: PerformanceStatus;
  show: Show;
  hall: Hall;
}

export interface Seat {
  id: number;
  rowNumber: number;
  seatNumber: number;
  price: number;
  hall: Hall;
}

export interface SeatAvailability {
  seatId: number;
  rowNumber: number;
  seatNumber: number;
  occupied: boolean;
}

export interface CreateReservationRequest {
  userId?: number;
  guestName?: string;
  guestEmail?: string;
  performanceId: number;
  seatIds: number[];
}

export interface ReservationResponse {
  id: number;
  performanceId: number;
  status: string;
  createdAt: string;
  userId?: number;
  guestName?: string;
  guestEmail?: string;
  seatIds: number[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  // password intentionally omitted from frontend type
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
}

export interface RegisterResponse {
  message: string;
}

export interface UserReservation {
  id: number;
  performance: Performance;
  status: 'ACTIVE' | 'CANCELED';
  createdAt: string;
  user?: User;
  guestName?: string;
  guestEmail?: string;
}

export type AdminReservation = {
  id: number
  performanceId: number
  showTitle?: string | null
  performanceStart?: string | null
  status: 'ACTIVE' | 'CANCELED'
  createdAt: string
  userId?: number | null
  customerName?: string | null
  customerEmail?: string | null
  seatIds?: number[]
  seatLabels?: string[]
}