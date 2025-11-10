import React from 'react';
import { Typography, Box, Container, Paper } from '@mui/material';

export default function TeacherHomePage({ currentUser }) {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Home
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Bienvenido a Plataforma Python, aquí aprenderás todo lo necesario
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#f9f9f9', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Bienvenido a Plataforma Python, tu espacio para aprender Python de manera práctica y profesional.
            </Typography>
            <Typography paragraph>
              Hola, profesor{currentUser && currentUser.name ? ` (${currentUser.name})` : ''}, puede crear un ejercicio en el apartado de la izquierda, también ajustar su cuenta y ver qué estudiantes han resuelto sus problemas.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
} 