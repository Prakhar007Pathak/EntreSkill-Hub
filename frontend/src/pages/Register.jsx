import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    User, Mail, Lock, Phone, ArrowRight,
    Sparkles, CheckCircle2, Rocket, Award,
    BookOpen, GraduationCap, ChevronRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (formData.fullName.length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters';
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        }
        if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: 'user'
            });

            toast.success('Account created successfully! 🎉', {
                style: { background: '#10B981', color: '#fff' }
            });
            setTimeout(() => navigate('/onboarding'), 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        { icon: Rocket, text: 'Launch your business fast' },
        { icon: Award, text: 'Get expert mentorship' },
        { icon: BookOpen, text: 'Access learning resources' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden p-4">
            <Toaster position="top-center" />

            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
                />
            </div>

            <div className="max-w-6xl w-full relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                    {/* Left Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-white space-y-6 hidden lg:block"
                    >
                        {/* Logo */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="inline-flex items-center gap-3"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">EntreSkill Hub</h2>
                                <p className="text-xs text-gray-300">Start Your Journey</p>
                            </div>
                        </motion.div>

                        {/* Heading */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h1 className="text-4xl xl:text-5xl font-heading font-bold leading-tight mb-3">
                                Join Our
                                <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Entrepreneur Community
                                </span>
                            </h1>
                            <p className="text-lg text-gray-300">
                                Start building your dream business today
                            </p>
                        </motion.div>

                        {/* Benefits */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4"
                        >
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    className="flex items-center gap-4 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                                        <benefit.icon size={20} />
                                    </div>
                                    <span className="text-lg font-medium">{benefit.text}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Social Proof */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 border-2 border-white flex items-center justify-center text-sm font-bold">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="font-bold text-lg">10,000+</p>
                                    <p className="text-sm text-gray-300">Happy Entrepreneurs</p>
                                </div>
                            </div>
                            <div className="flex gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-sm text-gray-200">"Best platform to start my business!" - Priya S.</p>
                        </motion.div>
                    </motion.div>

                    {/* Right Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-4"
                    >
                        {/* ── Mentor Banner ── */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-4 flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <GraduationCap size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">
                                        Are you an Expert or Mentor?
                                    </p>
                                    <p className="text-gray-300 text-xs">
                                        Share your knowledge & guide entrepreneurs
                                    </p>
                                </div>
                            </div>
                            <Link to="/mentor/register" className="flex-shrink-0">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all whitespace-nowrap"
                                >
                                    Join as Mentor
                                    <ChevronRight size={16} />
                                </motion.button>
                            </Link>
                        </motion.div>

                        {/* ── Register Form Card ── */}
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20"
                        >
                            {/* Header */}
                            <div className="text-center mb-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4, type: "spring" }}
                                    className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-3 shadow-lg"
                                >
                                    <User className="text-white" size={24} />
                                </motion.div>
                                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-1">
                                    Create Account 🚀
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    Start your entrepreneurship journey
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    type="text"
                                    name="fullName"
                                    label="Full Name"
                                    icon={User}
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    error={errors.fullName}
                                    required
                                />
                                <Input
                                    type="email"
                                    name="email"
                                    label="Email Address"
                                    autoComplete="email"
                                    icon={Mail}
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    required
                                />
                                <Input
                                    type="tel"
                                    name="phone"
                                    label="Phone Number"
                                    icon={Phone}
                                    value={formData.phone}
                                    onChange={handleChange}
                                    error={errors.phone}
                                    required
                                />
                                <Input
                                    type="password"
                                    name="password"
                                    label="Password"
                                    autoComplete="new-password"
                                    icon={Lock}
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    required
                                />
                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    autoComplete="new-password"
                                    icon={Lock}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={errors.confirmPassword}
                                    required
                                />

                                <Button
                                    type="submit"
                                    loading={loading}
                                    icon={ArrowRight}
                                    className="w-full"
                                    size="lg"
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500 font-medium">
                                        Already have an account?
                                    </span>
                                </div>
                            </div>

                            <Link to="/login">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 px-6 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Login to Account
                                    <ArrowRight size={18} />
                                </motion.button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Register;