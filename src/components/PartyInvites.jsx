import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, getDoc, query, where, doc } from 'firebase/firestore';
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
    Divider,
    Paper,
} from '@mui/material';

function PartyInvites({ threadId }) {
    const { currentUser } = useAuth();

    const [thread, setThread] = useState(null);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Load the thread (to know who the author is) + the relevant invites
    const load = useCallback(async () => {
        if (!threadId || !currentUser) return;
        setLoading(true);
        setError('');
        try {
            const threadSnap = await getDoc(doc(db, 'threads', threadId));
            if (!threadSnap.exists()) {
                setError('This thread no longer exists.');
                setThread(null);
                return;
            }
            const t = { id: threadSnap.id, ...threadSnap.data() };
            setThread(t);

            const isAuthor = currentUser.uid === t.authorId;
            // Author sees every invite; a visitor only queries their own
            const q = isAuthor
                ? query(collection(db, 'partyInvites'), where('threadId', '==', threadId))
                : query(
                    collection(db, 'partyInvites'),
                    where('threadId', '==', threadId),
                    where('senderId', '==', currentUser.uid)
                );

            const snap = await getDocs(q);
            const list = snap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); // newest first
            setInvites(list);
        } catch (err) {
            setError("Couldn't load party invites. Try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [threadId, currentUser]);

    useEffect(() => { load(); }, [load]);

    async function handleSend() {
        const text = message.trim();
        if (!text) {
            setError('Write a short message before sending.');
            return;
        }
        setError('');
        setSuccess(false);
        setSending(true);
        try {
            // Pull the sender's name/email from their profile so the author can see them
            const meSnap = await getDoc(doc(db, 'users', currentUser.uid));
            const me = meSnap.exists() ? meSnap.data() : {};
            await addDoc(collection(db, 'partyInvites'), {
                threadId,
                threadAuthorId: thread.authorId,
                senderId: currentUser.uid,
                senderName: `${me.firstName || ''} ${me.lastName || ''}`.trim(),
                senderUsername: me.username || '',
                senderEmail: me.email || currentUser.email || '',
                message: text,
                createdAt: new Date().toISOString(),
            });
            setMessage('');
            setSuccess(true);
            await load(); // refresh the list
        } catch (err) {
            setError("Game over… couldn't send your invite. Try again.");
            console.error(err);
        } finally {
            setSending(false);
        }
    }

    function formatDate(iso) {
        if (!iso) return '';
        return new Date(iso).toLocaleString();
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!thread) {
        return error ? <Alert severity="error" sx={{ my: 2 }}>{error}</Alert> : null;
    }

    const isAuthor = currentUser?.uid === thread.authorId;

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Party Invites</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>GG! Invite sent.</Alert>}

            {/* The author can't send an invite to their own thread */}
            {!isAuthor && (
                <Box sx={{ mb: 3 }}>
                    <TextField
                        label="Your message"
                        placeholder="Introduce yourself and propose to team up…"
                        fullWidth
                        multiline
                        minRows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button variant="contained" sx={{ mt: 1 }} disabled={sending} onClick={handleSend}>
                        {sending ? 'Sending…' : 'Send party invite'}
                    </Button>
                </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
                {isAuthor ? 'Invites received' : 'Your invites for this thread'}
            </Typography>

            {invites.length === 0 ? (
                <Typography color="text.secondary">
                    {isAuthor ? 'No invites yet.' : "You haven't sent an invite yet."}
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {invites.map((inv) => (
                        <Paper key={inv.id} variant="outlined" sx={{ p: 2 }}>
                            {isAuthor && (
                                <Typography variant="subtitle2">
                                    {inv.senderName || inv.senderUsername || 'Unknown player'}
                                    {inv.senderEmail ? ` — ${inv.senderEmail}` : ''}
                                </Typography>
                            )}
                            <Typography variant="body2" sx={{ mt: isAuthor ? 0.5 : 0 }}>{inv.message}</Typography>
                            <Typography variant="caption" color="text.secondary">{formatDate(inv.createdAt)}</Typography>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );
}

export default PartyInvites;