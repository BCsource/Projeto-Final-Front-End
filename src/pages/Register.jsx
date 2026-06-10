import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Stack,
    FormHelperText,
} from '@mui/material';

const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'];

function Register() {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            password: '',
            dateOfBirth: '',
            mainPlatform: '',
        },
    });

    const [firebaseError, setFirebaseError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

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

    // Only runs when ALL fields pass React Hook Form validation
    async function onSubmit(data) {
        setFirebaseError('');
        setSuccess(false);
        setLoading(true);

        try {
            // Create the user in Firebase Authentication
            const credentials = await createUserWithEmailAndPassword(auth, data.email, data.password);

            // Save the rest of the profile in Firestore
            await setDoc(doc(db, 'users', credentials.user.uid), {
                email: data.email,
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                dateOfBirth: data.dateOfBirth,
                username: data.username.trim(),
                mainPlatform: data.mainPlatform,
                isAdmin: false,
                createdAt: new Date().toISOString(),
            });
            setSuccess(true);

        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setFirebaseError('Player already registered. Head to login.');
            } else if (error.code === 'auth/invalid-email') {
                setFirebaseError('Invalid email address. Try again.');
            } else if (error.code === 'auth/weak-password') {
                setFirebaseError('Not strong enough. Power up your password — at least 6 characters with letters, numbers and a special character.');
            } else {
                setFirebaseError('Game over… try again in a moment.');
            }
            console.error('Error creating user:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ maxWidth: 400, mx: "auto", mt: 4 }}
            noValidate
        >
            <Typography variant="h4" gutterBottom>
                Register
            </Typography>

            <Stack spacing={2}>
                <TextField
                    label="First Name"
                    fullWidth
                    {...register("firstName", {
                        required: "Enter your first name to join.",
                        minLength: { value: 2, message: "Too short! Needs at least 2 characters." },
                    })}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                />
                <TextField
                    label="Last Name"
                    fullWidth
                    {...register("lastName", {
                        required: "Enter your last name to join.",
                        minLength: { value: 2, message: "Too short! Needs at least 2 characters." },
                    })}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                />
                <TextField
                    label="Username"
                    fullWidth
                    {...register("username", {
                        required: "Every player needs a username. Choose yours.",
                        minLength: { value: 2, message: "Too short! Needs at least 2 characters." },
                    })}
                    error={!!errors.username}
                    helperText={errors.username?.message}
                />

                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    {...register("email", {
                        required: "We need an email to create your account.",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Hmm, that doesn't look like an email. Try again.",
                        },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                />

                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    {...register("password", {
                        required: "Set a password to protect your account.",
                        minLength: { value: 6, message: "Needs at least 6 characters." },
                        validate: (value) => {
                            const hasLetter = /[a-zA-Z]/.test(value);
                            const hasNumber = /[0-9]/.test(value);
                            const hasSpecial = /[^a-zA-Z0-9]/.test(value);
                            if (!hasLetter || !hasNumber || !hasSpecial) {
                                return "Power up: mix letters, numbers and a special character.";
                            }
                            return true;
                        },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
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
                            if (age < 18 || age > 120) {
                                return "You need to be at least 18 years old.";
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

                {firebaseError && <Alert severity="error">{firebaseError}</Alert>}
                {success && <Alert severity="success">GG! Your player profile is ready. Welcome to GG Mates!</Alert>}

                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Spawning player..." : "Register"}
                </Button>
            </Stack>
        </Box>
    );
}

export default Register;