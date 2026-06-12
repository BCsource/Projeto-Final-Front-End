import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { compressImage, MAX_IMAGE_DATA_URL_LENGTH } from '../utils/imageCompression';

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
    CircularProgress,
    IconButton,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ImageIcon from '@mui/icons-material/Image';

const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'];
const REGIONS = ['North America', 'South America', 'Europe', 'Africa', 'Asia', 'Australia'];

function EditThread() {
    const { threadId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        reset,
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

    const [loadingThread, setLoadingThread] = useState(true);
    const [notAuthor, setNotAuthor] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [firebaseError, setFirebaseError] = useState('');
    const [success, setSuccess] = useState(false);
    const [saving, setSaving] = useState(false);


    const [imagePreview, setImagePreview] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageError, setImageError] = useState('');


    useEffect(() => {
        if (!currentUser) return;

        async function fetchThread() {
            try {
                const ref = doc(db, 'threads', threadId);
                const snapshot = await getDoc(ref);

                if (!snapshot.exists()) {
                    setLoadError('This thread no longer exists.');
                    return;
                }

                const data = snapshot.data();

                if (data.authorId !== currentUser.uid) {
                    setNotAuthor(true);
                    return;
                }

                reset({
                    gameName: data.gameName ?? '',
                    description: data.description ?? '',
                    platform: data.platform ?? '',
                    maxPlayers: data.maxPlayers ?? '',
                    category: data.category ?? '',
                    releaseYear: data.releaseYear ?? '',
                    difficulty: data.difficulty ?? '',
                    region: data.region ?? '',
                });

                setImagePreview(data.imageUrl ?? '');
            } catch (err) {
                setLoadError("Couldn't load this thread. Try again.");
                console.error(err);
            } finally {
                setLoadingThread(false);
            }
        }
        fetchThread();
    }, [threadId, currentUser, reset]);

    // comprime a imagem escolhida para base64, igual ao NewThread/MyThreads
    async function handleImageChange(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setImageError('Please choose an image file.');
            return;
        }

        setUploadingImage(true);
        setImageError('');

        try {
            const dataUrl = await compressImage(file);

            if (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
                setImageError('That image is too large even after compression. Try a smaller picture.');
                return;
            }

            setImagePreview(dataUrl);
        } catch (err) {
            setImageError("Couldn't process that image. Try again.");
            console.error(err);
        } finally {
            setUploadingImage(false);
        }
    }

    async function onSubmit(data) {
        setFirebaseError('');
        setSuccess(false);
        setSaving(true);

        try {
            await updateDoc(doc(db, 'threads', threadId), {
                gameName: data.gameName.trim(),
                description: data.description.trim(),
                platform: data.platform,
                maxPlayers: data.maxPlayers,
                category: data.category.trim(),
                releaseYear: data.releaseYear,
                difficulty: data.difficulty,
                region: data.region,
                imageUrl: imagePreview,
            });

            setSuccess(true);
            setTimeout(() => navigate('/'), 1000);
        } catch (error) {
            setFirebaseError('Game over… try again in a moment.');
            console.error('Error updating thread:', error);
        } finally {
            setSaving(false);
        }
    }

    if (loadingThread) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (notAuthor) {
        return (
            <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
                <Alert severity="error">You can only edit your own threads.</Alert>
            </Box>
        );
    }

    if (loadError) {
        return (
            <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
                <Alert severity="error">{loadError}</Alert>
            </Box>
        );
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ maxWidth: 400, mx: "auto", mt: 4 }}
            noValidate
        >
            <Typography variant="h4" gutterBottom>
                Edit Thread
            </Typography>

            <Stack spacing={2}>

                <Box
                    sx={{
                        position: 'relative',
                        height: 180,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {!imagePreview && (
                        <ImageIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                    )}

                    {uploadingImage && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(0, 0, 0, 0.4)',
                                borderRadius: 1,
                            }}
                        >
                            <CircularProgress sx={{ color: 'common.white' }} />
                        </Box>
                    )}

                    <IconButton
                        component="label"
                        size="small"
                        aria-label="upload banner image"
                        disabled={saving}
                        sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.paper' },
                        }}
                    >
                        <PhotoCameraIcon fontSize="small" />
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => handleImageChange(e.target.files[0])}
                        />
                    </IconButton>
                </Box>

                {imageError && <Alert severity="error">{imageError}</Alert>}

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
                    minRows={3}
                    {...register("description", {
                        required: "Tell other players what this thread is about.",
                        minLength: { value: 10, message: "Too short! Needs at least 10 characters." },
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
                {success && <Alert severity="success">GG! Thread updated.</Alert>}

                <Button type="submit" variant="contained" disabled={saving}>
                    {saving ? "Updating..." : "Update Thread"}
                </Button>
            </Stack>
        </Box>
    );
}

export default EditThread;