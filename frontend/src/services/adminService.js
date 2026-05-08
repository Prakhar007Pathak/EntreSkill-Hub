import api from './api';

const adminService = {

    // ─── AUTH ─────────────────────────────────────────────
    login: async (credentials) => {
        const response = await api.post('/admin/login', credentials);
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    // ─── STATS ────────────────────────────────────────────
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // ─── USERS ────────────────────────────────────────────
    getUsers: async (params = {}) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    toggleUserStatus: async (userId) => {
        const response = await api.put(`/admin/users/${userId}/toggle-status`);
        return response.data;
    },

    // ─── MENTORS ──────────────────────────────────────────
    getMentors: async (params = {}) => {
        const response = await api.get('/admin/mentors', { params });
        return response.data;
    },

    getMentorDetail: async (mentorId) => {
        const response = await api.get(`/admin/mentors/${mentorId}`);
        return response.data;
    },

    approveMentor: async (mentorId) => {
        const response = await api.put(`/admin/mentors/${mentorId}/approve`);
        return response.data;
    },

    rejectMentor: async (mentorId, reason) => {
        const response = await api.put(`/admin/mentors/${mentorId}/reject`, { reason });
        return response.data;
    },

    // ✅ ADD THIS FUNCTION
    toggleMentorStatus: async (mentorId) => {
        const response = await api.put(`/admin/mentors/${mentorId}/toggle-status`);
        return response.data;
    },

    // ─── RESOURCES ────────────────────────────────────────
    getResources: async (params = {}) => {
        const response = await api.get('/admin/resources', { params });
        return response.data;
    },

    approveResource: async (resourceId) => {
        const response = await api.put(`/admin/resources/${resourceId}/approve`);
        return response.data;
    },

    rejectResource: async (resourceId, reason) => {
        const response = await api.put(`/admin/resources/${resourceId}/reject`, { reason });
        return response.data;
    },

    toggleFeatured: async (resourceId) => {
        const response = await api.put(`/admin/resources/${resourceId}/feature`);
        return response.data;
    },

    deleteResource: async (resourceId) => {
        const response = await api.delete(`/admin/resources/${resourceId}`);
        return response.data;
    },

    // ─── BUSINESSES ───────────────────────────────────────
    getBusinesses: async (params = {}) => {
        const response = await api.get('/admin/businesses', { params });
        return response.data;
    },

    toggleBusinessStatus: async (businessId) => {
        const response = await api.put(`/admin/businesses/${businessId}/toggle`);
        return response.data;
    }
};

export default adminService;