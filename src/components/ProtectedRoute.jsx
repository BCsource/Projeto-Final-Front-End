import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
    const { currentUser, loading } = useAuth();

    // Firebase will check if someone is logged in
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Not logged in → send the player to the login page
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Logged in → show the protected page
    return children;
}

export default ProtectedRoute;