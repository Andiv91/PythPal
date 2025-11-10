import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Avatar, IconButton, InputBase, CircularProgress, ListItemButton, Menu, MenuItem, LinearProgress } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import MessageIcon from '@mui/icons-material/Message';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import logo from '../pictures/python.png';
import { useTheme } from '@mui/material/styles';
import MensajesProfesor from '../pages/MensajesProfesor';
import MensajesEstudiante from '../pages/MensajesEstudiante';
import { API_URL } from '../config';


const drawerWidth = 220;

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const theme = useTheme();

  // Cargar la información del usuario actual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/me`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        } else {
          console.error('Error al obtener datos del usuario');
        }
      } catch (error) {
        console.error('Error de conexión:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'STUDENT') return;
    fetch(`${API_URL}/api/progress/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(setProgressData)
      .catch(() => setProgressData(null));
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      // Realizar una petición de logout al backend (si tienes un endpoint)
      // o simplemente invalidar la sesión redirigiendo a /login
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Generar iniciales para el avatar si no hay foto
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Determinar si se debe mostrar avatar o iniciales
  const getAvatarContent = () => {
    if (loading) {
      return <CircularProgress size={24} color="inherit" />;
    }
    
    if (!currentUser) {
      return "?";
    }
    
    return getInitials(currentUser.name);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: theme.palette.background.default }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: theme.palette.mode === 'dark' ? '#181818' : '#0c5e4f',
            color: theme.palette.text.primary,
            transition: 'background 0.3s',
          },
        }}
      >
        {/* Logo y nombre de la plataforma */}
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, mb: 2 }}>
          <img src={logo} alt="PythPal Logo" style={{ width: 70, height: 70, objectFit: 'contain', marginBottom: 8 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary, textAlign: 'center', letterSpacing: 2 }}>
            PythPal
          </Typography>
        </Box>
        {/* Fin logo y nombre */}
        <List>
          {currentUser?.role === 'TEACHER' ? (
            <>
              <ListItemButton
                component={RouterLink}
                to="/"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? '#232323' : '#083f34',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }}><MenuBookIcon /></ListItemIcon>
                <ListItemText primary="Principal" sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }} />
              </ListItemButton>
              <ListItemButton
                component={RouterLink}
                to="/ver-ejercicios"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? '#232323' : '#083f34',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }}><CodeIcon /></ListItemIcon>
                <ListItemText primary="Ver ejercicios" sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }} />
              </ListItemButton>
              <ListItemButton
                component={RouterLink}
                to="/crear-ejercicio"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? '#232323' : '#083f34',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }}><AddIcon /></ListItemIcon>
                <ListItemText primary="Crear ejercicio" sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }} />
              </ListItemButton>
              <ListItemButton
                component={RouterLink}
                to="/ver-estudiantes"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? '#232323' : '#083f34',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }}><PeopleIcon /></ListItemIcon>
                <ListItemText primary="Ver estudiantes" sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }} />
              </ListItemButton>
              <ListItemButton
                component={RouterLink}
                to="/ranking"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? '#232323' : '#083f34',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }}><PeopleIcon /></ListItemIcon>
                <ListItemText primary="Ranking" sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }} />
              </ListItemButton>
              <ListItemButton
                component={RouterLink}
                to="/mensajes-profesor"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? '#232323' : '#083f34',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }}><MessageIcon /></ListItemIcon>
                <ListItemText primary="Mensajes" sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }} />
              </ListItemButton>
              <ListItemButton
                component={RouterLink}
                to="/ajustes"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? '#232323' : '#083f34',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }}><SettingsIcon /></ListItemIcon>
                <ListItemText primary="Ajustes" sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }} />
              </ListItemButton>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? '#232323' : '#083f34',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }}><ExitToAppIcon /></ListItemIcon>
                <ListItemText primary="Cerrar sesión" sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }} />
              </ListItemButton>
            </>
          ) : (
            <>
              <ListItemButton
                component={RouterLink}
                to="/"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? '#232323' : '#083f34',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }}><MenuBookIcon /></ListItemIcon>
                <ListItemText primary="Principal" sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }} />
              </ListItemButton>
              <ListItemButton
                component={RouterLink}
                to="/mensajes-estudiante"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? '#232323' : '#083f34',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }}><MessageIcon /></ListItemIcon>
                <ListItemText primary="Mensajes" sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }} />
              </ListItemButton>
              <ListItemButton
                component={RouterLink}
                to="/favoritos"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? '#232323' : '#083f34',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }}><FavoriteIcon /></ListItemIcon>
                <ListItemText primary="Favoritos" sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }} />
              </ListItemButton>
              <ListItemButton
                component={RouterLink}
                to="/profesores"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? '#232323' : '#083f34',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }}><PeopleIcon /></ListItemIcon>
                <ListItemText primary="Profesores" sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }} />
              </ListItemButton>
              <ListItemButton
                component={RouterLink}
                to="/ajustes"
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? '#232323' : '#083f34',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }}><SettingsIcon /></ListItemIcon>
                <ListItemText primary="Ajustes" sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }} />
              </ListItemButton>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  mx: 1,
                  color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? '#232323' : '#083f34',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }}><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Cerrar sesión" sx={{ color: theme.palette.mode === 'light' ? '#fff' : theme.palette.text.primary }} />
              </ListItemButton>
            </>
          )}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ p: 2, color: theme.palette.text.secondary, fontSize: 14 }}>
          <Box
            component={RouterLink}
            to="/ayuda"
            sx={{
              color: '#fff',
              textDecoration: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'block',
              textAlign: 'center',
              mb: 0.5,
              fontFamily: 'Poppins, sans-serif',
              '&:hover': { color: theme.palette.text.primary }
            }}
          >
            Ayuda
          </Box>
          <Box
            component={RouterLink}
            to="/contacto"
            sx={{
              color: '#fff',
              textDecoration: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'block',
              textAlign: 'center',
              fontFamily: 'Poppins, sans-serif',
              '&:hover': { color: theme.palette.text.primary }
            }}
          >
            Contáctanos
          </Box>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 0, background: theme.palette.background.default, color: theme.palette.text.primary, minHeight: '100vh' }}>
        {/* Header */}
        <AppBar position="static" elevation={0} sx={{ background: theme.palette.background.paper, color: theme.palette.text.primary, boxShadow: 'none', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Toolbar>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <InputBase
                placeholder="Búsqueda"
                startAdornment={<SearchIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />}
                sx={{ background: theme.palette.mode === 'dark' ? '#232323' : '#f5f6fa', borderRadius: 2, px: 2, py: 0.5, width: 300, mr: 2, color: theme.palette.text.primary }}
              />
            </Box>
            <IconButton>
              <Avatar alt={currentUser?.name || 'Usuario'} src={currentUser?.imageUrl}>
                {getAvatarContent()}
              </Avatar>
            </IconButton>
            <Typography onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1, fontWeight: 'bold', color: theme.palette.text.primary, cursor: 'pointer' }}>
              {loading ? 'Cargando...' : (currentUser?.name || 'Usuario')}
            </Typography>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              {currentUser?.role === 'STUDENT' && (
                <Box sx={{ p: 2, width: 320 }}>
                  <Typography variant="subtitle2">Nivel: {progressData?.level ?? 0}</Typography>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>XP: {progressData?.xp ?? 0}</Typography>
                  <Typography variant="caption">Progreso general</Typography>
                  <LinearProgress variant="determinate" value={Math.round(progressData?.completionPercent || 0)} sx={{ my: 1 }} />
                  <Typography variant="caption">{progressData?.completedCount || 0} / {progressData?.totalActivities || 0} ejercicios</Typography>
                </Box>
              )}
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/avances'); }}>Ver avances</MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/ajustes'); }}>Ajustes</MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }}>Cerrar sesión</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 4, background: theme.palette.background.default, color: theme.palette.text.primary, minHeight: 'calc(100vh - 64px)' }}>
          {React.Children.map(children, child =>
            React.isValidElement(child)
              ? React.cloneElement(child, { currentUser })
              : child
          )}
        </Box>
      </Box>
    </Box>
  );
}