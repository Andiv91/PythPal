import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ProfesoresList() {
  const [profesores, setProfesores] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/profesores`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar la lista de profesores');
        return res.json();
      })
      .then(data => setProfesores(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudo cargar la lista de profesores'));
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom sx={{ color: '#111', fontWeight: 'bold' }}>Profesores</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Aquí encuentras tu profesor favorito y tomarás sus ejercicios!
      </Typography>
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>{error}</Typography>
      )}
      <List>
        {(Array.isArray(profesores) ? profesores : []).map(prof => (
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
              primary={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {prof.name} - {prof.ejerciciosCount} Ejercicios
                  {(prof.languages || []).includes('python') && <img src={require('../pictures/python.png')} alt="python" style={{ width: 16, height: 16 }} />}
                  {(prof.languages || []).includes('java') && <span style={{ fontSize: 11, padding: '1px 4px', border: '1px solid #999', borderRadius: 4 }}>Java</span>}
                  {(prof.languages || []).includes('cpp') && <span style={{ fontSize: 11, padding: '1px 4px', border: '1px solid #999', borderRadius: 4 }}>C++</span>}
                </span>
              }
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
}