import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
} from '@mui/material';

const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'];

function EditProfile() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');        // shown but never edited
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm();

    function calculateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // Pre-fill the form with the current values from Firestore
    useEffect(() => {
        async function fetchProfile() {
            if (!currentUser) return;
            try {
                const ref = doc(db, 'users', currentUser.uid);
                const snapshot = await getDoc(ref);
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setEmail(data.email || '');
                    reset(data);
                }
            } catch (err) {
                setError("Couldn't load your profile. Try again.");
                console.error(err);
            } finally {
                setLoadingProfile(false);
            }
        }
        fetchProfile();
    }, [currentUser, reset]);

    async function onSave(data) {
        setError('');
        setSaving(true);
        try {
            const ref = doc(db, 'users', currentUser.uid);
            await updateDoc(ref, {
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                username: data.username.trim(),
                dateOfBirth: data.dateOfBirth,
                mainPlatform: data.mainPlatform,
            });
            // Back to the profile page, which shows the success alert
            navigate('/profile', { state: { updated: true } });
        } catch (err) {
            setError("Game over… couldn't save. Try again.");
            console.error(err);
            setSaving(false);
        }
    }

    if (loadingProfile) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Edit Profile
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit(onSave)} noValidate>
                <Stack spacing={2}>
                    <TextField label="Email" value={email} fullWidth disabled />

                    <TextField
                        label="Username"
                        fullWidth
                        {...register("username", {
                            required: "Username is required.",
                            minLength: { value: 2, message: "Too short! Needs at least 2 characters." },
                        })}
                        error={!!errors.username}
                        helperText={errors.username?.message}
                    />

                    <TextField
                        label="First Name"
                        fullWidth
                        {...register("firstName", {
                            required: "First name is required.",
                            minLength: { value: 2, message: "Too short! Needs at least 2 characters." },
                        })}
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                    />

                    <TextField
                        label="Last Name"
                        fullWidth
                        {...register("lastName", {
                            required: "Last name is required.",
                            minLength: { value: 2, message: "Too short! Needs at least 2 characters." },
                        })}
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                    />

                    <TextField
                        label="Date of Birth"
                        type="date"
                        fullWidth
                        slotProps={{ inputLabel: { shrink: true } }}
                        {...register("dateOfBirth", {
                            required: "Enter your date of birth.",
                            validate: (value) => {
                                const age = calculateAge(value);
                                if (age < 13 || age > 120) {
                                    return "You need to be at least 13 years old.";
                                }
                                return true;
                            },
                        })}
                        error={!!errors.dateOfBirth}
                        helperText={errors.dateOfBirth?.message}
                    />

                    <Controller
                        name="mainPlatform"
                        control={control}
                        rules={{ required: "Where do you play? Choose one." }}
                        render={({ field }) => (
                            <FormControl fullWidth error={!!errors.mainPlatform}>
                                <InputLabel id="platform-label">Main Platform</InputLabel>
                                <Select labelId="platform-label" label="Main Platform" {...field}>
                                    {PLATFORMS.map((p) => (
                                        <MenuItem key={p} value={p}>{p}</MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.mainPlatform?.message}</FormHelperText>
                            </FormControl>
                        )}
                    />

                    <Stack direction="row" spacing={2}>
                        <Button type="submit" variant="contained" disabled={saving}>
                            {saving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/profile')}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}

export default EditProfile;