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

    //So quando todos os campos estiverem preenchidos, o botão de submit permite ser usado
    async function onSubmit(data) {
        setFirebaseError('');
        setSuccess(false);
        setLoading(true);

        try {
            // vai criar o usuário no Firebase Authentication
            const credentials = await createUserWithEmailAndPassword(auth, data.email, data.password);

            // depois de criar o usuário, gavamos os dados adicionais no Firestore
            await setDoc(doc(db, 'users', credentials.user.uid), {
                email: data.email,
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                dateOfBirth: data.dateOfBirth,
                username: data.username.trim(),
                mainPlatform: data.mainPlatform,
                isAdmin: false,
                createdAt: new Date().toISOString(), // opcional: para saber quando o usuário foi criado
            });
            setSuccess(true); // exibe mensagem de sucesso

        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setFirebaseError('This email is already registered. Please use a different email.');
            } else if (error.code === 'auth/invalid-email') {
                setFirebaseError('The email address is not valid. Please enter a valid email.');
            } else if (error.code === 'auth/weak-password') {
                setFirebaseError('The password is too weak. Please enter a stronger password (at least 6 characters).');
            } else {
                setFirebaseError('An unexpected error occurred. Please try again later.');
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
                        required: "First name is required.",
                        minLength: { value: 2, message: "Minimum 2 characters." },
                    })}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                />
                <TextField
                    label="Last Name"
                    fullWidth
                    {...register("lastName", {
                        required: "Last name is required.",
                        minLength: { value: 2, message: "Minimum 2 characters." },
                    })}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                />
                <TextField
                    label="Username"
                    fullWidth
                    {...register("username", {
                        required: "Username is required.",
                        minLength: { value: 2, message: "Minimum 2 characters." },
                    })}
                    error={!!errors.username}
                    helperText={errors.username?.message}
                />

                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    {...register("email", {
                        required: "Email is required.",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Please enter a valid email.",
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
                        required: "Password is required.",
                        minLength: { value: 6, message: "At least 6 characters." },
                        validate: (value) => {
                            const hasLetter = /[a-zA-Z]/.test(value);
                            const hasNumber = /[0-9]/.test(value);
                            const hasSpecial = /[^a-zA-Z0-9]/.test(value);
                            if (!hasLetter || !hasNumber || !hasSpecial) {
                                return "Must include letters, numbers and a special character.";
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
                        required: "Please enter your date of birth.",
                        validate: (value) => {
                            const age = calculateAge(value);
                            if (age < 18 || age > 120) {
                                return "You must be between 18 and 120 years old.";
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
                    rules={{ required: "Please choose your main platform." }}
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
                {success && <Alert severity="success">Account created successfully!</Alert>}

                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Creating account..." : "Register"}
                </Button>
            </Stack>
        </Box>
    );
}

export default Register;
