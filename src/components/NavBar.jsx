import { useState } from 'react';
import {
    AppBar, Toolbar, Button, Typography,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

function NavBar() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [confirmLogout, setConfirmLogout] = useState(false);

    async function handleLogout() {
        setConfirmLogout(false);
        try {
            await signOut(auth);
            navigate('/login');
        } catch (err) {
            console.error('Error logging out:', err);
        }
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    component={RouterLink}
                    to="/"
                    sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
                >
                    GG Mates
                </Typography>

                {currentUser ? (
                    <>
                        <Button color="inherit" component={RouterLink} to="/">Home</Button>
                        <Button color="inherit" component={RouterLink} to="/threads/new">New Thread</Button>
                        <Button color="inherit" component={RouterLink} to="/my-threads">My Threads</Button>
                        <Button color="inherit" component={RouterLink} to="/favorites">Favorites</Button>
                        <Button color="inherit" component={RouterLink} to="/profile">Profile</Button>
                        <Button color="inherit" component={RouterLink} to="/users">Players</Button>
                        <Button color="inherit" onClick={() => setConfirmLogout(true)}>Log out</Button>
                    </>
                ) : (
                    <>
                        <Button color="inherit" component={RouterLink} to="/login">Log in</Button>
                        <Button color="inherit" component={RouterLink} to="/register">Register</Button>
                    </>
                )}
            </Toolbar>

            <Dialog open={confirmLogout} onClose={() => setConfirmLogout(false)}>
                <DialogTitle>Log out?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You'll need to log in again to get back into the arena.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmLogout(false)}>Cancel</Button>
                    <Button color="error" onClick={handleLogout}>Log out</Button>
                </DialogActions>
            </Dialog>
        </AppBar>
    );
}

export default NavBar;