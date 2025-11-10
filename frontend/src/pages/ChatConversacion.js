import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip, CircularProgress, TextField, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { API_URL } from '../config';

export default function ChatConversacion() {
  const navigate = useNavigate();
  const location = useLocation();
  // Recibimos por state: activityId, activityTitle, otherUserId, otherUserName
  const { activityId, activityTitle, otherUserId, otherUserName } = location.state || {};
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    if (!activityId || !otherUserId) return;
    setLoading(true);
    fetch(`${API_URL}/api/messages/conversation?activityId=${activityId}&userId=${otherUserId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setMensajes(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [activityId, otherUserId]);

  useEffect(() => {
    // Scroll al final del chat cuando llegan mensajes
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

  const handleSend = async () => {
    if (!nuevoMensaje.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: nuevoMensaje,
          activityId: activityId,
          recipientId: otherUserId
        })
      });
      if (!res.ok) throw new Error('Error al enviar el mensaje');
      setNuevoMensaje('');
      // Refrescar mensajes
      fetch(`${API_URL}/api/messages/conversation?activityId=${activityId}&userId=${otherUserId}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setMensajes(Array.isArray(data) ? data : []));
    } catch (err) {
      setError(err.message || 'Error al enviar');
    }
    setSending(false);
  };

  const handleDeleteConversation = async () => {
    if (!window.confirm('¿Seguro que quieres borrar toda la conversación?')) return;
    try {
      await fetch(`${API_URL}/api/messages/conversation?activityId=${activityId}&userId=${otherUserId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setMensajes([]);
    } catch (err) {
      setError('Error al borrar la conversación');
    }
  };

  if (!activityId || !otherUserId) {
    return <Box sx={{ mt: 4, textAlign: 'center' }}>No hay datos de la conversación.</Box>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, display: 'flex', flexDirection: 'column', height: '80vh' }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ mr: 2 }}>Volver</Button>
          <Typography variant="h6" fontWeight="bold">Chat sobre: {activityTitle}</Typography>
        </Box>
        <Button onClick={handleDeleteConversation} color="error" startIcon={<DeleteIcon />}>
          Borrar conversación
        </Button>
      </Paper>
      <Paper ref={chatRef} sx={{ flex: 1, overflowY: 'auto', p: 2, mb: 2, bgcolor: '#f7f7f7' }}>
        {loading ? <CircularProgress /> : (
          <List>
            {mensajes.length === 0 && <Typography color="text.secondary">No hay mensajes aún.</Typography>}
            {mensajes.map(msg => (
              <ListItem key={msg.id} sx={{
                justifyContent: msg.senderId === otherUserId ? 'flex-start' : 'flex-end',
                display: 'flex',
                alignItems: 'flex-end',
                mb: 1
              }}>
                <Box sx={{
                  bgcolor: msg.senderId === otherUserId ? '#e0e0e0' : '#1976d2',
                  color: msg.senderId === otherUserId ? '#111' : '#fff',
                  borderRadius: 2,
                  p: 1.5,
                  maxWidth: '70%',
                  minWidth: '80px',
                  boxShadow: 1
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{msg.senderName}</Typography>
                  <Typography variant="body1">{msg.content}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>{new Date(msg.timestamp).toLocaleString()}</Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          value={nuevoMensaje}
          onChange={e => setNuevoMensaje(e.target.value)}
          fullWidth
          placeholder="Escribe un mensaje..."
          multiline
          minRows={1}
          maxRows={4}
        />
        <Button variant="contained" color="primary" onClick={handleSend} disabled={sending || !nuevoMensaje.trim()}>
          Enviar
        </Button>
      </Box>
      {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
    </Box>
  );
} 