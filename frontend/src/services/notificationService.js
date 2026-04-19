import api from './api';

const notificationService = {
    // Get all notifications
    getNotifications: async (params = {}) => {
        const response = await api.get('/notifications', { params });
        return response.data;
    },

    // Get unread count only
    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    },

    // Mark single as read
    markAsRead: async (notificationId) => {
        const response = await api.put(`/notifications/${notificationId}/read`);
        return response.data;
    },

    // Mark all as read
    markAllAsRead: async () => {
        const response = await api.put('/notifications/read-all');
        return response.data;
    },

    // Delete single notification
    deleteNotification: async (notificationId) => {
        const response = await api.delete(`/notifications/${notificationId}`);
        return response.data;
    },

    // Clear all notifications
    clearAll: async () => {
        const response = await api.delete('/notifications/clear-all');
        return response.data;
    }
};

export default notificationService;