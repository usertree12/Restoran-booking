import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ru } from 'date-fns/locale'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { restaurantAPI, bookingAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'

const BookingForm: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    date: new Date(),
    time: new Date(),
    guests: 2,
    notes: '',
  })
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [bookingId, setBookingId] = useState<number | null>(null)

  const editBookingId = searchParams.get('edit')

  const { data: restaurant } = useQuery(
    ['restaurant', restaurantId],
    () => restaurantAPI.getById(Number(restaurantId)),
    { enabled: !!restaurantId }
  )

  const { data: existingBooking } = useQuery(
    ['booking', editBookingId],
    () => bookingAPI.getById(Number(editBookingId)),
    { 
      enabled: !!editBookingId,
      onSuccess: (data) => {
        setFormData({
          date: new Date(data.date),
          time: new Date(`2000-01-01T${data.time}`),
          guests: data.guests,
          notes: data.notes || '',
        })
        setSelectedTable(data.table_id)
        setBookingId(data.id)
        setIsEditing(true)
      }
    }
  )

  const { data: availableTables, refetch: refetchTables } = useQuery(
    ['available-tables', restaurantId, formData.date, formData.time, formData.guests],
    () => restaurantAPI.getAvailableTables(
      Number(restaurantId),
      format(formData.date, 'yyyy-MM-dd'),
      format(formData.time, 'HH:mm'),
      formData.guests
    ),
    { enabled: !!restaurantId }
  )

  useEffect(() => {
    if (restaurantId) {
      refetchTables()
    }
  }, [formData.date, formData.time, formData.guests, restaurantId, refetchTables])

  if (!isAuthenticated) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Для бронирования столика необходимо войти в систему
      </Alert>
    )
  }

  const createBookingMutation = useMutation(bookingAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('user-bookings')
      navigate('/my-bookings')
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Ошибка создания бронирования')
    },
  })

  const updateBookingMutation = useMutation(
    (data: any) => bookingAPI.update(bookingId!, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-bookings')
        navigate('/my-bookings')
      },
      onError: (err: any) => {
        setError(err.response?.data?.error || 'Ошибка обновления бронирования')
      },
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTable) {
      setError('Выберите столик')
      return
    }

    setLoading(true)
    setError('')

    const bookingData = {
      table_id: selectedTable,
      restaurant_id: Number(restaurantId),
      date: format(formData.date, 'yyyy-MM-dd'),
      time: format(formData.time, 'HH:mm'),
      duration: 120,
      guests: formData.guests,
      notes: formData.notes,
    }

    try {
      if (isEditing && bookingId) {
        await updateBookingMutation.mutateAsync(bookingData)
      } else {
        await createBookingMutation.mutateAsync(bookingData)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!restaurant) {
    return <CircularProgress />
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          {isEditing ? 'Редактирование бронирования' : 'Бронирование столика'}
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                {restaurant.name}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Дата"
                      value={formData.date}
                      onChange={(newValue) => {
                        if (newValue) {
                          setFormData({ ...formData, date: newValue })
                          if (!isEditing) {
                            setSelectedTable(null)
                          }
                        }
                      }}
                      slotProps={{ textField: { fullWidth: true } }}
                      minDate={new Date()}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TimePicker
                      label="Время"
                      value={formData.time}
                      onChange={(newValue) => {
                        if (newValue) {
                          setFormData({ ...formData, time: newValue })
                          if (!isEditing) {
                            setSelectedTable(null)
                          }
                        }
                      }}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Количество гостей</InputLabel>
                      <Select
                        value={formData.guests}
                        label="Количество гостей"
                        onChange={(e) => {
                          setFormData({ ...formData, guests: e.target.value as number })
                          if (!isEditing) {
                            setSelectedTable(null)
                          }
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <MenuItem key={num} value={num}>
                            {num} {num === 1 ? 'гость' : num < 5 ? 'гостя' : 'гостей'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Дополнительные пожелания"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !selectedTable}
                  sx={{ mt: 3, py: 1.5, px: 4 }}
                >
                  {loading ? <CircularProgress size={24} /> : (isEditing ? 'Обновить бронирование' : 'Забронировать')}
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Доступные столики
              </Typography>

              {!availableTables || availableTables.length === 0 ? (
                <Alert severity="info">
                  Нет доступных столиков на выбранную дату и время
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {availableTables?.map((table) => (
                    <Card
                      key={table.id}
                      sx={{
                        cursor: 'pointer',
                        border: selectedTable === table.id ? 2 : 1,
                        borderColor: selectedTable === table.id ? 'primary.main' : 'divider',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-2px)',
                        },
                      }}
                      onClick={() => setSelectedTable(table.id)}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Столик {table.number}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Вместимость: {table.capacity} человек
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Расположение: {table.location}
                        </Typography>
                        <Chip
                          label="Доступен"
                          color="success"
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  )
}

export default BookingForm 