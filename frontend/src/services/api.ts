import axios from 'axios'
import { LoginRequest, RegisterRequest, CreateBookingRequest, Restaurant, Booking, Table } from '../types'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post('/login', credentials)
    return response.data
  },
  register: async (userData: RegisterRequest) => {
    const response = await api.post('/register', userData)
    return response.data
  },
}

export const restaurantAPI = {
  getAll: async (): Promise<Restaurant[]> => {
    const response = await api.get('/restaurants')
    return response.data.restaurants
  },
  getById: async (id: number): Promise<Restaurant> => {
    const response = await api.get(`/restaurants/id/${id}`)
    return response.data.restaurant
  },
  getAvailableTables: async (restaurantId: number, date: string, time: string, guests: number): Promise<Table[]> => {
    const response = await api.get(`/restaurants/${restaurantId}/tables/available`, {
      params: { date, time, guests },
    })
    return response.data.tables
  },
}

export const bookingAPI = {
  getUserBookings: async (): Promise<Booking[]> => {
    const response = await api.get('/bookings')
    return response.data.bookings
  },
  getById: async (id: number): Promise<Booking> => {
    const response = await api.get(`/bookings/id/${id}`)
    return response.data.booking
  },
  create: async (bookingData: CreateBookingRequest): Promise<Booking> => {
    const response = await api.post('/bookings', bookingData)
    return response.data.booking
  },
  update: async (id: number, bookingData: Partial<CreateBookingRequest>): Promise<Booking> => {
    const response = await api.put(`/bookings/id/${id}`, bookingData)
    return response.data.booking
  },
  cancel: async (id: number): Promise<void> => {
    await api.delete(`/bookings/id/${id}`)
  },
}

export default api 