import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select } from '@mui/material';

export default function TeacherRanking() {
  const [ranking, setRanking] = useState([]);
  const [activities, setActivities] = useState([]);
  const [openAssign, setOpenAssign] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [message, setMessage] = useState('Te asigno este ejercicio para resolver.');

  useEffect(() => {
    fetch(`${API_URL}/api/ranking`, { credentials: 'include' }).then(r => r.json()).then(setRanking);
    fetch(`${API_URL}/api/activities`, { credentials: 'include' }).then(r => r.json()).then(setActivities);
  }, []);

  const openAssignDialog = (student) => { setSelectedStudent(student); setOpenAssign(true); };
  const closeAssignDialog = () => { setOpenAssign(false); setSelectedStudent(null); setSelectedActivity(''); };

  const assignExercise = async () => {
    if (!selectedStudent || !selectedActivity) return;
    // Enviar mensaje con enlace al ejercicio
    await fetch(`${API_URL}/api/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ content: `${message}`, activityId: Number(selectedActivity), recipientId: Number(selectedStudent.id) })
    });
    closeAssignDialog();
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">Ranking de estudiantes</Typography>
      <Paper sx={{ p: 2 }}>
        <List>
          {ranking.map((u, idx) => (
            <ListItem key={u.id} secondaryAction={
              <Button variant="outlined" onClick={() => openAssignDialog(u)}>Asignar ejercicio</Button>
            }>
              <ListItemText primary={`${idx + 1}. ${u.name || 'Estudiante'}`} secondary={`${u.xp || 0} XP`} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={openAssign} onClose={closeAssignDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Asignar ejercicio a {selectedStudent?.name}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>Selecciona un ejercicio:</Typography>
          <Select fullWidth value={selectedActivity} onChange={e => setSelectedActivity(e.target.value)}>
            {activities.map(a => (
              <MenuItem key={a.id} value={a.id}>{a.title}</MenuItem>
            ))}
          </Select>
          <Typography sx={{ mt: 2, mb: 1 }}>Mensaje:</Typography>
          <textarea style={{ width: '100%', minHeight: 80 }} value={message} onChange={e => setMessage(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAssignDialog}>Cancelar</Button>
          <Button onClick={assignExercise} variant="contained">Enviar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


