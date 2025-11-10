import React, { useState } from 'react';
import { API_URL } from '../config';
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
import logo from '../pictures/python.png';
import { keyframes } from '@emotion/react';

// Gradiente animado para fondo dinámico
const animatedGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
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
      window.location.href = `${API_URL}/oauth2/authorization/google`;
    } catch (err) {
      console.error('Error al intentar registrarse con Google:', err);
      setError('Error al intentar registrarse con Google');
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
                  Bienvenido
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: '#fff' }}>
                  Crea tu cuenta con el rol correspondiente y tu correo institucional:
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <FormControl component="fieldset" sx={{ my: 2, width: '100%' }}>
                  <FormLabel component="legend" sx={{ color: '#fff' }}>Registrarse como:</FormLabel>
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
                  onClick={handleGoogleRegister}
                  sx={{ py: 1.5, mb: 2 }}
                >
                  Continuar con Google
                </Button>
                
                <Typography variant="body2" sx={{ mt: 2, fontSize: 12, color: '#fff', textAlign: 'center' }}>
                  Al crear una cuenta, aceptas los <Link to="/terms" style={{ color: '#fff', textDecoration: 'underline' }}>Términos de Servicio</Link> y la <Link to="/privacy" style={{ color: '#fff', textDecoration: 'underline' }}>Política de Privacidad</Link>.
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" align="center" sx={{ mt: 2, color: '#fff' }}>
                  ¿Ya tienes una cuenta? <Link to="/login" style={{ color: '#fff', textDecoration: 'underline' }}>Inicia sesión aquí</Link>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default RegisterPage; 