import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

export default function TeacherExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/activities', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setExercises(data.filter(e => e.teacher)))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (id) => {
    // Redirigir a la página de edición (puedes crearla después)
    navigate(`/editar-ejercicio/${id}`);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    fetch(`${API_URL}/api/activities/${deleteId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then(() => setExercises(exercises.filter(e => e.id !== deleteId)))
      .finally(() => setConfirmOpen(false));
  };

  if (loading) return <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Mis ejercicios</Typography>
      <List>
        {exercises.map(ej => (
          <ListItem key={ej.id} secondaryAction={
            <>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(ej.id)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(ej.id)}>
                <DeleteIcon />
              </IconButton>
            </>
          } sx={{ borderRadius: 2, mb: 1, background: '#fff', boxShadow: 1 }}>
            <ListItemText primary={ej.title} secondary={ej.description} />
          </ListItem>
        ))}
      </List>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>¿Eliminar ejercicio?</DialogTitle>
        <DialogContent>Esta acción no se puede deshacer.</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={confirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 