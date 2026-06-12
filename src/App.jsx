import { Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

// Temporary Placeholder for the home page, which will be built later
function Home() {
  return <h1>GG Mates — Home (placeholder)</h1>;
}

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={
          // to protect the profile page, we wrap it in <ProtectedRoute>
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
        />
      </Routes>
    </>
  );
}

export default App;