import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem, Button, TextField, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Divider } from '@mui/material';

export default function AdminListPage({ role }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users?role=${role}`, { credentials: 'include' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [role]);

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState(role || 'STUDENT');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [detailStats, setDetailStats] = useState(null);

  const onCreate = async () => {
    if (!newEmail || !newName) return;
    await fetch(`${API_URL}/api/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: newEmail, name: newName, role: newRole })
    });
    setNewEmail('');
    setNewName('');
    setNewRole(role || 'STUDENT');
    await load();
  };

  const fetchStats = async (id) => {
    const res = await fetch(`${API_URL}/api/admin/users/${id}/stats`, { credentials: 'include' });
    if (!res.ok) throw new Error('No autorizado');
    return await res.json();
  };

  const onChangeRole = async (id, newRole) => {
    await fetch(`${API_URL}/api/admin/users/${id}/role?role=${newRole}`, { method: 'PUT', credentials: 'include' });
    await load();
  };

  const onDelete = async (id) => {
    if (!window.confirm('¿Eliminar usuario y sus datos relacionados?')) return;
    await fetch(`${API_URL}/api/admin/users/${id}?cascade=true`, { method: 'DELETE', credentials: 'include' });
    await load();
  };

  const onView = async (u) => {
    try {
      const s = await fetchStats(u.id);
      setDetailStats(s);
    } catch (e) {
      setDetailStats(null);
    }
    setDetailUser(u);
    setDetailOpen(true);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Usuarios ({role})</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Crear usuario</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField size="small" label="Nombre" value={newName} onChange={e => setNewName(e.target.value)} />
          <TextField size="small" label="Correo" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
          <Select size="small" value={newRole} onChange={e => setNewRole(e.target.value)}>
            <MenuItem value="STUDENT">STUDENT</MenuItem>
            <MenuItem value="TEACHER">TEACHER</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
          </Select>
          <Button variant="contained" onClick={onCreate}>Crear</Button>
        </Stack>
      </Paper>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estadísticas</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell>{u.name || '-'}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Select size="small" value={u.role} onChange={(e) => onChangeRole(u.id, e.target.value)}>
                    <MenuItem value="STUDENT">STUDENT</MenuItem>
                    <MenuItem value="TEACHER">TEACHER</MenuItem>
                    <MenuItem value="ADMIN">ADMIN</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => onView(u)}>Ver</Button>
                </TableCell>
                <TableCell align="right">
                  <Button color="error" variant="contained" size="small" onClick={() => onDelete(u.id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && users.length === 0 && (
              <TableRow><TableCell colSpan={5}>Sin usuarios.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle de usuario</DialogTitle>
        <DialogContent dividers>
          {detailUser ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>{detailUser.name || 'Sin nombre'}</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>{detailUser.email}</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip label={detailUser.role} color={detailUser.role === 'ADMIN' ? 'warning' : detailUser.role === 'TEACHER' ? 'primary' : 'default'} />
                {typeof detailUser.xp === 'number' && <Chip label={`XP: ${detailUser.xp}`} />}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Estadísticas</Typography>
              {detailStats ? (
                <Box>
                  {detailUser.role === 'STUDENT' ? (
                    <Typography>- Ejercicios resueltos: <b>{detailStats.solvedCount ?? 0}</b></Typography>
                  ) : detailUser.role === 'TEACHER' ? (
                    <Typography>- Ejercicios publicados: <b>{detailStats.publishedCount ?? 0}</b></Typography>
                  ) : (
                    <Typography color="text.secondary">Sin métricas específicas para ADMIN</Typography>
                  )}
                </Box>
              ) : (
                <Typography color="text.secondary">No se pudieron cargar las estadísticas.</Typography>
              )}
            </Box>
          ) : (
            <Typography color="text.secondary">Cargando…</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

