import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { autoCreateAdmin } from './utils/autoCreateAdmin.js';

import authRoutes from './routes/authRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://entre-skill-hub.vercel.app'
    ]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({
        message: '🚀 EntreSkill API',
        version: '1.0.0',
        status: 'Running'
    });
});

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/test', (req, res) => {
    res.json({ message: '🚀 Backend is running!', database: 'Connected ✅' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await autoCreateAdmin();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();