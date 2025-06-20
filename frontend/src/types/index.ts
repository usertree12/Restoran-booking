export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone: string
  role: string
  restaurant_id?: number
  created_at: string
  updated_at: string
  restaurant?: Restaurant
}

export interface Restaurant {
  id: number
  name: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  opening_time: string
  closing_time: string
  created_at: string
  updated_at: string
  tables?: Table[]
}

export interface Table {
  id: number
  restaurant_id: number
  number: number
  capacity: number
  status: string
  location: string
  created_at: string
  updated_at: string
  restaurant?: Restaurant
  bookings?: Booking[]
}

export interface Booking {
  id: number
  user_id: number
  table_id: number
  restaurant_id: number
  date: string
  time: string
  duration: number
  guests: number
  status: string
  notes: string
  created_at: string
  updated_at: string
  user?: User
  table?: Table
  restaurant?: Restaurant
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
}

export interface CreateBookingRequest {
  table_id: number
  restaurant_id: number
  date: string
  time: string
  duration: number
  guests: number
  notes: string
} 