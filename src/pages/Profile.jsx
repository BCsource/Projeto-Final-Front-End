import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

import {
    Box,
    Typography,
    Button,
    Stack,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';

function Profile() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [error, setError] = useState('');

    // EditProfile redirects here with this flag after a successful save
    const justUpdated = location.state?.updated === true;

    function formatDate(isoDate) {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    }

    useEffect(() => {
        async function fetchProfile() {
            if (!currentUser) return;
            try {
                const ref = doc(db, 'users', currentUser.uid);
                const snapshot = await getDoc(ref);
                if (snapshot.exists()) {
                    setProfile(snapshot.data());
                }
            } catch (err) {
                setError("Couldn't load your profile. Try again.");
                console.error(err);
            } finally {
                setLoadingProfile(false);
            }
        }
        fetchProfile();
    }, [currentUser]);

    if (loadingProfile) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!profile) {
        return (
            <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
                <Typography>No profile found for this player.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Player Profile
            </Typography>

            {justUpdated && <Alert severity="success" sx={{ mb: 2 }}>GG! Profile updated.</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Stack spacing={2}>
                <Box>
                    <Typography variant="caption" color="text.secondary">Username</Typography>
                    <Typography>{profile.username}</Typography>
                </Box>
                <Divider />
                <Box>
                    <Typography variant="caption" color="text.secondary">First Name</Typography>
                    <Typography>{profile.firstName}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">Last Name</Typography>
                    <Typography>{profile.lastName}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography>{profile.email}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                    <Typography>{formatDate(profile.dateOfBirth)}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">Main Platform</Typography>
                    <Typography>{profile.mainPlatform}</Typography>
                </Box>

                <Button variant="contained" onClick={() => navigate('/profile/edit')}>
                    Edit profile
                </Button>
            </Stack>
        </Box>
    );
}

export default Profile;