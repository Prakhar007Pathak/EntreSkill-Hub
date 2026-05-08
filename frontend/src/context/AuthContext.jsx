import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    }, []);

    const register = async (userData) => {
        const data = await authService.register(userData);
        setUser(data.data.user);
        return data;
    };

    const login = async (credentials) => {
        const data = await authService.login(credentials);
        setUser(data.data.user);
        return data;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    // ✅ NEW: Refresh user data from backend
    const refreshUser = async () => {
        try {
            const response = await authService.getMe(); // Assumes you have this service
            const updatedUser = response.data.user;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (error) {
            console.error('Failed to refresh user:', error);
            return null;
        }
    };

    // ─── Role Helpers ──────────────────────────────────────
    const isUser = user?.role === 'user';
    const isMentor = user?.role === 'mentor';
    const isAdmin = user?.role === 'admin';

    // ─── Mentor Status Helpers ─────────────────────────────
    const isMentorOnboardingDone = user?.mentorOnboardingCompleted === true;
    const isMentorApproved = user?.mentorVerificationStatus === 'approved';
    const isMentorPending = user?.mentorVerificationStatus === 'pending';
    const isMentorRejected = user?.mentorVerificationStatus === 'rejected';

    const value = {
        user,
        setUser,
        loading,
        register,
        login,
        logout,
        refreshUser, // ✅ NEW: Export refresh function
        isAuthenticated: !!user,

        // Role helpers
        isUser,
        isMentor,
        isAdmin,

        // Mentor status helpers
        isMentorOnboardingDone,
        isMentorApproved,
        isMentorPending,
        isMentorRejected
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};