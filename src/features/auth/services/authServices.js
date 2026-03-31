import { apiRequest } from '../../../shared/config/apiConfig';

const isDev = import.meta.env.DEV;

export function authService = {

    async register(userData) {
        try {
            const cleanData = { ...userData };
            delete cleanData.confirmPassword;
            return await apiRequest.post('/auth/register', cleanData);
        } catch (error) {
            if (isDev) console.error('❌ Auth: Register error:', error);
            throw error;
        }
    },

    async checkUniqueness(field, value) {
        try {
            const response = await apiRequest.post('/auth/check-uniqueness', { field, value });
            return response.isUnique;
        } catch {
            return false;
        }
    },

    async verifyToken(token) {
        try {
            const payload = token ? { token } : {};
            return await apiRequest.post('/auth/verify', payload);
        } catch (error) {
            if (isDev) console.error('❌ Auth: Token verification error:', error);
            throw error;
        }
    },

    async getCurrentUser() {
        try {
            return await apiRequest.get('/auth/me');
        } catch (error) {
            if (isDev) console.error('❌ Auth: Get current user error:', error);
            throw error;
        }
    },

    async editProfile(profileData) {
        try {
            return await apiRequest.put('/auth/profile', profileData);
        } catch (error) {
            if (isDev) console.error('❌ Auth: Edit profile error:', error);
            throw error;
        }
    },

    async logout() {
        try {
            return await apiRequest.post('/auth/logout');
        } catch {
            return { success: true };
        }
    },

    async forgotPassword(email) {
        if (!email) throw new Error('Correo electrónico es requerido');
        try {
            return await apiRequest.post('/auth/forgot-password', {
                correo: email.trim().toLowerCase(),
            });
        } catch (error) {
            if (isDev) console.error('❌ Auth: Forgot password error:', error);
            throw error;
        }
    },

    async resetPassword(resetData) {
        if (!resetData.token || !resetData.newPassword) {
            throw new Error('Token y nueva contraseña son requeridos');
        }
        try {
            return await apiRequest.post('/auth/reset-password', resetData);
        } catch (error) {
            if (isDev) console.error('❌ Auth: Reset password error:', error);
            throw error;
        }
    },

    async getUserPrivileges() {
        try {
            return await apiRequest.get('/auth/privileges');
        } catch (error) {
            if (isDev) console.error('❌ Auth: Get privileges error:', error);
            throw error;
        }
    },
};
