import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config';
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText, IconButton, Chip } from '@mui/material';
import ThumbUp from '@mui/icons-material/ThumbUp';
import ThumbDown from '@mui/icons-material/ThumbDown';

function PostItem({ post, onReply, onVote, voted }) {
  const [reply, setReply] = useState('');
  const voteVal = voted?.[post.id]; // 1, -1 o undefined
  return (
    <Box sx={{ ml: post.parent ? 3 : 0, mt: 1, mb: 1 }}>
      <Typography variant="subtitle2">{post.author?.name}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{post.content}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <IconButton size="small" onClick={() => { if (voteVal == null) onVote(post.id, 1); }}
          sx={{
            color: voteVal === 1 ? 'green' : 'rgba(0,128,0,0.45)',
            border: '1px solid',
            borderColor: voteVal === 1 ? 'green' : 'rgba(0,128,0,0.45)',
            width: 32,
            height: 32
          }} aria-label="upvote">
          <ThumbUp fontSize="medium" />
        </IconButton>
        <Chip size="small" label={post.score} sx={{ fontWeight: 'bold' }} />
        <IconButton size="small" onClick={() => { if (voteVal == null) onVote(post.id, -1); }}
          sx={{
            color: voteVal === -1 ? 'red' : 'rgba(255,0,0,0.45)',
            border: '1px solid',
            borderColor: voteVal === -1 ? 'red' : 'rgba(255,0,0,0.45)',
            width: 32,
            height: 32
          }} aria-label="downvote">
          <ThumbDown fontSize="medium" />
        </IconButton>
        <TextField size="small" placeholder="Responder..." value={reply} onChange={e => setReply(e.target.value)} />
        <Button size="small" onClick={() => { if (reply.trim()) { onReply(post.id, reply); setReply(''); } }}>Responder</Button>
      </Box>
      {(post.replies || []).map(r => (
        <PostItem key={r.id} post={{ ...r, parent: post.id }} onReply={onReply} onVote={onVote} voted={voted} />
      ))}
    </Box>
  );
}

export default function ProfesorForo() {
  const { profesorId } = useParams();
  const [threads, setThreads] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadDetail, setThreadDetail] = useState(null);
  const [profesor, setProfesor] = useState(null);
  const [voted, setVoted] = useState({}); // postId -> 1 | -1
  const [newComment, setNewComment] = useState('');

  const loadThreads = () => {
    fetch(`${API_URL}/api/professor-forum/teacher/${profesorId}`, { credentials: 'include' })
      .then(r => r.json()).then(setThreads);
  };
  const loadThread = (id) => {
    fetch(`${API_URL}/api/professor-forum/thread/${id}`, { credentials: 'include' })
      .then(r => r.json()).then(setThreadDetail);
  };

  useEffect(() => {
    loadThreads();
    fetch(`${API_URL}/api/profesores/${profesorId}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(setProfesor)
      .catch(() => setProfesor(null));
  }, [profesorId]);

  const createThread = async () => {
    if (!title.trim() || !content.trim()) return;
    await fetch(`${API_URL}/api/professor-forum/teacher/${profesorId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ title, content })
    });
    setTitle(''); setContent('');
    loadThreads();
  };

  const addPost = async (parentId, text) => {
    const body = { content: text };
    if (parentId) body.parentId = parentId;
    await fetch(`${API_URL}/api/professor-forum/thread/${selectedThread}/post`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify(body)
    });
    loadThread(selectedThread);
  };

  const vote = async (postId, value) => {
    await fetch(`${API_URL}/api/professor-forum/post/${postId}/vote?value=${value}`, { method: 'POST', credentials: 'include' });
    setVoted(prev => ({ ...prev, [postId]: value }));
    loadThread(selectedThread);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">Foro del profesor{profesor?.name ? `: ${profesor.name}` : ''}</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Crear nuevo hilo</Typography>
        <TextField label="Título" fullWidth sx={{ mb: 1 }} value={title} onChange={e => setTitle(e.target.value)} />
        <TextField label="Contenido" fullWidth multiline minRows={3} value={content} onChange={e => setContent(e.target.value)} />
        <Button sx={{ mt: 1 }} variant="contained" onClick={createThread}>Publicar</Button>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Hilos</Typography>
        <List>
          {threads.map(t => (
            <ListItem key={t.id} button onClick={() => { setSelectedThread(t.id); loadThread(t.id); }} sx={{ borderRadius: 2, mb: 1, background: '#fff', boxShadow: 1 }}>
              <ListItemText primary={t.title} secondary={t.author?.name} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {threadDetail && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>{threadDetail.title}</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>{threadDetail.content}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField fullWidth size="small" placeholder="Escribe un comentario..." value={newComment} onChange={e => setNewComment(e.target.value)} />
            <Button variant="contained" onClick={() => { if (newComment.trim()) { addPost(undefined, newComment); setNewComment(''); } }}>Comentar</Button>
          </Box>
          <List>
            {(!threadDetail.posts || threadDetail.posts.length === 0) && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>Aún no hay comentarios. ¡Sé el primero en comentar!</Typography>
            )}
            {(threadDetail.posts || []).map(p => (
              <ListItem key={p.id} disableGutters>
                <ListItemText primary={<PostItem post={p} onReply={addPost} onVote={vote} voted={voted} />} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}


