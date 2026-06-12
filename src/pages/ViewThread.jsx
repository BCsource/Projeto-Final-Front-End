import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import PartyInvites from '../components/PartyInvites';

import {
    Box,
    Typography,
    Chip,
    Stack,
    Card,
    CardContent,
    Avatar,
    Button,
    CircularProgress,
    Alert,
    IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';

// igual ao formatDate do profile

function formatDate(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-GB');
}


function renderStars(level) {
    const n = Math.max(0, Math.min(5, Number(level) || 0));
    return '⭐ '.repeat(n) + '☆'.repeat(5 - n);
}

// botao de show more/less para testamentos 

const DESCRIPTION_PREVIEW_LENGTH = 600;

function truncateDescription(text, maxLength) {
    if (text.length <= maxLength) return text;
    const cut = text.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
}

function ViewThread() {
    const { threadId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [thread, setThread] = useState(null);
    const [author, setAuthor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        async function fetchThread() {
            try {
                const threadRef = doc(db, 'threads', threadId);
                const threadSnap = await getDoc(threadRef);

                if (!threadSnap.exists()) {
                    setError('This thread no longer exists.');
                    return;
                }

                const threadData = { id: threadSnap.id, ...threadSnap.data() };
                setThread(threadData);
                setDescriptionExpanded(false);


                if (threadData.authorId === currentUser.uid) {
                    const meSnap = await getDoc(doc(db, 'users', currentUser.uid));
                    if (meSnap.exists()) setAuthor(meSnap.data());
                } else {
                    const authorSnap = await getDoc(doc(db, 'users', threadData.authorId));
                    if (authorSnap.exists()) setAuthor(authorSnap.data());
                }
            } catch (err) {
                setError("Couldn't load this thread. Try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchThread();
    }, [threadId, currentUser]);

    const isAuthor = !!(thread && currentUser && thread.authorId === currentUser.uid);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !thread) {
        return (
            <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, px: 2 }}>
                <Alert severity="error">{error || 'Thread not found.'}</Alert>
            </Box>
        );
    }

    const isLongDescription = thread.description.length > DESCRIPTION_PREVIEW_LENGTH;
    const descriptionToShow = descriptionExpanded || !isLongDescription
        ? thread.description
        : truncateDescription(thread.description, DESCRIPTION_PREVIEW_LENGTH);

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 2, px: 2, mb: 6 }}>
            <IconButton onClick={() => navigate(-1)} aria-label="go back" sx={{ mb: 1 }}>
                <ArrowBackIcon />
            </IconButton>

            <Card sx={{ mb: 2 }}>
                {thread.imageUrl && (
                    <Box
                        sx={{
                            height: 280,
                            backgroundImage: `url(${thread.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                )}

                <CardContent>
                    <Stack
                        direction="row"
                        sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}
                    >
                        <Typography variant="h4" gutterBottom>
                            {thread.gameName}
                        </Typography>

                        {isAuthor && (
                            <Button
                                component={RouterLink}
                                to={`/threads/${thread.id}/edit`}
                                startIcon={<EditIcon />}
                                size="small"
                                sx={{ flexShrink: 0 }}
                            >
                                Edit
                            </Button>
                        )}
                    </Stack>

                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 2 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>
                            {author?.firstName?.[0]?.toUpperCase() ?? '?'}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                            Posted by {author ? `${author.firstName}` : 'Unknown player'}
                            {' • '}
                            {formatDate(thread.createdAt)}
                        </Typography>
                    </Stack>

                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        <Chip label={thread.platform} color="primary" />
                        <Chip label={thread.category} />
                        <Chip label={thread.region} />
                        <Chip label={`Up to ${thread.maxPlayers} players`} variant="outlined" />
                        <Chip label={`Released ${thread.releaseYear}`} variant="outlined" />
                        <Chip label={`Difficulty ${renderStars(thread.difficulty)}`} variant="outlined" />
                    </Stack>

                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {descriptionToShow}
                    </Typography>

                    {isLongDescription && (
                        <Button
                            size="small"
                            onClick={() => setDescriptionExpanded((prev) => !prev)}
                            sx={{ mt: 0.5, ml: -1 }}
                        >
                            {descriptionExpanded ? 'Show less' : 'Show more'}
                        </Button>
                    )}
                </CardContent>
            </Card>

            <PartyInvites threadId={threadId} />
        </Box>
    );
}

export default ViewThread;