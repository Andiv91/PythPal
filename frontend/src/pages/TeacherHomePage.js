import React from 'react';
import { Typography, Box, Container, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function TeacherHomePage({ currentUser }) {
  const theme = useTheme();
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ color: '#111', fontWeight: 'bold' }}>
          Página principal
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Bienvenido a PythPal, aquí aprenderás todo lo necesario
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: theme.palette.background.paper, color: theme.palette.text.primary, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: '#111', fontWeight: 'bold' }}>
              Bienvenido a PythPal, tu espacio para aprender Python de manera práctica y profesional.
            </Typography>
            <Typography paragraph>
              Hola, profesor{currentUser && currentUser.name ? ` ${currentUser.name}` : ''}, puede crear un ejercicio en el apartado de la izquierda, también ajustar su cuenta y ver qué estudiantes han resuelto sus problemas.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
} 