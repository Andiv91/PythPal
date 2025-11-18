import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, MenuItem, Alert, CircularProgress, FormControlLabel, Checkbox } from '@mui/material';
import { API_URL } from '../config';

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
  const [language, setLanguage] = useState('python');
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvMsg, setCsvMsg] = useState('');
  const [useTestcases, setUseTestcases] = useState(false);
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
          setHint(exercise.hint || '');
          setLanguage(exercise.language || 'python');
          setUseTestcases(!!exercise.useTestcases);
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
          body: JSON.stringify({ title, description, difficulty, expectedOutput, language, hint, useTestcases })
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

  const handleUploadCsv = async () => {
    if (!csvFile) return;
    setCsvMsg('');
    const fd = new FormData();
    fd.append('file', csvFile);
    const res = await fetch(`${API_URL}/api/activities/${id}/testcases/upload-csv`, {
      method: 'POST',
      credentials: 'include',
      body: fd
    });
    const text = await res.text();
    setCsvMsg(text || (res.ok ? 'CSV cargado' : 'Error al cargar CSV'));
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
          label="Pista (opcional)"
          value={hint}
          onChange={e => setHint(e.target.value)}
          fullWidth
          required={false}
          sx={{ mb: 2 }}
          multiline
          minRows={2}
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
          label={`Output esperado${useTestcases ? ' (opcional con CSV)' : ''}`}
          value={expectedOutput}
          onChange={e => setExpectedOutput(e.target.value)}
          fullWidth
          required={!useTestcases}
          sx={{ mb: 2 }}
        />
        <Box sx={{ mb: 2 }}>
          <FormControlLabel control={<Checkbox checked={useTestcases} onChange={e => setUseTestcases(e.target.checked)} />} label="Evaluar con casos CSV" />
        </Box>
        {useTestcases && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Casos de prueba (CSV, opcional)</Typography>
          <input type="file" accept=".csv,text/csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
          <Button sx={{ ml: 2 }} variant="outlined" onClick={handleUploadCsv} disabled={!csvFile}>Subir CSV</Button>
          {csvMsg && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{csvMsg}</Typography>}
          <Typography variant="caption" display="block" color="text.secondary">Formato: a,b,expected (máx. 100 filas).</Typography>
        </Box>
        )}
        <TextField
          select
          label="Lenguaje"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        >
          <MenuItem value="python">Python</MenuItem>
          <MenuItem value="java">Java</MenuItem>
          <MenuItem value="cpp">C++</MenuItem>
        </TextField>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>¡Guardado!</Alert>}
        <Button type="submit" variant="contained" color="primary" disabled={saving}>
          Guardar cambios
        </Button>
      </form>
    </Box>
  );
} 