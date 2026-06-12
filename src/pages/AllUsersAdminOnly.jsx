import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    Button,
    Stack,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';

function AllUsersAdminOnly() {
    const { currentUser } = useAuth();

    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState(null);
    const [toDelete, setToDelete] = useState(null);

    useEffect(() => {
        async function fetchPlayers() {
            try {
                const snapshot = await getDocs(collection(db, 'users'));
                const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                setPlayers(list);
            } catch (err) {
                setError("Couldn't load the roster. Try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchPlayers();
    }, []);

    async function toggleAdmin(player) {
        setError('');
        setActionId(player.id);
        try {
            const ref = doc(db, 'users', player.id);
            const newValue = !player.isAdmin;
            await updateDoc(ref, { isAdmin: newValue });
            setPlayers((prev) =>
                prev.map((p) => (p.id === player.id ? { ...p, isAdmin: newValue } : p))
            );
        } catch (err) {
            setError("Game over… couldn't update that player. Try again.");
            console.error(err);
        } finally {
            setActionId(null);
        }
    }

    async function confirmDelete() {
        const player = toDelete;
        setToDelete(null);
        setError('');
        setActionId(player.id);
        try {
            await deleteDoc(doc(db, 'users', player.id));
            setPlayers((prev) => prev.filter((p) => p.id !== player.id));
        } catch (err) {
            setError("Game over… couldn't remove that player. Try again.");
            console.error(err);
        } finally {
            setActionId(null);
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4, px: 2 }}>
            <Typography variant="h4" gutterBottom>
                Player Roster
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {players.length === 0 ? (
                <Typography>No players found.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Username</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Platform</TableCell>
                                <TableCell>Admin</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {players.map((p) => {
                                const isSelf = p.id === currentUser?.uid;
                                const busy = actionId === p.id;
                                return (
                                    <TableRow key={p.id}>
                                        <TableCell>{p.username}</TableCell>
                                        <TableCell>{p.firstName} {p.lastName}</TableCell>
                                        <TableCell>{p.email}</TableCell>
                                        <TableCell>{p.mainPlatform}</TableCell>
                                        <TableCell>
                                            {p.isAdmin
                                                ? <Chip label="Admin" color="primary" size="small" />
                                                : <Chip label="Player" size="small" />}
                                        </TableCell>
                                        <TableCell align="right">
                                            {isSelf ? (
                                                <Typography variant="caption" color="text.secondary">You</Typography>
                                            ) : (
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        disabled={busy}
                                                        onClick={() => toggleAdmin(p)}
                                                    >
                                                        {p.isAdmin ? 'Remove admin' : 'Make admin'}
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        disabled={busy}
                                                        onClick={() => setToDelete(p)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Stack>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
                <DialogTitle>Remove this player?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This removes {toDelete?.username}'s profile from the roster. This can't be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setToDelete(null)}>Cancel</Button>
                    <Button color="error" onClick={confirmDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AllUsersAdminOnly;