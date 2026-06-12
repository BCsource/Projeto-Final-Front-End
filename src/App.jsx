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
        {/* Pages publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Pages réservées aux connectés */}
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
        <Route path="/threads/new" element={<NewThread />} />
        <Route path="/threads/:threadId" element={<ViewThread />} />
        <Route path="/threads/:threadId/edit" element={<EditThread />} />
        <Route path="/my-threads" element={<MyThreads />} />
        <Route path="/favorites" element={<Favs />} />

        {/* Page réservée aux admins */}
        <Route
          path="/users"
          element={
            <AdminRoute>
              <AllUsersAdminOnly />
            </AdminRoute>
          }
        />

        {/* Toute autre URL → retour à l'accueil */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;