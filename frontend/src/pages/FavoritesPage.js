import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/favorites/student/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFavorites(data);
        } else if (data && typeof data === 'object' && data.length === undefined) {
          setFavorites([]);
        } else {
          setFavorites(data || []);
        }
      })
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  if (!favorites || favorites.length === 0) {
    return (
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          No has agregado ningún ejercicio como favorito, ¡anímate!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#111', fontWeight: 'bold' }}>Mis favoritos</Typography>
      <List>
        {favorites.map(fav => (
          <ListItem
            key={fav.id}
            button
            onClick={() => navigate(`/profesores/${fav.teacher.id}/ejercicio/${fav.id}`)}
            sx={{ borderRadius: 2, mb: 1, background: '#fff', boxShadow: 1 }}
          >
            <ListItemText
              primary={fav.title}
              secondary={fav.description}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 