import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemText, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from '@mui/material';

export default function ProfesorEjercicios() {
  const { profesorId } = useParams();
  const [profesor, setProfesor] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);
  const [passedActivityIds, setPassedActivityIds] = useState(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEjercicio, setSelectedEjercicio] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/profesores/${profesorId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setProfesor(data));

    fetch(`${API_URL}/api/activities/teacher/${profesorId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setEjercicios(data));

    // Obtener submissions aprobadas del estudiante actual
    fetch(`${API_URL}/api/user/me`, { credentials: 'include' })
      .then(r => r.json())
      .then(me => {
        if (!me?.id) return;
        return fetch(`${API_URL}/api/submissions/student/${me.id}`, { credentials: 'include' })
          .then(r => r.json())
          .then(subs => {
            const passed = new Set(subs.filter(s => s.passed).map(s => s.activity?.id));
            setPassedActivityIds(passed);
          });
      });
  }, [profesorId]);

  const handleOpenDialog = (ejercicio) => {
    setSelectedEjercicio(ejercicio);
    setMensaje('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setMensaje('');
    setSelectedEjercicio(null);
  };

  const handleSend = async () => {
    if (!mensaje.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: mensaje,
          activityId: selectedEjercicio.id,
          recipientId: Number(profesorId)
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

  if (!profesor) return <div>Cargando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#111', fontWeight: 'bold' }}>Ejercicios del profesor: {profesor.name}</Typography>
        <Button variant="outlined" color="primary" onClick={() => navigate(`/profesores/${profesorId}/foro`)}>Foro del profesor</Button>
      </div>
      <List>
        {ejercicios.map(ej => (
          <ListItem
            key={ej.id}
            sx={{ borderRadius: 2, mb: 1, background: '#fff', boxShadow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => navigate(`/profesores/${profesorId}/ejercicio/${ej.id}`)}>
              <ListItemText
                primary={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {ej.title}
                    {ej.language && (
                      <span title={ej.language.toUpperCase()}>
                        {String(ej.language).toLowerCase() === 'python' && <img src={require('../pictures/python.png')} alt="python" style={{ width: 18, height: 18 }} />}
                        {String(ej.language).toLowerCase() === 'java' && <span style={{ fontSize: 11, padding: '1px 6px', border: '1px solid #999', borderRadius: 6 }}>Java</span>}
                        {String(ej.language).toLowerCase() === 'cpp' && <span style={{ fontSize: 11, padding: '1px 6px', border: '1px solid #999', borderRadius: 6 }}>C++</span>}
                      </span>
                    )}
                  </span>
                }
                secondary={ej.description}
              />
            </div>
            {passedActivityIds.has(ej.id) && <span style={{ color: 'green', fontWeight: 'bold' }}>✔</span>}
          </ListItem>
        ))}
      </List>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Enviar mensaje sobre el ejercicio</DialogTitle>
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
    </div>
  );
}