import { Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Register from './pages/Register';
import Login from './pages/Login';

// Temporary Placeholder  
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
      </Routes>
    </>
  );
}

export default App;