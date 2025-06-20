import React from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Rating,
  Divider,
  Skeleton,
  Alert,
} from '@mui/material'
import { LocationOn, AccessTime, Phone, Email, Language } from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { restaurantAPI } from '../services/api'

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: restaurant, isLoading, error } = useQuery(
    ['restaurant', id],
    () => restaurantAPI.getById(Number(id)),
    { enabled: !!id }
  )

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={300} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="text" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={24} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  if (error || !restaurant) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Ошибка загрузки информации о ресторане
      </Alert>
    )
  }

  return (
    <Box>
      <Box
        sx={{
          height: 300,
          backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=300&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 3,
          mb: 3,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            p: 3,
            color: 'white',
          }}
        >
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            {restaurant.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Rating value={4.5} readOnly size="large" />
            <Chip label="Открыт" color="success" />
            <Chip label="4.5/5" variant="outlined" />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            О ресторане
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            {restaurant.description}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 4 }}>
            Столики
          </Typography>
          <Grid container spacing={2}>
            {restaurant.tables?.map((table) => (
              <Grid item xs={12} sm={6} md={4} key={table.id}>
                <Card>
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
                      label={table.status === 'available' ? 'Доступен' : 'Занят'}
                      color={table.status === 'available' ? 'success' : 'error'}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Информация
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {restaurant.address}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTime sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {restaurant.opening_time} - {restaurant.closing_time}
                  </Typography>
                </Box>
              </Box>

              {restaurant.phone && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {restaurant.phone}
                    </Typography>
                  </Box>
                </Box>
              )}

              {restaurant.email && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {restaurant.email}
                    </Typography>
                  </Box>
                </Box>
              )}

              {restaurant.website && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Language sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {restaurant.website}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate(`/booking/${restaurant.id}`)}
                sx={{ py: 1.5 }}
              >
                Забронировать столик
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default RestaurantDetail 