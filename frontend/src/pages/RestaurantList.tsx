import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Rating,
  Skeleton,
  Alert,
} from '@mui/material'
import { LocationOn, AccessTime, Phone } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { restaurantAPI } from '../services/api'

const RestaurantList: React.FC = () => {
  const navigate = useNavigate()
  const { data: restaurants, isLoading, error } = useQuery('restaurants', restaurantAPI.getAll)

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Рестораны
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Ошибка загрузки ресторанов
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Рестораны
      </Typography>
      <Grid container spacing={3}>
        {restaurants?.map((restaurant) => (
          <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <Box
                sx={{
                  height: 200,
                  backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  {restaurant.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {restaurant.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {restaurant.address}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {restaurant.opening_time} - {restaurant.closing_time}
                  </Typography>
                </Box>
                {restaurant.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {restaurant.phone}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label="Открыт"
                    color="success"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Rating value={4.5} readOnly size="small" />
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  onClick={() => navigate(`/restaurants/id/${restaurant.id}`)}
                  sx={{ mr: 1 }}
                >
                  Подробнее
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => navigate(`/booking/${restaurant.id}`)}
                >
                  Забронировать
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default RestaurantList 