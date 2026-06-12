import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardActions,
    Chip,
    IconButton,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ImageIcon from '@mui/icons-material/Image';

// igual ao formatDate do profile

function formatDate(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-GB');
}

// Faz o Resize e compressão da imagem, devolvendo um URL de data base64. Assim as banners ficam dentro do limite do firestore.

function compressImage(file, maxDimension = 600, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Could not read file.'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('Could not load image.'));
            img.onload = () => {
                let { width, height } = img;

                if (width > height && width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');

                //so para os pngs ficarem com fundo branco e nao preto

                ctx.fillStyle = '#f0f0f0';  //let the FOFOFOFO saga begiiiiin
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function MyThreads() {
    const { currentUser } = useAuth();

    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [threadToDelete, setThreadToDelete] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);

    // só mostra as threads do usuário logado, e não de todo o mundo

    useEffect(() => {
        if (!currentUser) return;

        async function fetchThreads() {
            try {
                const q = query(
                    collection(db, 'threads'),
                    where('authorId', '==', currentUser.uid)
                );
                const snapshot = await getDocs(q);
                const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                setThreads(list);
            } catch (err) {
                setError("Couldn't load your threads. Try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchThreads();
    }, [currentUser]);

    function handleDeleteClick(thread) {
        setThreadToDelete(thread);
    }

    function handleDeleteCancel() {
        setThreadToDelete(null);
    }

    async function handleDeleteConfirm() {
        if (!threadToDelete) return;

        try {
            await deleteDoc(doc(db, 'threads', threadToDelete.id));
            setThreads((prev) => prev.filter((t) => t.id !== threadToDelete.id));
        } catch (err) {
            setError("Couldn't delete this thread. Try again.");
            console.error(err);
        } finally {
            setThreadToDelete(null);
        }
    }

    // comprime a imagem para um url de base64 e grava no card da thread

    async function handleImageUpload(threadId, file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please choose an image file.');
            return;
        }

        setUploadingId(threadId);
        setError('');

        try {
            const imageUrl = await compressImage(file);

            // como o limite do firesotre ´1 1mb, assim tem espaço suficiente para o input dos outros campos.

            if (imageUrl.length > 700_000) {
                setError('That image is too large even after compression. Try a smaller or simpler picture.');
                return;
            }

            await updateDoc(doc(db, 'threads', threadId), { imageUrl });

            setThreads((prev) =>
                prev.map((t) => (t.id === threadId ? { ...t, imageUrl } : t))
            );
        } catch (err) {
            setError("Couldn't process that image. Try again.");
            console.error(err);
        } finally {
            setUploadingId(null);
        }
    }

    if (!currentUser || loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4, px: 2 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">
                    My Threads
                </Typography>
                <Button variant="contained" component={RouterLink} to="/threads/new">
                    Create New Thread
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {threads.length === 0 ? (
                <Typography>You haven't posted any threads yet.</Typography>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 2,
                    }}
                >
                    {threads.map((t) => (
                        <Card key={t.id} sx={{ display: 'flex', flexDirection: 'column' }}>

                            <Box
                                sx={{
                                    position: 'relative',
                                    height: 160,
                                    bgcolor: 'grey.200',
                                    backgroundImage: t.imageUrl ? `url(${t.imageUrl})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {!t.imageUrl && (
                                    <ImageIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                                )}

                                {uploadingId === t.id && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'rgba(0, 0, 0, 0.4)',
                                        }}
                                    >
                                        <CircularProgress sx={{ color: 'common.white' }} />
                                    </Box>
                                )}

                                <IconButton
                                    component="label"
                                    size="small"
                                    aria-label="upload banner image"
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
                                        onChange={(e) => handleImageUpload(t.id, e.target.files[0])}
                                    />
                                </IconButton>
                            </Box>

                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    {t.gameName}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        mb: 1.5,
                                    }}
                                >
                                    {t.description}
                                </Typography>

                                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                                    <Chip label={t.platform} size="small" />
                                    <Chip label={t.category} size="small" />
                                    <Chip label={t.region} size="small" />
                                </Stack>

                                <Typography variant="caption" color="text.secondary" display="block">
                                    Up to {t.maxPlayers} players 🧜⛹️• Difficulty {t.difficulty}/5⭐ • Release Year: {t.releaseYear}
                                </Typography>
                                <br />
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Posted {formatDate(t.createdAt)}
                                </Typography>
                            </CardContent>

                            <CardActions>
                                <IconButton
                                    component={RouterLink}
                                    to={`/threads/${t.id}`}
                                    aria-label="view thread"
                                >
                                    <VisibilityIcon />
                                </IconButton>
                                <IconButton
                                    component={RouterLink}
                                    to={`/threads/${t.id}/edit`}
                                    aria-label="edit thread"
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleDeleteClick(t)}
                                    aria-label="delete thread"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    ))}
                </Box>
            )}

            <Dialog open={!!threadToDelete} onClose={handleDeleteCancel}>
                <DialogTitle>Delete thread?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {threadToDelete && (
                            <>Delete &quot;{threadToDelete.gameName}&quot;? This cannot be undone.</>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default MyThreads;