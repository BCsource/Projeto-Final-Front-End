import { Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AllUsersAdminOnly from './pages/AllUsersAdminOnly';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Placeholder temporaire en attendant la vraie Home de ta collègue
function Home() {
  return <h1>GG Mates — Home (placeholder)</h1>;
}

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Member pages */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin-only page */}
        <Route
          path="/users"
          element={
            <AdminRoute>
              <AllUsersAdminOnly />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;