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
        <Route path="/login" element={<Login />} />
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
