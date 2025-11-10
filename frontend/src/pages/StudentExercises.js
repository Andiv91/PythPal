import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { Box, Typography, List, ListItem, ListItemText, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

export default function StudentExercises() {
  const [submissions, setSubmissions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    // Obtener usuario actual
    fetch(`${API_URL}/api/user/me`, { credentials: 'include' })
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
        return fetch(`${API_URL}/api/activities`, { credentials: 'include' });
      })
      .then(res => res.json())
      .then(acts => setActivities(acts))
      .finally(() => setLoading(false));
  }, []);

  const getActivity = (activityId) => activities.find(a => a.id === activityId);

  if (loading) return <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#111', fontWeight: 'bold' }}>Mis ejercicios intentados</Typography>
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
              sx={{ borderRadius: 2, mb: 1, background: theme.palette.background.paper, color: theme.palette.text.primary, boxShadow: 1 }}
            >
              <ListItemText
                primary={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {activity.title}
                    {activity.language && (
                      <span title={activity.language.toUpperCase()}>
                        {String(activity.language).toLowerCase() === 'python' && <img src={require('../pictures/python.png')} alt="python" style={{ width: 18, height: 18 }} />}
                        {String(activity.language).toLowerCase() === 'java' && <span style={{ fontSize: 11, padding: '1px 6px', border: '1px solid #999', borderRadius: 6 }}>Java</span>}
                        {String(activity.language).toLowerCase() === 'cpp' && <span style={{ fontSize: 11, padding: '1px 6px', border: '1px solid #999', borderRadius: 6 }}>C++</span>}
                      </span>
                    )}
                  </span>
                }
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