import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  Paper,
} from '@mui/material'
import {
  Restaurant,
  AccessTime,
  LocationOn,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: <Restaurant sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Бронирование столиков',
      description: 'Легко забронируйте столик в любимом ресторане',
    },
    {
      icon: <AccessTime sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Удобное время',
      description: 'Выбирайте удобное для вас время посещения',
    },
    {
      icon: <LocationOn sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Лучшие рестораны',
      description: 'Широкий выбор ресторанов в вашем городе',
    },
  ]

  return (
    <Box>
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop)',
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.3)',
            borderRadius: 3,
          }}
        />
        <Box
          sx={{
            position: 'relative',
            p: { xs: 3, md: 6 },
            pr: { md: 0 },
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Добро пожаловать в систему бронирования ресторанов
          </Typography>
          <Typography variant="h5" paragraph sx={{ mb: 4, opacity: 0.9 }}>
            Найдите и забронируйте столик в лучших ресторанах города
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/restaurants')}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Найти ресторан
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Зарегистрироваться
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          Почему выбирают нас?
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'primary.main', color: 'white' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Готовы начать?
          </Typography>
          <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
            Присоединяйтесь к тысячам довольных клиентов
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/restaurants')}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
          >
            Начать бронирование
          </Button>
        </Paper>
      </Container>
    </Box>
  )
}

export default Home 