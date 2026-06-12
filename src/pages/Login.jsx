import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Stack,
} from '@mui/material';

function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const [firebaseError, setFirebaseError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Only runs when ALL fields pass React Hook Form validation
    async function onSubmit(data) {
        setFirebaseError('');
        setSuccess(false);
        setLoading(true);

        try {
            // Sign the player in with Firebase Authentication
            await signInWithEmailAndPassword(auth, data.email, data.password);

            setSuccess(true);
            // When routing is ready, replace with: navigate("/")
        } catch (error) {
            if (
                error.code === 'auth/invalid-credential' ||
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/user-not-found'
            ) {
                setFirebaseError('Wrong email or password. Try again.');
            } else if (error.code === 'auth/invalid-email') {
                setFirebaseError('Invalid email address. Try again.');
            } else if (error.code === 'auth/too-many-requests') {
                setFirebaseError('Too many attempts. Take a break and try again later.');
            } else {
                setFirebaseError('Game over… try again in a moment.');
            }
            console.error('Error signing in:', error);
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
                Log in
            </Typography>

            <Stack spacing={2}>
                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    {...register("email", {
                        required: "We need your email to log you in.",
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
                        required: "Enter your password to continue.",
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                />

                {firebaseError && <Alert severity="error">{firebaseError}</Alert>}
                {success && <Alert severity="success">GG! Welcome back!</Alert>}

                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Entering the arena..." : "Log in"}
                </Button>
            </Stack>
        </Box>
    );
}

export default Login;