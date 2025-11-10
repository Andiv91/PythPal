import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Divider, 
  IconButton, 
  InputAdornment, 
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff, Google } from '@mui/icons-material';

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Enviando datos de registro:', { email, password, name, role });
      
      const response = await fetch(`${API_URL}/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
        credentials: 'include'
      });

      console.log('Respuesta del servidor:', response);
      
      if (!response.ok) {
        console.error('Error HTTP:', response.status, response.statusText);
        setError(`Error del servidor: ${response.status} ${response.statusText}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Datos de respuesta:', data);

      if (data.success) {
        navigate('/');
      } else {
        setError(data.message || 'Error al registrarse');
      }
    } catch (err) {
      console.error('Error completo:', err);
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      // Primero establecemos el rol para la sesión
      const roleResponse = await fetch(`${API_URL}/api/auth/set-role?role=${role}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      console.log('Respuesta de set-role:', roleResponse);
      
      // Luego redirigimos a la URL de autenticación de Google
      window.location.href = `${API_URL}/oauth2/authorization/google';
    } catch (err) {
      console.error('Error al intentar registrarse con Google:', err);
      setError('Error al intentar registrarse con Google');
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/user/me', { credentials: 'include' })
      .then(res => res.json())
      .then(user => {
        setCurrentUser(user);
        // Ahora sí, filtra los ejercicios por el profesor actual
        fetch(`${API_URL}/api/activities', { credentials: 'include' })
          .then(res => res.json())
          .then(data => setActivities(data.filter(a => a.teacher && a.teacher.id === user.id)));
      });
  }, []);

  return (
    <Container maxWidth="lg" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'url("/background-login.jpg") no-repeat center center',
      backgroundSize: 'cover',
      p: 3
    }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={5}>
          <Card elevation={5} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Crea tu cuenta
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Google />}
                onClick={handleGoogleRegister}
                sx={{ py: 1.5, mb: 2 }}
              >
                Continua con Google
              </Button>
              
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Or
                </Typography>
              </Divider>
              
              <form onSubmit={handleRegister}>
                <TextField
                  label="Correo"
                  type="email"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box component="span" sx={{ fontSize: 18 }}>✉️</Box>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  label="Nombre completo"
                  type="text"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box component="span" sx={{ fontSize: 18 }}>👤</Box>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box component="span" sx={{ fontSize: 18 }}>🔒</Box>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <FormControl component="fieldset" sx={{ my: 2, width: '100%' }}>
                  <FormLabel component="legend">Registrarse como:</FormLabel>
                  <RadioGroup row value={role} onChange={(e) => setRole(e.target.value)}>
                    <FormControlLabel 
                      value="STUDENT" 
                      control={<Radio />} 
                      label="Estudiante" 
                    />
                    <FormControlLabel 
                      value="TEACHER" 
                      control={<Radio />} 
                      label="Profesor" 
                    />
                  </RadioGroup>
                </FormControl>
                
                <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  disabled={loading}
                  sx={{ 
                    py: 1.5, 
                    mt: 1, 
                    mb: 2, 
                    bgcolor: '#333', 
                    '&:hover': {bgcolor: '#555'} 
                  }}
                >
                  Crear cuenta
                </Button>
              </form>
              
              <Typography variant="body2" sx={{ mt: 2, fontSize: 12, color: 'text.secondary', textAlign: 'center' }}>
                By creating an account, you are agree to the<br />
                <Link to="/terms" style={{ color: '#1976d2' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: '#1976d2' }}>Privacy Policy</Link>.
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                ¿Ya tienes una cuenta? <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>Iniciar sesión</Link>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default RegisterPage; 