import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import {
    Clock, CheckCircle2, XCircle, Mail,
    GraduationCap, LogOut, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const MentorPendingVerification = () => {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);

    // ✅ Auto-redirect if approved
    useEffect(() => {
        if (user?.mentorVerificationStatus === 'approved') {
            toast.success('Your account has been approved! 🎉');
            setTimeout(() => navigate('/mentor/dashboard'), 1500);
        }
    }, [user, navigate]);

    // ✅ Auto-check every 30 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            await refreshUser();
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [refreshUser]);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    // ✅ Manual check status button
    const handleCheckStatus = async () => {
        setChecking(true);
        try {
            const updatedUser = await refreshUser();
            if (updatedUser?.mentorVerificationStatus === 'approved') {
                toast.success('Approved! Redirecting...');
                setTimeout(() => navigate('/mentor/dashboard'), 1000);
            } else if (updatedUser?.mentorVerificationStatus === 'rejected') {
                toast.error('Application rejected');
            } else {
                toast('Still pending review');
            }
        } catch (error) {
            toast.error('Failed to check status');
        } finally {
            setChecking(false);
        }
    };

    const statusConfig = {
        pending: {
            icon: Clock,
            color: 'text-yellow-500',
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            border: 'border-yellow-300 dark:border-yellow-700',
            title: 'Verification Pending',
            message: 'Our admin team is reviewing your mentor profile. This usually takes 24-48 hours.',
            gradient: 'from-yellow-500 to-orange-500'
        },
        rejected: {
            icon: XCircle,
            color: 'text-red-500',
            bg: 'bg-red-100 dark:bg-red-900/30',
            border: 'border-red-300 dark:border-red-700',
            title: 'Verification Not Approved',
            message: user?.mentorRejectionReason || 'Your profile did not meet our current requirements.',
            gradient: 'from-red-500 to-pink-500'
        }
    };

    const status = user?.mentorVerificationStatus || 'pending';
    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;

    const steps = [
        { label: 'Account Created', done: true, icon: '✅' },
        { label: 'Profile Submitted', done: true, icon: '✅' },
        { label: 'Admin Review', done: status === 'rejected', icon: status === 'pending' ? '⏳' : '❌' },
        { label: 'Account Approved', done: false, icon: '🎓' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"
            />
            <motion.div
                animate={{ scale: [1.2, 1, 1.2] }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl relative z-10"
            >
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">

                    {/* Header Icon */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${config.gradient} rounded-3xl mb-6 shadow-lg`}
                        >
                            <StatusIcon size={36} className="text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-3">
                            {config.title}
                        </h1>

                        <div className={`p-4 rounded-2xl border-2 ${config.bg} ${config.border} mb-6`}>
                            <p className={`font-medium ${config.color}`}>
                                {config.message}
                            </p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                            Verification Progress
                        </h3>
                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 ${step.done
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : index === 2 && status === 'pending'
                                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                            : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    <span className="text-xl">{step.icon}</span>
                                    <span className={`font-semibold text-sm ${step.done
                                        ? 'text-green-700 dark:text-green-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                        }`}>
                                        {step.label}
                                    </span>
                                    {index === 2 && status === 'pending' && (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="ml-auto"
                                        >
                                            <Clock size={16} className="text-yellow-500" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Info Card */}
                    {status === 'pending' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5 mb-6"
                        >
                            <div className="flex items-start gap-3">
                                <Mail size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-blue-700 dark:text-blue-400 mb-1">
                                        We'll notify you by email
                                    </p>
                                    <p className="text-sm text-blue-600 dark:text-blue-500">
                                        Once our team reviews your profile at <strong>{user?.email}</strong>,
                                        you'll receive an email with the decision.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Rejected info */}
                    {status === 'rejected' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-5 mb-6"
                        >
                            <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                                💡 You can update your mentor profile and resubmit for verification.
                                Contact us if you believe this was a mistake.
                            </p>
                        </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* ✅ Check Status Button */}
                        {status === 'pending' && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCheckStatus}
                                disabled={checking}
                                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-60 transition-all"
                            >
                                {checking ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <RefreshCw size={18} />
                                        </motion.div>
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw size={18} />
                                        Check Status
                                    </>
                                )}
                            </motion.button>
                        )}

                        {status === 'rejected' && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/mentor/onboarding')}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                            >
                                <GraduationCap size={18} />
                                Update Profile
                            </motion.button>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                            <LogOut size={18} />
                            Logout
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MentorPendingVerification;