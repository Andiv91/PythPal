import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

export default function ProfesorEjercicios() {
  const { profesorId } = useParams();
  const [profesor, setProfesor] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/profesores/${profesorId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setProfesor(data));

    fetch(`${API_URL}/api/activities/teacher/${profesorId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setEjercicios(data));
  }, [profesorId]);

  if (!profesor) return <div>Cargando...</div>;

  return (
    <div>
      <Typography variant="h4" gutterBottom>Ejercicios de {profesor.name}</Typography>
      <List>
        {ejercicios.map(ej => (
          <ListItem
            key={ej.id}
            button
            onClick={() => navigate(`/profesores/${profesorId}/ejercicio/${ej.id}`)}
            sx={{ borderRadius: 2, mb: 1, background: '#fff', boxShadow: 1 }}
          >
            <ListItemText
              primary={ej.title}
              secondary={ej.description}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
}