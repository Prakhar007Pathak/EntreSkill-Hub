import api from './api';

const bookmarkService = {
    // ─── BUSINESS BOOKMARKS ───────────────────────────────
    // Get all bookmarked businesses
    getBusinessBookmarks: async () => {
        const response = await api.get('/businesses/user/bookmarks');
        return response.data;
    },

    // Toggle business bookmark
    toggleBusinessBookmark: async (businessId) => {
        const response = await api.post(`/businesses/${businessId}/bookmark`);
        return response.data;
    },

    // Check if business is bookmarked
    checkBusinessBookmark: async (businessId) => {
        const response = await api.get(`/businesses/${businessId}`);
        return response.data.data.isBookmarked;
    },

    // ─── RESOURCE BOOKMARKS ───────────────────────────────
    // Get all bookmarked resources
    getResourceBookmarks: async () => {
        const response = await api.get('/resources/user/bookmarks');
        return response.data;
    },

    // Toggle resource bookmark
    toggleResourceBookmark: async (resourceId) => {
        const response = await api.post(`/resources/${resourceId}/bookmark`);
        return response.data;
    },

    // ─── ALL BOOKMARKS ────────────────────────────────────
    // Get all bookmarks (businesses + resources combined)
    getAllBookmarks: async () => {
        const [businessRes, resourceRes] = await Promise.all([
            api.get('/businesses/user/bookmarks'),
            api.get('/resources/user/bookmarks')
        ]);

        const businesses = businessRes.data.data.businesses.map(b => ({
            ...b,
            bookmarkType: 'business'
        }));

        const resources = resourceRes.data.data.resources.map(r => ({
            ...r,
            bookmarkType: 'resource'
        }));

        return {
            businesses,
            resources,
            total: businesses.length + resources.length
        };
    }
};

export default bookmarkService;