import api from './api';

const mentorService = {

    // ─── USER SIDE ────────────────────────────────────────

    getMentors: async (params = {}) => {
        const response = await api.get('/mentors', { params });
        return response.data;
    },

    getMentorBySlug: async (mentorSlug) => {
        const response = await api.get(`/mentors/${mentorSlug}`);
        return response.data;
    },

    connectMentor: async (mentorId) => {
        const response = await api.post(`/mentors/${mentorId}/connect`);
        return response.data;
    },

    requestSession: async (mentorId, sessionData) => {
        const response = await api.post(
            `/mentors/${mentorId}/sessions/request`,
            sessionData
        );
        return response.data;
    },

    bookSlot: async (slotId, bookingData) => {
        const response = await api.post(
            `/mentors/slots/${slotId}/book`,
            bookingData
        );
        return response.data;
    },

    // Get specific user session or all sessions
    getUserSessions: async (sessionId = null) => {
        const url = sessionId ? `/mentors/sessions/${sessionId}` : '/mentors/sessions/my';
        const response = await api.get(url);
        return response.data;
    },

    getConnectedMentors: async () => {
        const response = await api.get('/mentors/connected');
        return response.data;
    },

    // ─── NEW Q&A USER ACTIONS ─────────────────────────────
    addQuestion: async (sessionId, question) => {
        const response = await api.post(`/mentors/sessions/${sessionId}/question`, { question });
        return response.data;
    },

    // ─── MENTOR SIDE ──────────────────────────────────────

    submitMentorOnboarding: async (data) => {
        const response = await api.post('/mentors/onboarding', data);
        return response.data;
    },

    getMentorStats: async () => {
        const response = await api.get('/mentors/dashboard/stats');
        return response.data;
    },

    // Get specific mentor session or all sessions
    getMentorSessions: async (sessionId = null, params = {}) => {
        const url = sessionId ? `/mentors/dashboard/sessions/${sessionId}` : '/mentors/dashboard/sessions';
        const response = await api.get(url, { params });
        return response.data;
    },

    respondToSession: async (sessionId, data) => {
        const response = await api.put(
            `/mentors/sessions/${sessionId}/respond`,
            data
        );
        return response.data;
    },

    completeSession: async (sessionId, data = {}) => {
        const response = await api.put(
            `/mentors/sessions/${sessionId}/complete`,
            data
        );
        return response.data;
    },

    addAvailabilitySlot: async (slotData) => {
        const response = await api.post('/mentors/slots', slotData);
        return response.data;
    },

    getMentorSlots: async () => {
        const response = await api.get('/mentors/slots');
        return response.data;
    },

    deleteSlot: async (slotId) => {
        const response = await api.delete(`/mentors/slots/${slotId}`);
        return response.data;
    },

    // ─── NEW Q&A MENTOR ACTIONS ───────────────────────────
    answerQuestion: async (sessionId, questionIndex, answer) => {
        const response = await api.put(`/mentors/sessions/${sessionId}/question/${questionIndex}/answer`, { answer });
        return response.data;
    },

    // ─── MENTOR RESOURCES ─────────────────────────────────

    uploadResource: async (resourceData) => {
        const response = await api.post('/resources/upload', resourceData);
        return response.data;
    },

    getMyResources: async () => {
        const response = await api.get('/resources/mentor/my-resources');
        return response.data;
    }
};

export default mentorService;