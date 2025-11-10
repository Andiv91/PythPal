import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import Layout from '../components/Layout';

export default function ContactPage() {
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Paper elevation={0} sx={{ p: 4, bgcolor: '#f7f8fa', borderRadius: 2 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Medios de contacto
            </Typography>
            <Typography paragraph sx={{ mt: 2 }}>
              Si necesitas ayuda con tus ejercicios no dudes en escribir a tus profesores, pero si necesitas ayuda con logística o problemas técnicos, escríbenos por estos medios:
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>
              Correo electrónico:
            </Typography>
            <Typography paragraph sx={{ mb: 2 }}>
              ayudapythpal@gmail.com
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>
              Número telefónico:
            </Typography>
            <Typography paragraph>
              +57 3124228724
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
} 