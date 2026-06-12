import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import AllUsersAdminOnly from './pages/AllUsersAdminOnly';
import NewThread from './pages/NewThread';
import ViewThread from './pages/ViewThread';
import EditThread from './pages/EditThread';
import MyThreads from './pages/MyThreads';
import Favs from './pages/Favs';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        {/* Páginas publicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Páginas restritas a utilizadores autenticados */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/threads/new"
          element={
            <ProtectedRoute>
              <NewThread />
            </ProtectedRoute>
          }
        />
        <Route
          path="/threads/:threadId"
          element={
            <ProtectedRoute>
              <ViewThread />
            </ProtectedRoute>
          }
        />
        <Route
          path="/threads/:threadId/edit"
          element={
            <ProtectedRoute>
              <EditThread />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-threads"
          element={
            <ProtectedRoute>
              <MyThreads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favs />
            </ProtectedRoute>
          }
        />

        {/* paginas Admin-only */}
        <Route
          path="/users"
          element={
            <AdminRoute>
              <AllUsersAdminOnly />
            </AdminRoute>
          }
        />

        {/* url nao existentes/sem path - vai para o login/register */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;