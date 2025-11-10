import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, MenuItem, Alert, CircularProgress } from '@mui/material';

const difficulties = [
  { value: 'Fácil', label: 'Fácil' },
  { value: 'Media', label: 'Media' },
  { value: 'Difícil', label: 'Difícil' },
];

export default function EditExercise() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Fácil');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/activities`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const exercise = data.find(e => e.id === Number(id));
        if (exercise) {
          setTitle(exercise.title);
          setDescription(exercise.description);
          setDifficulty(exercise.difficulty);
          setExpectedOutput(exercise.expectedOutput);
        }
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch(`${API_URL}/api/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, description, difficulty, expectedOutput })
      });
      if (!res.ok) throw new Error('Error al guardar');
      setSuccess(true);
      setTimeout(() => navigate('/ver-ejercicios'), 1000);
    } catch (err) {
      setError('No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Editar ejercicio</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Título"
          value={title}
          onChange={e => setTitle(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Descripción"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          required
          multiline
          minRows={3}
          sx={{ mb: 2 }}
        />
        <TextField
          select
          label="Dificultad"
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        >
          {difficulties.map(option => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Output esperado"
          value={expectedOutput}
          onChange={e => setExpectedOutput(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>¡Guardado!</Alert>}
        <Button type="submit" variant="contained" color="primary" disabled={saving}>
          Guardar cambios
        </Button>
      </form>
    </Box>
  );
} 