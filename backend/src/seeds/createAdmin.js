import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@entreskill.com';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('✅ Admin already exists!');
            console.log('📧 Email:', existingAdmin.email);
            console.log('👤 Role:', existingAdmin.role);
            process.exit(0);
        }

        const admin = await User.create({
            fullName: process.env.ADMIN_NAME || 'EntreSkill Admin',
            email: adminEmail,
            password: process.env.ADMIN_PASSWORD || 'Admin@123456',
            phone: process.env.ADMIN_PHONE || '+919999999999',
            role: 'admin',
            onboardingCompleted: true,
            isActive: true
        });

        console.log('\n🎉 ═══════════════════════════════════════════');
        console.log('✅ ADMIN CREATED SUCCESSFULLY!');
        console.log('═══════════════════════════════════════════');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password:', process.env.ADMIN_PASSWORD || 'Admin@123456');
        console.log('🆔 ID:', admin._id);
        console.log('⚠️  Change password after first login!');
        console.log('═══════════════════════════════════════════\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating admin:', err);
        process.exit(1);
    }
};

createAdmin();