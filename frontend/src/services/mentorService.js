import api from './api';

const mentorService = {

    // ─── USER SIDE ────────────────────────────────────────

    // Get all approved mentors with filters
    getMentors: async (params = {}) => {
        const response = await api.get('/mentors', { params });
        return response.data;
    },

    // Get single mentor by slug
    getMentorBySlug: async (mentorSlug) => {
        const response = await api.get(`/mentors/${mentorSlug}`);
        return response.data;
    },

    // Connect / disconnect with mentor
    connectMentor: async (mentorId) => {
        const response = await api.post(`/mentors/${mentorId}/connect`);
        return response.data;
    },

    // Request a session
    requestSession: async (mentorId, sessionData) => {
        const response = await api.post(
            `/mentors/${mentorId}/sessions/request`,
            sessionData
        );
        return response.data;
    },

    // Book an available slot
    bookSlot: async (slotId, bookingData) => {
        const response = await api.post(
            `/mentors/slots/${slotId}/book`,
            bookingData
        );
        return response.data;
    },

    // Get user's own sessions
    getUserSessions: async () => {
        const response = await api.get('/mentors/sessions/my');
        return response.data;
    },

    // Get user's connected mentors
    getConnectedMentors: async () => {
        const response = await api.get('/mentors/connected');
        return response.data;
    },

    // ─── MENTOR SIDE ──────────────────────────────────────

    // Submit mentor onboarding
    submitMentorOnboarding: async (data) => {
        const response = await api.post('/mentors/onboarding', data);
        return response.data;
    },

    // Get mentor dashboard stats
    getMentorStats: async () => {
        const response = await api.get('/mentors/dashboard/stats');
        return response.data;
    },

    // Get mentor's sessions
    getMentorSessions: async (params = {}) => {
        const response = await api.get('/mentors/dashboard/sessions', { params });
        return response.data;
    },

    // Approve or reject session
    respondToSession: async (sessionId, data) => {
        const response = await api.put(
            `/mentors/sessions/${sessionId}/respond`,
            data
        );
        return response.data;
    },

    // Complete a session
    completeSession: async (sessionId, data = {}) => {
        const response = await api.put(
            `/mentors/sessions/${sessionId}/complete`,
            data
        );
        return response.data;
    },

    // Add availability slot
    addAvailabilitySlot: async (slotData) => {
        const response = await api.post('/mentors/slots', slotData);
        return response.data;
    },

    // Get mentor's own slots
    getMentorSlots: async () => {
        const response = await api.get('/mentors/slots');
        return response.data;
    },

    // Delete a slot
    deleteSlot: async (slotId) => {
        const response = await api.delete(`/mentors/slots/${slotId}`);
        return response.data;
    }
};

export default mentorService;