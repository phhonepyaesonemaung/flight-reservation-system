import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Flight {
  id: string
  flightNumber: string
  airline: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  price: number
  availableSeats: number
}

interface FlightState {
  flights: Flight[]
  selectedFlight: Flight | null
  searchParams: {
    origin: string
    destination: string
    departureDate: string
    returnDate: string | null
    passengers: number
  } | null
}

const initialState: FlightState = {
  flights: [],
  selectedFlight: null,
  searchParams: null,
}

const flightSlice = createSlice({
  name: 'flight',
  initialState,
  reducers: {
    setFlights: (state, action: PayloadAction<Flight[]>) => {
      state.flights = action.payload
    },
    setSelectedFlight: (state, action: PayloadAction<Flight | null>) => {
      state.selectedFlight = action.payload
    },
    setSearchParams: (state, action: PayloadAction<FlightState['searchParams']>) => {
      state.searchParams = action.payload
    },
  },
})

export const { setFlights, setSelectedFlight, setSearchParams } = flightSlice.actions
export default flightSlice.reducer
