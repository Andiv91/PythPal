import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
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
  Paper,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff, Google } from '@mui/icons-material';
import logo from '../pictures/python.png';
import { keyframes } from '@emotion/react';

// Gradiente animado para fondo dinámico
const animatedGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Verificar si hay un error en la URL (redirección desde OAuth2)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
    }
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Enviando datos de login:', { email, password, role });
      
      const response = await fetch(`${API_URL}/api/auth/login?role=${role}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
        // Verificar el estado de autenticación
        console.log('Login exitoso, verificando estado de autenticación...');
        try {
          const authStatus = await fetch(`${API_URL}/api/auth-status`, {
            credentials: 'include'
          }).then(res => res.json());
          
          console.log('Estado de autenticación:', authStatus);
          
          const userMe = await fetch(`${API_URL}/api/user/me`, {
            credentials: 'include'
          }).then(res => res.json());
          
          console.log('Información del usuario:', userMe);
        } catch (err) {
          console.error('Error verificando estado de autenticación:', err);
        }
        
        navigate('/');
      } else {
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('Error completo:', err);
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Primero establecemos el rol para la sesión
      const roleResponse = await fetch(`${API_URL}/api/auth/set-role?role=${role}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      console.log('Respuesta de set-role:', roleResponse);
      
      // Luego redirigimos a la URL de autenticación de Google
      window.location.href = `${API_URL}/oauth2/authorization/google`;
    } catch (err) {
      console.error('Error al intentar iniciar sesión con Google:', err);
      setError('Error al intentar iniciar sesión con Google');
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          background: 'linear-gradient(-45deg, #232323, #1976d2, #43cea2, #232323)',
          backgroundSize: '400% 400%',
          animation: `${animatedGradient} 15s ease infinite`,
        }}
      />
      <Container maxWidth="lg" sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'transparent',
        p: 3
      }}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={5}>
            <Card elevation={5} sx={{ borderRadius: 3, background: 'rgba(30,30,30,0.75)', color: '#fff', boxShadow: 5 }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={logo} alt="PythPal Logo" style={{ width: 80, height: 80, marginBottom: 16 }} />
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center', color: '#fff' }}>
                  ¡Bienvenido de vuelta a PythPal!
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: '#fff' }}>
                  Inicia sesión con tu correo institucional y escoge tu rol:
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                  <FormLabel component="legend" sx={{ color: '#fff' }}>Iniciar sesión como:</FormLabel>
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
                  variant="outlined"
                  fullWidth
                  startIcon={<Google />}
                  onClick={handleGoogleLogin}
                  sx={{ py: 1.5, mb: 2 }}
                >
                  Iniciar con Google
                </Button>
                
                <Typography variant="body2" align="center" sx={{ mt: 2, color: '#fff' }}>
                  ¿No tienes cuenta? <Link to="/register" style={{ color: '#fff', textDecoration: 'underline' }}>Regístrate aquí</Link>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default LoginPage; 