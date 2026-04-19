import api from './api';

const businessService = {
    // Get all businesses with filters
    getBusinesses: async (params = {}) => {
        const response = await api.get('/businesses', { params });
        return response.data;
    },

    // Get personalized recommendations
    getRecommendations: async () => {
        const response = await api.get('/businesses/user/recommendations');
        return response.data;
    },

    // Get single business by slug
    getBusiness: async (slug) => {
        const response = await api.get(`/businesses/${slug}`);
        return response.data;
    },

    // Toggle business bookmark
    toggleBookmark: async (businessId) => {
        const response = await api.post(`/businesses/${businessId}/bookmark`);
        return response.data;
    },

    // Get bookmarked businesses
    getBookmarks: async () => {
        const response = await api.get('/businesses/user/bookmarks');
        return response.data;
    }
};

export default businessService;