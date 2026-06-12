import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

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



const REGIONS = ['North America', 'South America', 'Europe', 'Africa', 'Asia', 'Australia'];

function NewThread() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        defaultValues: {
            gameName: '',
            description: '',
            platform: '',
            maxPlayers: '',
            category: '',
            releaseYear: '',
            difficulty: '',
            region: '',
        },
    });

    const [firebaseError, setFirebaseError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(data) {
        setFirebaseError('');
        setSuccess(false);
        setLoading(true);



        if (!currentUser) {
            setFirebaseError('You need to be logged in to post a thread.');
            setLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, 'threads'), {
                gameName: data.gameName.trim(),
                description: data.description.trim(),
                platform: data.platform,
                maxPlayers: data.maxPlayers,
                category: data.category.trim(),
                releaseYear: data.releaseYear,
                difficulty: data.difficulty,
                region: data.region,
                authorId: currentUser.uid,
                createdAt: new Date().toISOString(),
            });

            setSuccess(true);
            setTimeout(() => navigate('/'), 1000);

        } catch (error) {
            setFirebaseError('Game over… try again in a moment.');
            console.error('Error creating thread:', error);
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
                New Thread
            </Typography>

            <Stack spacing={2}>
                <TextField
                    label="Game Name"
                    fullWidth
                    {...register("gameName", {
                        required: "What are we playing? Add the game name.",
                        minLength: { value: 2, message: "Too short! Needs at least 2 characters." },
                        maxLength: { value: 50, message: "Keep it under 50 characters." },
                    })}
                    error={!!errors.gameName}
                    helperText={errors.gameName?.message}
                />


                <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    {...register("description", {
                        required: "Tell other players what this thread is about.",
                        minLength: { value: 10, message: "Too short! Needs at least 10 characters." },
                        maxLength: { value: 1500, message: "Keep it under 1000 characters." },
                    })}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                />

                <Controller
                    name="platform"
                    control={control}
                    rules={{ required: "Pick your platform." }}
                    render={({ field }) => (
                        <FormControl fullWidth error={!!errors.platform}>
                            <InputLabel id="platform-label">Platform</InputLabel>
                            <Select
                                labelId="platform-label"
                                label="Platform"
                                {...field}
                            >
                                {PLATFORMS.map((p) => (
                                    <MenuItem key={p} value={p}>
                                        {p}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>{errors.platform?.message}</FormHelperText>
                        </FormControl>
                    )}
                />

                {/*talvez fique mais controlável fazer aqui um select box de 1 a 10 do que usar type number, que achas?*/}

                <TextField
                    label="Max Players"
                    type="number"
                    fullWidth
                    {...register("maxPlayers", {
                        required: "How many players can play together?",
                        valueAsNumber: true,
                        validate: (value) => !isNaN(value) || "Enter a number.",
                        min: { value: 1, message: "At least 1 player." },
                        max: { value: 10, message: "Max 10 players." },
                    })}
                    error={!!errors.maxPlayers}
                    helperText={errors.maxPlayers?.message}
                />

                {/* Será que mais vale fazer um campo de "tags" em vez de texto livre? Porque um jogo pode ser, por exemplo, "RPG" e "Multiplayer", ou "Ação" e "Indie". */}
                <TextField
                    label="Category"
                    fullWidth
                    {...register("category", {
                        required: "What category does the game belong to?",
                        minLength: { value: 2, message: "Too short! Needs at least 2 characters." },
                        maxLength: { value: 50, message: "Keep it under 50 characters." },
                    })}
                    error={!!errors.category}
                    helperText={errors.category?.message}
                />

                <TextField
                    label="Release Year"
                    type="number"
                    fullWidth
                    {...register("releaseYear", {
                        required: "When was the game released?",
                        valueAsNumber: true,
                        validate: (value) => !isNaN(value) || "Enter a number.",
                        min: { value: 1989, message: "Invalid release year." },
                    })}
                    error={!!errors.releaseYear}
                    helperText={errors.releaseYear?.message}
                />

                {/*talvez fique mais controlável fazer aqui um select box de 1 a 5 estrelas do que usar type number, que achas?*/}

                <TextField
                    label="Difficulty Level (1-5)"
                    type="number"
                    fullWidth
                    {...register("difficulty", {
                        required: "How difficult would you rate the game?",
                        valueAsNumber: true,
                        validate: (value) => !isNaN(value) || "Enter a number.",
                        min: { value: 1, message: "At least 1 star." },
                        max: { value: 5, message: "Max 5 stars." },
                    })}
                    error={!!errors.difficulty}
                    helperText={errors.difficulty?.message}
                />

                <Controller
                    name="region"
                    control={control}
                    rules={{ required: "Pick your region." }}
                    render={({ field }) => (
                        <FormControl fullWidth error={!!errors.region}>
                            <InputLabel id="region-label">Region</InputLabel>
                            <Select
                                labelId="region-label"
                                label="Region"
                                {...field}
                            >
                                {REGIONS.map((r) => (
                                    <MenuItem key={r} value={r}>
                                        {r}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>{errors.region?.message}</FormHelperText>
                        </FormControl>
                    )}
                />

                {firebaseError && <Alert severity="error">{firebaseError}</Alert>}
                {success && <Alert severity="success">GG! Your thread is live.</Alert>}

                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Posting..." : "Post Thread"}
                </Button>
            </Stack>
        </Box>
    );
}

export default NewThread;