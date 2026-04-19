import api from './api';

const roadmapService = {
    // Get roadmap by business slug
    getRoadmap: async (businessSlug) => {
        const response = await api.get(`/roadmaps/${businessSlug}`);
        return response.data;
    },

    // Start roadmap
    startRoadmap: async (roadmapId) => {
        const response = await api.post(`/roadmaps/${roadmapId}/start`);
        return response.data;
    },

    // Complete task
    completeTask: async (roadmapId, taskId) => {
        const response = await api.post(`/roadmaps/${roadmapId}/task/${taskId}/complete`);
        return response.data;
    },

    // Add note
    addNote: async (roadmapId, stageNumber, note) => {
        const response = await api.post(`/roadmaps/${roadmapId}/stage/${stageNumber}/note`, { note });
        return response.data;
    },

    // Get user's active roadmaps
    getUserRoadmaps: async () => {
        const response = await api.get('/roadmaps/user/active');
        return response.data;
    }
};

export default roadmapService;