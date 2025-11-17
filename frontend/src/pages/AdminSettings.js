import React, { useMemo, useState } from 'react';
import { Box, Typography, Paper, Button, Stack, Select, MenuItem, Divider, Snackbar, Alert } from '@mui/material';
import { API_URL } from '../config';

export default function AdminSettings() {
  const [roleExport, setRoleExport] = useState('ALL');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const downloadCSV = (filename, rows) => {
    const csv = rows.map(r => r.map(x => `"${String(x ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onExport = async () => {
    try {
      const roles = roleExport === 'ALL' ? ['STUDENT','TEACHER','ADMIN'] : [roleExport];
      const all = [];
      for (const r of roles) {
        const res = await fetch(`${API_URL}/api/admin/users?role=${r}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          (Array.isArray(data) ? data : []).forEach(u => all.push(u));
        }
      }
      const header = ['id','name','email','role','xp'];
      const rows = [header, ...all.map(u => [u.id, u.name, u.email, u.role, u.xp])];
      downloadCSV(`usuarios_${roleExport.toLowerCase()}.csv`, rows);
      setSnackbar({ open: true, message: 'Exportación completada', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al exportar', severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Ajustes de administrador</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Exportar usuarios (CSV)</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Descarga un CSV con los usuarios por rol.</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Select size="small" value={roleExport} onChange={e => setRoleExport(e.target.value)}>
            <MenuItem value="ALL">Todos</MenuItem>
            <MenuItem value="STUDENT">Estudiantes</MenuItem>
            <MenuItem value="TEACHER">Profesores</MenuItem>
            <MenuItem value="ADMIN">Admins</MenuItem>
          </Select>
          <Button variant="contained" onClick={onExport}>Exportar CSV</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Consejos de seguridad</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography color="text.secondary">
          - Mantén actualizado el Redirect URI de Google OAuth.<br/>
          - Evita compartir el Client Secret.<br/>
          - Considera usar un dominio propio para sesiones más estables.
        </Typography>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

