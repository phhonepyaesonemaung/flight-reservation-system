export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'user' | 'admin'
  createdAt: string
}

export interface Flight {
  id: string
  flightNumber: string
  airline: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  price: number
  availableSeats: number
  totalSeats: number
  aircraft: string
  status: 'scheduled' | 'delayed' | 'cancelled' | 'completed'
}

export interface Booking {
  id: string
  flightId: string
  userId: string
  status: 'pending' | 'confirmed' | 'cancelled'
  totalPrice: number
  passengers: Passenger[]
  seatNumbers: string[]
  paymentStatus: 'pending' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}

export interface Passenger {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  passportNumber?: string
}

export interface SearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers: number
  class: 'economy' | 'business' | 'first'
}
