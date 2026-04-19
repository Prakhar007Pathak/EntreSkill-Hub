import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add this BEFORE your other routes
app.get('/', (req, res) => {
    res.json({
        message: '🚀 EntreSkill API',
        version: '1.0.0',
        status: 'Running',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/me'
            },
            test: 'GET /api/test'
        },
        docs: 'Visit http://localhost:5173 for the app'
    });
});


// Routes-
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/notifications', notificationRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({
        message: '🚀 Backend is running!',
        database: 'Connected ✅'
    });
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