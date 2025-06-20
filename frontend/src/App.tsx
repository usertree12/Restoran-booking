import { Routes, Route } from 'react-router-dom'
import { Container, Box } from '@mui/material'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RestaurantList from './pages/RestaurantList'
import RestaurantDetail from './pages/RestaurantDetail'
import BookingForm from './pages/BookingForm'
import MyBookings from './pages/MyBookings'
import AdminBookings from './pages/AdminBookings'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/restaurants" element={<RestaurantList />} />
            <Route path="/restaurants/id/:id" element={<RestaurantDetail />} />
            <Route path="/booking/:restaurantId" element={<BookingForm />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
          </Routes>
        </Container>
      </Box>
    </AuthProvider>
  )
}

export default App 