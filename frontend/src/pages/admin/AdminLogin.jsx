import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            toast.error('Please fill all fields');
            return;
        }
        setLoading(true);
        try {
            const res = await adminService.login(form);
            setUser(res.data.user);
            toast.success('Welcome, Admin! 🛡️');
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid admin credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10"
            />
            <motion.div
                animate={{ scale: [1.2, 1, 1.2] }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-10"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8">
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl mb-4 shadow-xl"
                        >
                            <Shield size={28} className="text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Portal</h1>
                        <p className="text-gray-500 text-sm">EntreSkill Hub Administration</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Admin Email
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                                    placeholder="admin@entreskill.com"
                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-slate-500 outline-none transition-all text-gray-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-slate-500 outline-none transition-all text-gray-900"
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                            {loading ? 'Logging in...' : 'Login to Admin Panel'}
                        </motion.button>
                    </form>

                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-xs text-amber-700 font-medium text-center">
                            🔐 This is a restricted admin area. Unauthorized access is prohibited.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;