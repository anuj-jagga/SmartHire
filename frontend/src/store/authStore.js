import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    login: (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        set({ user: userData, token });
    },
    logout: async () => {
        try {
            const axios = (await import('axios')).default;
            await axios.post('/api/auth/logout');
        } catch (err) {
            console.error("Logout failed on server", err);
        }
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },
}));

export default useAuthStore;
