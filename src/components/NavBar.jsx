import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

function NavBar() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
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
                        <Button color="inherit" component={RouterLink} to="/profile">Profile</Button>
                        <Button color="inherit" component={RouterLink} to="/users">Players</Button>
                        <Button color="inherit" onClick={handleLogout}>Log out</Button>
                    </>
                ) : (
                    <>
                        <Button color="inherit" component={RouterLink} to="/login">Log in</Button>
                        <Button color="inherit" component={RouterLink} to="/register">Register</Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default NavBar;