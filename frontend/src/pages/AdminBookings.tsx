import React, { useState } from 'react'
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { CheckCircle, Cancel, Edit } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const AdminBookings: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [bookingToUpdate, setBookingToUpdate] = useState<any>(null)
  const [newStatus, setNewStatus] = useState('')
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data: bookings, isLoading, error } = useQuery(
    'admin-bookings',
    () => fetch('/api/admin/bookings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    }).then(res => res.json()).then(data => data.bookings),
    { enabled: isAuthenticated }
  )

  const updateStatusMutation = useMutation(
    (data: { id: number; status: string }) =>
      fetch(`/api/admin/bookings/id/${data.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: data.status }),
      }).then(res => res.json()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-bookings')
        setStatusDialogOpen(false)
        setBookingToUpdate(null)
        setNewStatus('')
        setNotification({ message: 'Статус бронирования обновлен', type: 'success' })
      },
      onError: () => {
        setNotification({ message: 'Ошибка при обновлении статуса', type: 'error' })
      },
    }
  )

  const handleUpdateStatus = (booking: any) => {
    setBookingToUpdate(booking)
    setNewStatus(booking.status)
    setStatusDialogOpen(true)
  }

  const confirmUpdateStatus = () => {
    if (bookingToUpdate && newStatus) {
      updateStatusMutation.mutate({ id: bookingToUpdate.id, status: newStatus })
    }
  }

  const handleCloseNotification = () => {
    setNotification(null)
  }

  if (!isAuthenticated) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Для доступа к админской панели необходимо войти в систему
      </Alert>
    )
  }

  if (user?.role !== 'restaurant_admin' && user?.role !== 'admin') {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        У вас нет прав для доступа к админской панели
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
        Управление бронированиями
      </Typography>

      {user?.restaurant && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Ресторан: {user.restaurant.name}
        </Alert>
      )}

      {bookings?.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Нет бронирований для отображения
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {bookings?.map((booking: any) => (
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
                    <strong>Клиент:</strong> {booking.user?.first_name} {booking.user?.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Email:</strong> {booking.user?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Телефон:</strong> {booking.user?.phone || 'Не указан'}
                  </Typography>
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
                  {booking.status === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleUpdateStatus({ ...booking, status: 'confirmed' })}
                        sx={{ flex: 1 }}
                      >
                        Подтвердить
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleUpdateStatus({ ...booking, status: 'cancelled' })}
                        sx={{ flex: 1 }}
                      >
                        Отменить
                      </Button>
                    </Box>
                  )}
                  {booking.status === 'confirmed' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="info"
                        startIcon={<Edit />}
                        onClick={() => handleUpdateStatus({ ...booking, status: 'completed' })}
                        sx={{ flex: 1 }}
                      >
                        Завершить
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleUpdateStatus({ ...booking, status: 'cancelled' })}
                        sx={{ flex: 1 }}
                      >
                        Отменить
                      </Button>
                    </Box>
                  )}
                  {(booking.status === 'cancelled' || booking.status === 'completed') && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => handleUpdateStatus(booking)}
                      fullWidth
                    >
                      Изменить статус
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Изменить статус бронирования</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Новый статус</InputLabel>
            <Select
              value={newStatus}
              label="Новый статус"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="pending">Ожидает подтверждения</MenuItem>
              <MenuItem value="confirmed">Подтверждено</MenuItem>
              <MenuItem value="cancelled">Отменено</MenuItem>
              <MenuItem value="completed">Завершено</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={confirmUpdateStatus}
            variant="contained"
            disabled={updateStatusMutation.isLoading}
          >
            {updateStatusMutation.isLoading ? <CircularProgress size={20} /> : 'Обновить'}
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

export default AdminBookings 