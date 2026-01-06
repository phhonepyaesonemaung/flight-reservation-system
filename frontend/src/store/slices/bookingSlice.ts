import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Booking {
  id: string
  flightId: string
  userId: string
  status: 'pending' | 'confirmed' | 'cancelled'
  totalPrice: number
  passengers: number
  createdAt: string
}

interface BookingState {
  bookings: Booking[]
  currentBooking: Booking | null
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload
    },
    setCurrentBooking: (state, action: PayloadAction<Booking | null>) => {
      state.currentBooking = action.payload
    },
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.push(action.payload)
    },
  },
})

export const { setBookings, setCurrentBooking, addBooking } = bookingSlice.actions
export default bookingSlice.reducer
