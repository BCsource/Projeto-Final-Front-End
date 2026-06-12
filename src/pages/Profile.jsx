import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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
    Divider,
} from '@mui/material';

const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'];

function Profile() {
    const { currentUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm();

    // Stored as "yyyy-mm-dd" in Firestore → shown as "dd/mm/yyyy"
    function formatDate(isoDate) {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    }

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

    // Load the logged-in player's profile from Firestore when the page opens
    useEffect(() => {
        async function fetchProfile() {
            if (!currentUser) return;
            try {
                const ref = doc(db, 'users', currentUser.uid);
                const snapshot = await getDoc(ref);
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setProfile(data);
                    reset(data); // pre-fill the edit form with current values
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

    // Save changes back to Firestore (email is never changed here)
    async function onSave(data) {
        setError('');
        setSuccess(false);
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
            setProfile((prev) => ({ ...prev, ...data }));
            setSuccess(true);
            setEditing(false);
        } catch (err) {
            setError("Game over… couldn't save. Try again.");
            console.error(err);
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        reset(profile); // restore the original values
        setEditing(false);
        setError('');
    }

    // Loading the profile from Firestore
    if (loadingProfile) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    // No Firestore document found for this user
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

            {success && <Alert severity="success" sx={{ mb: 2 }}>GG! Profile updated.</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!editing ? (


                // ---------- VIEW MODE ----------
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

                    <Button
                        variant="contained"
                        onClick={() => {
                            setSuccess(false);
                            setEditing(true);
                        }}
                    >
                        Edit
                    </Button>
                </Stack>
            ) : (


                // ---------- EDIT MODE ----------
                <Box component="form" onSubmit={handleSubmit(onSave)} noValidate>
                    <Stack spacing={2}>
                        {/* Email is shown but cannot be edited */}
                        <TextField
                            label="Email"
                            value={profile.email}
                            fullWidth
                            disabled
                        />

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
                                    <Select
                                        labelId="platform-label"
                                        label="Main Platform"
                                        {...field}
                                    >
                                        {PLATFORMS.map((p) => (
                                            <MenuItem key={p} value={p}>
                                                {p}
                                            </MenuItem>
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
                            <Button variant="outlined" onClick={handleCancel} disabled={saving}>
                                Cancel
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}

export default Profile;