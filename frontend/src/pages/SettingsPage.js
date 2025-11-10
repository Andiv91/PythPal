import React, { useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';
import { Box, Typography, Switch, FormControlLabel, TextField, Button, Paper, Alert } from '@mui/material';
import { ThemeContext } from '../theme/ThemeContext';

export default function SettingsPage() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/user/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(user => {
        setName(user.name);
        setOriginalName(user.name);
      });
  }, []);

  const handleThemeChange = (e) => {
    setDarkMode(e.target.checked);
  };

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    try {
      const res = await fetch(`${API_URL}/api/user/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar el nombre');
      setSuccess(true);
      setOriginalName(name);
    } catch (err) {
      setError('Error al actualizar el nombre');
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>Ajustes</Typography>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={handleThemeChange} color="primary" />}
          label={darkMode ? 'Modo oscuro' : 'Modo claro'}
          sx={{ mb: 3 }}
        />
        <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
          Cambiar nombre de usuario
        </Typography>
        <TextField
          label="Nombre"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          sx={{ my: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={name === originalName}
        >
          Guardar cambios
        </Button>
        {success && <Alert severity="success" sx={{ mt: 2 }}>¡Nombre actualizado!</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
    </Box>
  );
} 