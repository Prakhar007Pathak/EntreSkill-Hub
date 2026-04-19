import api from './api';

const resourceService = {
    // Get all resources with filters
    getResources: async (params = {}) => {
        const response = await api.get('/resources', { params });
        return response.data;
    },

    // Get featured resources
    getFeaturedResources: async () => {
        const response = await api.get('/resources/featured');
        return response.data;
    },

    // Get single resource by slug
    getResource: async (slug) => {
        const response = await api.get(`/resources/${slug}`);
        return response.data;
    },

    // Mark resource as completed
    completeResource: async (resourceId) => {
        const response = await api.post(`/resources/${resourceId}/complete`);
        return response.data;
    },

    // Get user's completed resources
    getCompletedResources: async () => {
        const response = await api.get('/resources/user/completed');
        return response.data;
    },

    // Toggle resource bookmark
    toggleBookmark: async (resourceId) => {
        const response = await api.post(`/resources/${resourceId}/bookmark`);
        return response.data;
    },

    // Get bookmarked resources
    getBookmarkedResources: async () => {
        const response = await api.get('/resources/user/bookmarks');
        return response.data;
    }
};

export default resourceService;