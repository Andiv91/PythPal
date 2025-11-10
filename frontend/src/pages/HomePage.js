import React, { useEffect, useState } from 'react';
import { Typography, Box, Container, Paper, List, ListItem, ListItemText } from '@mui/material';
import { API_URL } from '../config';
import { useTheme } from '@mui/material/styles';

function HomePage() {
  const theme = useTheme();
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/ranking`, { credentials: 'include' })
      .then(res => res.json())
      .then(setRanking)
      .catch(() => setRanking([]));
  }, []);
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ color: '#111', fontWeight: 'bold' }}>
          Bienvenido de vuelta!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Bienvenido a PythPal, aquí aprenderás todo lo necesario.
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: theme.palette.background.paper, color: theme.palette.text.primary, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: '#111', fontWeight: 'bold' }}>
              Ranking
            </Typography>
            <List>
              {ranking.slice(0, 5).map((u, idx) => (
                <ListItem key={u.id} sx={{ py: 0 }}>
                  <ListItemText primary={`${idx + 1}. ${u.name || 'Estudiante'} — ${u.xp} XP`} />
                </ListItem>
              ))}
              {ranking.length === 0 && (
                <Typography variant="body2" color="text.secondary">Sin datos aún.</Typography>
              )}
            </List>
          </Paper>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ color: '#111', fontWeight: 'bold' }}>
              Bienvenido a PythPal, tu espacio para aprender Python de manera práctica y profesional.
            </Typography>
            <Typography paragraph>
              En nuestra plataforma encontrarás ejercicios diseñados por expertos en programación que te guiarán desde los conceptos 
              más básicos hasta los más avanzados. Ya seas un principiante que quiere dar sus primeros pasos en la programación o un 
              desarrollador que busca profundizar sus conocimientos, tenemos el curso perfecto para ti.
            </Typography>
            <Typography paragraph sx={{ mt: 2 }}>
              Usa los botones de la izquierda para ver tus mensajes, los ejercicios que hayas intentado, los profesores y sus ejercicios, y 
              ajustar tu cuenta.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default HomePage; 