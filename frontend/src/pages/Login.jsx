import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, TrendingUp, Users, Target, Zap } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get the full response from login
            const response = await login(formData);

            // Extract user data from response
            const user = response.data.user;

            toast.success('Welcome back! 🎉', {
                style: {
                    background: '#10B981',
                    color: '#fff',
                },
            });

            // ✅ FIXED: Proper routing based on role
            if (user.role === 'admin') {
                setTimeout(() => navigate('/admin/dashboard'), 1000);
            } else if (user.role === 'mentor') {
                // Check mentor onboarding & verification status
                if (!user.mentorOnboardingCompleted) {
                    setTimeout(() => navigate('/mentor/onboarding'), 1000);
                } else if (user.mentorVerificationStatus === 'pending') {
                    setTimeout(() => navigate('/mentor/pending'), 1000);
                } else if (user.mentorVerificationStatus === 'approved') {
                    setTimeout(() => navigate('/mentor/dashboard'), 1000);
                } else if (user.mentorVerificationStatus === 'rejected') {
                    setTimeout(() => navigate('/mentor/pending'), 1000);
                } else {
                    setTimeout(() => navigate('/mentor/pending'), 1000);
                }
            } else {
                // Regular user
                if (user.onboardingCompleted) {
                    setTimeout(() => navigate('/dashboard'), 1000);
                } else {
                    setTimeout(() => navigate('/onboarding'), 1000);
                }
            }

        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };


    const features = [
        { icon: TrendingUp, text: '500+ Business Ideas', color: 'from-blue-500 to-cyan-500' },
        { icon: Users, text: '200+ Expert Mentors', color: 'from-purple-500 to-pink-500' },
        { icon: Target, text: 'Personalized Roadmaps', color: 'from-orange-500 to-red-500' },
        { icon: Zap, text: 'Fast Track Success', color: 'from-green-500 to-emerald-500' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden p-4">
            <Toaster position="top-center" />

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [90, 0, 90],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        y: [0, 50, 0],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full blur-3xl"
                />
            </div>

            {/* Floating Particles */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, Math.random() * 100 - 50, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: Math.random() * 5 + 5,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                    }}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                />
            ))}

            {/* Main Content */}
            <div className="max-w-6xl w-full relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                    {/* Left Side - Hero Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-white space-y-6 hidden lg:block"
                    >
                        {/* Logo & Brand */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center gap-3"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">EntreSkill Hub</h2>
                                <p className="text-xs text-gray-300">Your Success Partner</p>
                            </div>
                        </motion.div>

                        {/* Main Heading */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h1 className="text-4xl xl:text-5xl font-heading font-bold leading-tight mb-3">
                                Turn Your
                                <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Skills into Business
                                </span>
                            </h1>
                            <p className="text-lg text-gray-300">
                                Join 10,000+ entrepreneurs who transformed their ideas into successful ventures
                            </p>
                        </motion.div>

                        {/* Feature Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20 hover:border-white/40 transition-all cursor-pointer"
                                >
                                    <div className={`w-9 h-9 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-2`}>
                                        <feature.icon size={18} className="text-white" />
                                    </div>
                                    <p className="text-sm font-semibold">{feature.text}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="flex gap-6 pt-4"
                        >
                            {[
                                { value: '10k+', label: 'Active Users' },
                                { value: '85%', label: 'Success Rate' },
                                { value: '4.9★', label: 'Rating' },
                            ].map((stat, index) => (
                                <div key={index}>
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-gray-300">{stat.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Side - Login Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Form Card */}
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20"
                        >
                            {/* Form Header */}
                            <div className="text-center mb-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4, type: "spring" }}
                                    className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-3 shadow-lg"
                                >
                                    <Lock className="text-white" size={24} />
                                </motion.div>

                                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-1">
                                    Welcome Back! 👋
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    Login to continue your journey
                                </p>
                            </div>

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <Input
                                    type="email"
                                    name="email"
                                    label="Email Address"
                                    autoComplete="email"
                                    icon={Mail}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                                <Input
                                    type="password"
                                    name="password"
                                    label="Password"
                                    autoComplete="current-password"
                                    icon={Lock}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                {/* Forgot Password */}
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="text-gray-600">Remember me</span>
                                    </label>
                                    <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                                        Forgot password?
                                    </a>
                                </div>

                                <Button
                                    type="submit"
                                    loading={loading}
                                    icon={ArrowRight}
                                    className="w-full"
                                    size="lg"
                                >
                                    {loading ? 'Logging in...' : 'Login to Dashboard'}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500 font-medium">New to EntreSkill?</span>
                                </div>
                            </div>

                            {/* Register Link */}
                            <Link to="/register">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 px-6 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Create New Account
                                    <ArrowRight size={18} />
                                </motion.button>
                            </Link>

                            {/* Security Badge */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="mt-5 text-center"
                            >
                                <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                                    </svg>
                                    Secured with 256-bit encryption
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;