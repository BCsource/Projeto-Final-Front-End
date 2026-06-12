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
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import HomePage from './pages/HomePage'
import NewThread from './pages/NewThread'
import EditThread from './pages/EditThread'
import MyThreads from './pages/MyThreads'
import Favs from './pages/Favs'
import Profile from './pages/Profile'
import AllUsersAdminOnly from './pages/AllUsersAdminOnly'
import ViewThread from './pages/ViewThread'
import EditProfile from './pages/EditProfile'

function App() {
  return (
    <BrowserRouter>
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
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<HomePage />} />
        <Route path="/threads/new" element={<NewThread />} />
        <Route path="/threads/:threadId" element={<ViewThread />} />
        <Route path="/threads/:threadId/edit" element={<EditThread />} />


        <Route path="/my-threads" element={<MyThreads />} />
        <Route path="/favorites" element={<Favs />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />


        <Route path="/admin/users" element={<AllUsersAdminOnly />} />


        <Route path="*" element={<Navigate to="/" replace />} /> {/* redireciona para home se a rota não for encontrada */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
