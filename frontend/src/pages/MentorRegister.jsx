import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    User, Mail, Lock, Phone, ArrowRight,
    GraduationCap, Star, Users, BookOpen, Award
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const MentorRegister = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
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
                role: 'mentor'
            });

            toast.success('Mentor account created! Complete your profile 🎓', {
                style: { background: '#8B5CF6', color: '#fff' }
            });
            setTimeout(() => navigate('/mentor/onboarding'), 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const perks = [
        { icon: Users, text: 'Connect with aspiring entrepreneurs' },
        { icon: Star, text: 'Build your mentorship reputation' },
        { icon: BookOpen, text: 'Share your knowledge & resources' },
        { icon: Award, text: 'Get recognized as an industry expert' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden p-4">
            <Toaster position="top-center" />

            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
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
                        <div className="inline-flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">EntreSkill Hub</h2>
                                <p className="text-xs text-gray-300">Mentor Program</p>
                            </div>
                        </div>

                        {/* Heading */}
                        <div>
                            <h1 className="text-4xl xl:text-5xl font-heading font-bold leading-tight mb-3">
                                Share Your
                                <span className="block mt-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                                    Expertise & Impact
                                </span>
                            </h1>
                            <p className="text-lg text-gray-300">
                                Join 250+ verified mentors guiding the next generation of entrepreneurs
                            </p>
                        </div>

                        {/* Perks */}
                        <div className="grid grid-cols-2 gap-3">
                            {perks.map((perk, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
                                >
                                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-2">
                                        <perk.icon size={18} className="text-white" />
                                    </div>
                                    <p className="text-sm font-semibold">{perk.text}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 pt-4">
                            {[
                                { value: '250+', label: 'Active Mentors' },
                                { value: '5k+', label: 'Sessions Done' },
                                { value: '4.8★', label: 'Avg Rating' },
                            ].map((stat, index) => (
                                <div key={index}>
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-gray-300">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Side - Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
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
                                    className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-3 shadow-lg"
                                >
                                    <GraduationCap className="text-white" size={24} />
                                </motion.div>
                                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-1">
                                    Register as Mentor 🎓
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    Create your mentor account to get started
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
                                    className="w-full bg-gradient-to-r from-purple-500 to-blue-600"
                                    size="lg"
                                >
                                    {loading ? 'Creating Account...' : 'Create Mentor Account'}
                                </Button>
                            </form>

                            {/* Info Note */}
                            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                                <p className="text-xs text-purple-700 font-medium text-center">
                                    🔍 After registration, you'll complete your mentor profile.
                                    Admin will verify your credentials before you go live.
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500 font-medium">
                                        Not a mentor?
                                    </span>
                                </div>
                            </div>

                            <Link to="/register">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 px-6 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Register as User
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

export default MentorRegister;