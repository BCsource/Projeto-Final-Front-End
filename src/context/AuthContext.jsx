import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

// 1. Create the context (the "box" that will hold the logged-in player)
const AuthContext = createContext(null);

// 2. Small custom hook so any component can read the auth state with useAuth()
export function useAuth() {
    return useContext(AuthContext);
}

// 3. Provider that wraps the app and keeps track of who is logged in
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // onAuthStateChanged fires once when the app loads,
        // then every time the player logs in or logs out.
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user); // a user object if logged in, null if not
            setLoading(false);    // the first auth check is now done
        });

        // Cleanup: stop listening when the app unmounts
        return () => unsubscribe();
    }, []);

    const value = { currentUser, loading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}