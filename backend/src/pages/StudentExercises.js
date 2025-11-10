import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function StudentExercises() {
  const [submissions, setSubmissions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener usuario actual
    fetch(`${API_URL}/api/user/me', { credentials: 'include' })
      .then(res => res.json())
      .then(user => {
        setCurrentUser(user);
        // Obtener submissions del estudiante
        return fetch(`${API_URL}/api/submissions/student/${user.id}`, { credentials: 'include' });
      })
      .then(res => res.json())
      .then(subs => {
        // Agrupar por activityId, quedarnos con el último submission de cada uno
        const latestSubs = Object.values(subs.reduce((acc, sub) => {
          acc[sub.activity.id] = sub;
          return acc;
        }, {}));
        setSubmissions(latestSubs);
        // Obtener todas las actividades para mapear info
        return fetch(`${API_URL}/api/activities', { credentials: 'include' });
      })
      .then(res => res.json())
      .then(acts => setActivities(acts))
      .finally(() => setLoading(false));
  }, []);

  const getActivity = (activityId) => activities.find(a => a.id === activityId);

  if (loading) return <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Mis ejercicios intentados</Typography>
      <List>
        {submissions.length === 0 && <Typography>No has intentado ningún ejercicio aún.</Typography>}
        {submissions.map(sub => {
          const activity = getActivity(sub.activity.id);
          if (!activity) return null;
          return (
            <ListItem
              key={sub.id}
              button
              onClick={() => navigate(`/profesores/${activity.teacher.id}`)}
              sx={{ borderRadius: 2, mb: 1, background: '#fff', boxShadow: 1 }}
            >
              <ListItemText
                primary={activity.title}
                secondary={activity.description}
              />
              <Chip
                label={sub.passed ? 'Aprobado' : 'No aprobado'}
                color={sub.passed ? 'success' : 'error'}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
} 