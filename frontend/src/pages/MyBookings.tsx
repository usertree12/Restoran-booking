import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material'
import { Delete, Edit } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { bookingAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const MyBookings: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false)
  const [bookingToCancel, setBookingToCancel] = React.useState<number | null>(null)
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data: bookings, isLoading, error } = useQuery(
    'user-bookings',
    bookingAPI.getUserBookings,
    { enabled: isAuthenticated }
  )

  const cancelBookingMutation = useMutation(bookingAPI.cancel, {
    onSuccess: (data) => {
      queryClient.setQueryData('user-bookings', (oldData: any) => {
        if (!oldData) return oldData
        return oldData.map((booking: any) => 
          booking.id === bookingToCancel 
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      })
      setCancelDialogOpen(false)
      setBookingToCancel(null)
      setNotification({ message: 'Бронирование успешно отменено', type: 'success' })
    },
    onError: () => {
      setNotification({ message: 'Ошибка при отмене бронирования', type: 'error' })
    },
  })

  const handleEditBooking = (booking: any) => {
    navigate(`/booking/${booking.restaurant_id}?edit=${booking.id}`)
  }

  const handleCancelBooking = (bookingId: number) => {
    setBookingToCancel(bookingId)
    setCancelDialogOpen(true)
  }

  const confirmCancelBooking = () => {
    if (bookingToCancel) {
      cancelBookingMutation.mutate(bookingToCancel)
    }
  }

  const handleCloseNotification = () => {
    setNotification(null)
  }

  if (!isAuthenticated) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Для просмотра бронирований необходимо войти в систему
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Ошибка загрузки бронирований
      </Alert>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'confirmed':
        return 'success'
      case 'cancelled':
        return 'error'
      case 'completed':
        return 'info'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает подтверждения'
      case 'confirmed':
        return 'Подтверждено'
      case 'cancelled':
        return 'Отменено'
      case 'completed':
        return 'Завершено'
      default:
        return status
    }
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Мои бронирования
      </Typography>

      {bookings?.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          У вас пока нет бронирований
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {bookings?.map((booking) => (
            <Grid item xs={12} md={6} key={booking.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {booking.status === 'cancelled' && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Бронирование отменено
                    </Alert>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                      {booking.restaurant?.name}
                    </Typography>
                    <Chip
                      label={getStatusText(booking.status)}
                      color={getStatusColor(booking.status) as any}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Дата:</strong> {format(new Date(booking.date), 'dd MMMM yyyy', { locale: ru })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Время:</strong> {booking.time}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Гостей:</strong> {booking.guests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Столик:</strong> {booking.table?.number} ({booking.table?.location})
                  </Typography>
                  {booking.notes && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Примечания:</strong> {booking.notes}
                    </Typography>
                  )}
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleEditBooking(booking)}
                        sx={{ flex: 1 }}
                      >
                        Изменить
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleCancelBooking(booking.id)}
                        sx={{ flex: 1 }}
                      >
                        Отменить
                      </Button>
                    </Box>
                  )}
                  {booking.status === 'cancelled' && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                      Бронирование отменено
                    </Typography>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Отменить бронирование?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите отменить это бронирование? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={confirmCancelBooking}
            color="error"
            variant="contained"
            disabled={cancelBookingMutation.isLoading}
          >
            {cancelBookingMutation.isLoading ? <CircularProgress size={20} /> : 'Отменить'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification?.type}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default MyBookings 