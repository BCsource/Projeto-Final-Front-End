import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function AdminRoute({ children }) {
    const { currentUser, loading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Wait until Firebase has finished the initial auth check
        if (loading) return;

        async function checkAdmin() {
            if (!currentUser) {
                setChecking(false);
                return;
            }
            try {
                const ref = doc(db, 'users', currentUser.uid);
                const snapshot = await getDoc(ref);
                setIsAdmin(snapshot.exists() && snapshot.data().isAdmin === true);
            } catch (err) {
                console.error(err);
                setIsAdmin(false);
            } finally {
                setChecking(false);
            }
        }
        checkAdmin();
    }, [currentUser, loading]);

    // Still checking auth or admin status → show a loader
    if (loading || checking) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Not logged in → go to login
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but not an admin → send back to home
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    // Logged in AND admin → show the page
    return children;
}

export default AdminRoute;