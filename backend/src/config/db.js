import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Mongoose 6+ doesn't need these options, but let's be explicit
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // These are optional in Mongoose 6+, but won't hurt
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📦 Database Name: ${conn.connection.name}`);

    } catch (error) {
        console.error(`❌ MongoDB Connection Failed:`);
        console.error(`Error: ${error.message}`);

        // Don't exit in development, so we can see other errors
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🟡 Mongoose disconnected from MongoDB');
});

export default connectDB;