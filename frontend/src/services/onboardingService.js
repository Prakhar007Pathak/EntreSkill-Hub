import api from './api';

const onboardingService = {
    // Submit onboarding data
    submitOnboarding: async (data) => {
        const response = await api.post('/onboarding', data);
        return response.data;
    },

    // Get onboarding status
    getStatus: async () => {
        const response = await api.get('/onboarding/status');
        return response.data;
    }
};

export default onboardingService;