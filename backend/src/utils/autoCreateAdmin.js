import User from '../models/User.js';

/**
 * ✅ Auto-creates admin user on server startup if not exists
 * Uses environment variables for credentials
 */
export const autoCreateAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@entreskill.com';

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            return;
        }

        // Create admin from environment variables
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
        console.log('✅ ADMIN USER AUTO-CREATED SUCCESSFULLY!');
        console.log('═══════════════════════════════════════════');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password:', process.env.ADMIN_PASSWORD || 'Admin@123456');
        console.log('⚠️  IMPORTANT: Change password after first login!');
        console.log('═══════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Error auto-creating admin:', error.message);
        // Don't crash the server, just log the error
    }
};