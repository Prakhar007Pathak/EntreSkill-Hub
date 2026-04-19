import api from './api';

const progressService = {
    // Get full dashboard progress data
    getProgress: async () => {
        const response = await api.get('/progress');
        return response.data;
    },

    // Update stats
    updateStats: async (type, value = 1) => {
        const response = await api.put('/progress/stats', { type, value });
        return response.data;
    },

    // Complete dashboard task
    completeTask: async (taskId) => {
        const response = await api.put(`/progress/task/${taskId}`);
        return response.data;
    },

    // Get user's active roadmaps
    getActiveRoadmaps: async () => {
        const response = await api.get('/roadmaps/user/active');
        return response.data;
    }
};

export default progressService;