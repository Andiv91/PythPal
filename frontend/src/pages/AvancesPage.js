import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { Box, Typography, Paper, LinearProgress, Grid, List, ListItem, ListItemText, Chip } from '@mui/material';

export default function AvancesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/progress/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <Box sx={{ mt: 4, textAlign: 'center' }}>Cargando...</Box>;

  const percent = Math.round(data.completionPercent || 0);
  const level = data.level || 0;
  const xp = data.xp || 0;
  const submissions = data.submissions || [];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: '#111' }}>Avances</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">Progreso general</Typography>
            <Typography variant="body2" gutterBottom>{data.completedCount} de {data.totalActivities} ejercicios completados</Typography>
            <LinearProgress variant="determinate" value={percent} sx={{ height: 10, borderRadius: 5 }} />
            <Typography variant="body2" sx={{ mt: 1 }}>{percent}%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">Nivel y XP</Typography>
            <Typography variant="body1">Nivel: <strong>{level}</strong></Typography>
            <Typography variant="body1">XP: <strong>{xp}</strong></Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Fácil: +5 XP, Media: +10 XP, Difícil: +15 XP</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">Intentos y tiempos (mejor tiempo por ejercicio)</Typography>
        <List>
          {submissions.filter(s => s.passed).map(s => (
            <ListItem key={s.id} sx={{ borderRadius: 2, mb: 1, background: '#fff', boxShadow: 1 }}>
              <ListItemText
                primary={s.activity?.title}
                secondary={`Dificultad: ${s.activity?.difficulty || '-'} | Tiempo: ${s.durationSeconds != null ? s.durationSeconds + 's' : '—'}`}
              />
              <Chip color="success" label="Completado" />
            </ListItem>
          ))}
          {submissions.filter(s => s.passed).length === 0 && (
            <Typography variant="body2">Aún no has completado ejercicios.</Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
}


