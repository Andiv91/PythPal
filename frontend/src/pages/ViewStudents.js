import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { Box, Typography, MenuItem, Select, List, ListItem, ListItemText, Chip, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function ViewStudents() {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    // Obtener usuario actual y luego filtrar actividades por profesor
    fetch(`${API_URL}/api/user/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(user => {
        setCurrentUser(user);
        fetch(`${API_URL}/api/activities`, { credentials: 'include' })
          .then(res => res.json())
          .then(data => setActivities(data.filter(a => a.teacher && a.teacher.id === user.id)));
      });
  }, []);

  useEffect(() => {
    if (!selectedActivity) return;
    setLoading(true);
    fetch(`${API_URL}/api/submissions/activity/${selectedActivity}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setSubmissions(data))
      .finally(() => setLoading(false));
  }, [selectedActivity]);

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#111', fontWeight: 'bold' }}>Ver estudiantes por ejercicio</Typography>
      <Select
        value={selectedActivity}
        onChange={e => setSelectedActivity(e.target.value)}
        displayEmpty
        fullWidth
        sx={{ mb: 3 }}
      >
        <MenuItem value="" disabled>Selecciona un ejercicio</MenuItem>
        {activities.map(act => (
          <MenuItem key={act.id} value={act.id}>{act.title}</MenuItem>
        ))}
      </Select>
      {loading && <CircularProgress />}
      {!loading && selectedActivity && (
        <List>
          {submissions.length === 0 && <Typography>No hay submissions para este ejercicio.</Typography>}
          {submissions.map(sub => (
            <ListItem key={sub.id} sx={{ borderRadius: 2, mb: 1, background: theme.palette.background.paper, color: theme.palette.text.primary, boxShadow: 1 }}>
              <ListItemText
                primary={sub.student?.name || 'Estudiante'}
                secondary={`Código: ${sub.code?.slice(0, 40)}...`}
              />
              <Chip
                label={sub.passed ? 'Aprobado' : 'No aprobado'}
                color={sub.passed ? 'success' : 'error'}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
} 