import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { API_URL } from './config';
import PythonExecutor from './components/PythonExecutor';
import AvancesPage from './pages/AvancesPage';
import ProfesoresList from './pages/ProfesoresList';
import ProfesorEjercicios from './pages/ProfesorEjercicios';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import TeacherHomePage from './pages/TeacherHomePage';
import CreateExercise from './pages/CreateExercise';
import ViewStudents from './pages/ViewStudents';
import StudentExercises from './pages/StudentExercises';
import ExerciseAttempt from './pages/ExerciseAttempt';
import FavoritesPage from './pages/FavoritesPage';
import TeacherExercisesPage from './pages/TeacherExercisesPage';
import EditExercise from './pages/EditExercise';
import HelpPage from './pages/HelpPage';
import ContactPage from './pages/ContactPage';
import SettingsPage from './pages/SettingsPage';
import MensajesProfesor from './pages/MensajesProfesor';
import MensajesEstudiante from './pages/MensajesEstudiante';
import ChatConversacion from './pages/ChatConversacion';
import ProfesorForo from './pages/ProfesorForo';
import TeacherRanking from './pages/TeacherRanking';
import { ThemeProvider } from './theme/ThemeContext';
import AdminListPage from './pages/AdminListPage';
import AdminSettings from './pages/AdminSettings';

// Componente de ejercicio de ejemplo (lo mantenemos como una ruta separada)
function PythonExercise() {
  const expectedOutput = "Hello, World!";
  return (
    <>
      <h2>Ejercicio #1</h2>
      <p>
        Bienvenido a Python!<br />
        Comenzaremos con algo sencillo, el comando de imprimir, la función print() en Python muestra la salida en la consola u otros dispositivos de salida estándar...
        <br /><br />
        Es tu turno, escribe una línea de código que regrese un "Hello, World!"
      </p>
      <PythonExecutor expectedOutput={expectedOutput} />
    </>
  );
}

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    fetch(`${API_URL}/api/user/me`, {
      credentials: 'include'
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('No autenticado');
      })
      .then(user => {
        console.log('Usuario autenticado:', user);
        setIsAuthenticated(true);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error de autenticación:', error);
        setIsAuthenticated(false);
        setLoading(false);
      });
  }, []);

  // Mientras se carga, mostrar algo simple
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostrar los children
  return children;
}

function App() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`${API_URL}/api/user/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { setCurrentUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Rutas protegidas */}
          {currentUser?.role === 'TEACHER' ? (
            <>
              <Route path="/" element={<ProtectedRoute><Layout><TeacherHomePage /></Layout></ProtectedRoute>} />
              <Route path="/ver-ejercicios" element={<ProtectedRoute><Layout><TeacherExercisesPage /></Layout></ProtectedRoute>} />
              <Route path="/editar-ejercicio/:id" element={<ProtectedRoute><Layout><EditExercise /></Layout></ProtectedRoute>} />
              <Route path="/crear-ejercicio" element={<ProtectedRoute><Layout><CreateExercise /></Layout></ProtectedRoute>} />
              <Route path="/ver-estudiantes" element={<ProtectedRoute><Layout><ViewStudents /></Layout></ProtectedRoute>} />
              <Route path="/ranking" element={<ProtectedRoute><Layout><TeacherRanking /></Layout></ProtectedRoute>} />
              <Route path="/mensajes" element={<ProtectedRoute><Layout><div>Mensajes (próximamente)</div></Layout></ProtectedRoute>} />
              <Route path="/mensajes-profesor" element={<ProtectedRoute><Layout><MensajesProfesor /></Layout></ProtectedRoute>} />
              <Route path="/ajustes" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
              <Route path="/ayuda" element={<HelpPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/chat" element={<ProtectedRoute><Layout><ChatConversacion /></Layout></ProtectedRoute>} />
            </>
          ) : currentUser?.role === 'ADMIN' ? (
            <>
              <Route path="/" element={<ProtectedRoute><Layout><AdminListPage role="STUDENT" /></Layout></ProtectedRoute>} />
              <Route path="/admin/estudiantes" element={<ProtectedRoute><Layout><AdminListPage role="STUDENT" /></Layout></ProtectedRoute>} />
              <Route path="/admin/profesores" element={<ProtectedRoute><Layout><AdminListPage role="TEACHER" /></Layout></ProtectedRoute>} />
              <Route path="/admin/ajustes" element={<ProtectedRoute><Layout><AdminSettings /></Layout></ProtectedRoute>} />
            </>
          ) : currentUser?.role === 'STUDENT' ? (
            <>
              <Route path="/" element={<ProtectedRoute><Layout><HomePage /></Layout></ProtectedRoute>} />
              <Route path="/profesores" element={<ProtectedRoute><Layout><ProfesoresList /></Layout></ProtectedRoute>} />
              <Route path="/profesores/:profesorId" element={<ProtectedRoute><Layout><ProfesorEjercicios /></Layout></ProtectedRoute>} />
              <Route path="/profesores/:profesorId/ejercicio/:activityId" element={<ProtectedRoute><Layout><ExerciseAttempt /></Layout></ProtectedRoute>} />
              <Route path="/profesores/:profesorId/foro" element={<ProtectedRoute><Layout><ProfesorForo /></Layout></ProtectedRoute>} />
              <Route path="/favoritos" element={<ProtectedRoute><Layout><FavoritesPage /></Layout></ProtectedRoute>} />
              <Route path="/avances" element={<ProtectedRoute><Layout><AvancesPage /></Layout></ProtectedRoute>} />
              <Route path="/mensajes" element={<ProtectedRoute><Layout><MensajesEstudiante /></Layout></ProtectedRoute>} />
              <Route path="/mensajes-estudiante" element={<ProtectedRoute><Layout><MensajesEstudiante /></Layout></ProtectedRoute>} />
              <Route path="/ajustes" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
              <Route path="/ayuda" element={<HelpPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/chat" element={<ProtectedRoute><Layout><ChatConversacion /></Layout></ProtectedRoute>} />
            </>
          ) : null}
          <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;