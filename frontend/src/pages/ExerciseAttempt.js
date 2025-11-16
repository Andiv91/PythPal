import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CodeExecutor from '../components/CodeExecutor';
import { API_URL } from '../config';


export default function ExerciseAttempt() {
  const { activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  // Para mensajes
  const [openDialog, setOpenDialog] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/activities`, { credentials: 'include' })
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

  // --- Mensaje al profesor ---
  const handleOpenDialog = () => {
    setMensaje('');
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setMensaje('');
  };
  const handleSend = async () => {
    if (!mensaje.trim() || !activity) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: mensaje,
          activityId: activity.id,
          recipientId: activity.teacher.id
        })
      });
      if (!res.ok) throw new Error('Error al enviar el mensaje');
      setSnackbar({ open: true, message: 'Mensaje enviado correctamente', severity: 'success' });
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Error al enviar', severity: 'error' });
    }
    setSending(false);
  };

  if (loading || !activity) return <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {activity.title}
          {activity.language && (
            <span title={activity.language.toUpperCase()} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {activity.language.toLowerCase() === 'python' && <img src={require('../pictures/python.png')} alt="python" style={{ width: 20, height: 20 }} />}
              {activity.language.toLowerCase() === 'java' && <span style={{ fontSize: 12, padding: '2px 6px', border: '1px solid #999', borderRadius: 6 }}>Java</span>}
              {activity.language.toLowerCase() === 'cpp' && <span style={{ fontSize: 12, padding: '2px 6px', border: '1px solid #999', borderRadius: 6 }}>C++</span>}
            </span>
          )}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {activity.description}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Dificultad: {activity.difficulty}
        </Typography>
      </Paper>
      <CodeExecutor
        expectedOutput={activity.expectedOutput}
        activityId={activity.id}
        language={activity.language || 'python'}
        useTestcases={!!activity.useTestcases}
      />
      {activity.hint && (
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => setHintOpen(true)}>Pista</Button>
        </Box>
      )}

      <Dialog open={hintOpen} onClose={() => setHintOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Pista
          <IconButton aria-label="close" onClick={() => setHintOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{activity.hint}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHintOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
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
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button variant="outlined" color="primary" onClick={handleOpenDialog}>
          Escribir mensaje al profesor
        </Button>
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Enviar mensaje sobre este ejercicio</DialogTitle>
        <DialogContent>
          <TextField
            label="Mensaje"
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Borrar</Button>
          <Button onClick={handleSend} color="primary" variant="contained" disabled={sending || !mensaje.trim()}>
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 