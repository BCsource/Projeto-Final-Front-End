import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

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
} from '@mui/material';

function AllUsersAdminOnly() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load every player from the "users" collection when the page opens
    useEffect(() => {
        async function fetchPlayers() {
            try {
                const snapshot = await getDocs(collection(db, 'users'));
                // snapshot.docs is an array — turn each doc into a plain object
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, px: 2 }}>
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
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {players.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.username}</TableCell>
                                    <TableCell>{p.firstName} {p.lastName}</TableCell>
                                    <TableCell>{p.email}</TableCell>
                                    <TableCell>{p.mainPlatform}</TableCell>
                                    <TableCell>{p.isAdmin ? 'Yes' : 'No'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

export default AllUsersAdminOnly;