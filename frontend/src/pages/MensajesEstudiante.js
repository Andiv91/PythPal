import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useTheme } from '@mui/material/styles';
import { useEffect as useEffectReact, useState as useStateReact } from 'react';

export default function MensajesEstudiante() {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffectReact(() => {
    fetch(`${API_URL}/api/user/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(user => setCurrentUser(user));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/messages/sent`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setMensajes(data))
      .finally(() => setLoading(false));
  }, []);

  // Agrupar mensajes por ejercicio y por profesor, mostrar solo el último mensaje de cada profesor
  const ultimosMensajesPorProfesor = {};
  mensajes.forEach(msg => {
    const key = msg.activityId + '-' + msg.recipientId;
    if (!ultimosMensajesPorProfesor[key] || new Date(msg.timestamp) > new Date(ultimosMensajesPorProfesor[key].timestamp)) {
      ultimosMensajesPorProfesor[key] = { ...msg, activityTitle: msg.activityTitle };
    }
  });
  // Agrupar por ejercicio para mostrar en la UI
  const mensajesPorEjercicio = {};
  Object.values(ultimosMensajesPorProfesor).forEach(msg => {
    if (!mensajesPorEjercicio[msg.activityId]) mensajesPorEjercicio[msg.activityId] = { title: msg.activityTitle, mensajes: [] };
    mensajesPorEjercicio[msg.activityId].mensajes.push(msg);
  });

  if (loading) return <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#111', fontWeight: 'bold' }}>
        Mensajes enviados a profesores
      </Typography>
      {Object.keys(mensajesPorEjercicio).length === 0 && (
        <Typography color="text.secondary">No has enviado mensajes aún.</Typography>
      )}
      {Object.entries(mensajesPorEjercicio).map(([activityId, { title, mensajes }]) => (
        <Paper key={activityId} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Ejercicio: {title}
          </Typography>
          <List>
            {mensajes.map(msg => {
              const isStudentSender = currentUser && msg.senderId === currentUser.id;
              const otherUserId = isStudentSender ? msg.recipientId : msg.senderId;
              const otherUserName = isStudentSender ? msg.recipientName : msg.senderName;
              return (
                <ListItem key={msg.id} alignItems="flex-start" sx={{ borderRadius: 2, mb: 1, background: '#f7f7f7', boxShadow: 1, cursor: 'pointer' }}
                  onClick={() => navigate('/chat', { state: { activityId: msg.activityId, activityTitle: title, otherUserId, otherUserName } })}>
                  <ListItemText
                    primary={<>
                      <b>Para el profesor {msg.recipientName}</b> escribiste:
                    </>}
                    secondary={msg.content}
                  />
                  <Chip label={new Date(msg.timestamp).toLocaleString()} size="small" sx={{ ml: 2 }} />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      ))}
    </Box>
  );
} 