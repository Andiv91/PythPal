import React, { useState } from 'react';
import { Box, Button, TextField, Typography, MenuItem, Alert } from '@mui/material';
import { API_URL } from '../config';

const difficulties = [
  { value: 'Fácil', label: 'Fácil' },
  { value: 'Media', label: 'Media' },
  { value: 'Difícil', label: 'Difícil' },
];

export default function CreateExercise() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Fácil');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [language, setLanguage] = useState('python');
  const [hint, setHint] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch(`${API_URL}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, description, difficulty, expectedOutput, language, hint }),
      });
      if (!res.ok) throw new Error('Error al crear el ejercicio');
      setSuccess(true);
      setTitle('');
      setDescription('');
      setDifficulty('Fácil');
      setExpectedOutput('');
      setLanguage('python');
      setHint('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#111', fontWeight: 'bold' }}>Crear ejercicio</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Título"
          value={title}
          onChange={e => setTitle(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Descripción"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          required
          margin="normal"
          multiline
          minRows={3}
        />
        <TextField
          select
          label="Dificultad"
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          fullWidth
          margin="normal"
        >
          {difficulties.map(option => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Pista (opcional)"
          value={hint}
          onChange={e => setHint(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
        />
        <TextField
          select
          label="Lenguaje"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          fullWidth
          required
          margin="normal"
        >
          <MenuItem value="python">Python</MenuItem>
          <MenuItem value="java">Java</MenuItem>
          <MenuItem value="cpp">C++</MenuItem>
        </TextField>
        <TextField
          label="Output esperado"
          value={expectedOutput}
          onChange={e => setExpectedOutput(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Creando...' : 'Crear ejercicio'}
        </Button>
        {success && <Alert severity="success" sx={{ mt: 2 }}>¡Ejercicio creado correctamente!</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </form>
    </Box>
  );
} 