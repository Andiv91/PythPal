import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import PythonExecutor from '../components/PythonExecutor';

export default function ExerciseAttempt() {
  const { activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/activities', { credentials: 'include' })
      .then(res => res.json())
      .then(activities => {
        const found = activities.find(a => a.id === Number(activityId));
        setActivity(found);
        setLoading(false);
      });
  }, [activityId]);

  const fetchFavoriteStatus = () => {
    fetch(`${API_URL}/api/favorites/activity/${activityId}`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        // Si el backend devuelve un objeto favorito, null o false
        setIsFavorite(!!(data && (typeof data === 'object' ? Object.keys(data).length > 0 : data)));
      });
  };

  useEffect(() => {
    fetchFavoriteStatus();
  }, [activityId]);

  const handleMarkFavorite = async () => {
    setFavoriteLoading(true);
    setIsFavorite(true); // Actualiza localmente de inmediato
    setJustAdded(true);
    await fetch(`${API_URL}/api/favorites/${activityId}`, {
      method: 'POST',
      credentials: 'include',
    });
    setFavoriteLoading(false);
    setTimeout(() => setJustAdded(false), 1500);
    // fetchFavoriteStatus(); // Opcional: sincronizar con backend
  };

  const handleRemoveFavorite = async () => {
    setFavoriteLoading(true);
    setIsFavorite(false); // Actualiza localmente de inmediato
    await fetch(`${API_URL}/api/favorites/${activityId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setFavoriteLoading(false);
    setJustAdded(false);
    // fetchFavoriteStatus(); // Opcional: sincronizar con backend
  };

  if (loading || !activity) return <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {activity.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {activity.description}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Dificultad: {activity.difficulty}
        </Typography>
      </Paper>
      <PythonExecutor
        expectedOutput={activity.expectedOutput}
      />
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        {isFavorite ? (
          <Button variant="outlined" color="secondary" onClick={handleRemoveFavorite} disabled={favoriteLoading}>
            {justAdded ? 'Agregado a favoritos' : 'Quitar de favoritos'}
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleMarkFavorite} disabled={favoriteLoading}>
            Marcar como favorito
          </Button>
        )}
      </Box>
    </Box>
  );
} 