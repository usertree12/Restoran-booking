import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material'
import { Restaurant, Person, ExitToApp, AdminPanelSettings } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Header: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleClose()
    navigate('/')
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'restaurant_admin'

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
      <Toolbar>
        <Restaurant sx={{ mr: 2, color: 'primary.main' }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 600 }}
          onClick={() => navigate('/')}
        >
          Restaurant Booking
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" onClick={() => navigate('/restaurants')}>
            Рестораны
          </Button>

          {isAuthenticated ? (
            <>
              <Button color="inherit" onClick={() => navigate('/my-bookings')}>
                Мои бронирования
              </Button>
              {isAdmin && (
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/admin/bookings')}
                  startIcon={<AdminPanelSettings />}
                >
                  Админ панель
                </Button>
              )}
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <Person />
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2">
                    {user?.first_name} {user?.last_name}
                  </Typography>
                </MenuItem>
                {isAdmin && (
                  <MenuItem onClick={() => { navigate('/admin/bookings'); handleClose(); }}>
                    <AdminPanelSettings sx={{ mr: 1 }} />
                    Админ панель
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} />
                  Выйти
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Войти
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/register')}
                sx={{ borderRadius: 2 }}
              >
                Регистрация
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header 