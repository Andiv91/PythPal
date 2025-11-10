import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ProfesoresList() {
  const [profesores, setProfesores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/profesores', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setProfesores(data));
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>Profesores</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Aquí encuentras tu profesor favorito y tomarás sus ejercicios!
      </Typography>
      <List>
        {profesores.map(prof => (
          <ListItem
            key={prof.id}
            button
            onClick={() => navigate(`/profesores/${prof.id}`)}
            sx={{ borderRadius: 2, mb: 1, background: '#fff', boxShadow: 1 }}
          >
            <ListItemAvatar>
              <Avatar src={prof.avatarUrl || undefined} />
            </ListItemAvatar>
            <ListItemText
              primary={`${prof.name} - ${prof.ejerciciosCount} Ejercicios`}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
}