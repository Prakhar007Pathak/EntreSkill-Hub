import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, GraduationCap, BookOpen, Briefcase,
    Clock, CheckCircle, TrendingUp, AlertCircle,
    ArrowRight, Loader2
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, sub, color, bg, onClick }) => (
    <motion.div
        whileHover={{ y: -2 }}
        onClick={onClick}
        className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-all`}
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}>
                <Icon size={22} className={color} />
            </div>
            {onClick && <ArrowRight size={16} className="text-gray-300" />}
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-gray-600 font-medium text-sm">{label}</p>
        {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
    </motion.div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await adminService.getStats();
            setStats(res.data.stats);
        } catch (err) {
            toast.error('Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 size={32} className="animate-spin text-slate-500" />
                </div>
            </AdminLayout>
        );
    }

    const urgentItems = [
        {
            label: 'Mentors Pending Verification',
            value: stats?.mentors?.pending || 0,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50 border-yellow-200',
            link: '/admin/mentors?status=pending',
            icon: GraduationCap
        },
        {
            label: 'Resources Pending Approval',
            value: stats?.resources?.pending || 0,
            color: 'text-orange-600',
            bg: 'bg-orange-50 border-orange-200',
            link: '/admin/resources?status=pending',
            icon: BookOpen
        }
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Platform overview and pending actions
                    </p>
                </div>

                {/* Urgent Actions */}
                {urgentItems.some(u => u.value > 0) && (
                    <div>
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <AlertCircle size={14} className="text-red-500" />
                            Needs Attention
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {urgentItems.filter(u => u.value > 0).map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => navigate(item.link)}
                                    className={`flex items-center justify-between p-4 rounded-2xl border-2 ${item.bg} cursor-pointer`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} className={item.color} />
                                        <div>
                                            <p className={`font-bold text-lg ${item.color}`}>{item.value}</p>
                                            <p className="text-gray-600 text-sm font-medium">{item.label}</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className="text-gray-400" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div>
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                        Platform Overview
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={Users}
                            label="Total Users"
                            value={stats?.users?.total || 0}
                            sub={`+${stats?.users?.recentSignups || 0} this week`}
                            color="text-blue-600"
                            bg="bg-blue-100"
                            onClick={() => navigate('/admin/users')}
                        />
                        <StatCard
                            icon={GraduationCap}
                            label="Total Mentors"
                            value={stats?.mentors?.total || 0}
                            sub={`${stats?.mentors?.approved || 0} approved`}
                            color="text-purple-600"
                            bg="bg-purple-100"
                            onClick={() => navigate('/admin/mentors')}
                        />
                        <StatCard
                            icon={BookOpen}
                            label="Resources"
                            value={stats?.resources?.total || 0}
                            sub={`${stats?.resources?.approved || 0} live`}
                            color="text-green-600"
                            bg="bg-green-100"
                            onClick={() => navigate('/admin/resources')}
                        />
                        <StatCard
                            icon={Briefcase}
                            label="Businesses"
                            value={stats?.businesses?.total || 0}
                            color="text-orange-600"
                            bg="bg-orange-100"
                            onClick={() => navigate('/admin/businesses')}
                        />
                    </div>
                </div>

                {/* Mentor Breakdown */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-bold text-gray-900 mb-4">Mentor Status Breakdown</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Pending', value: stats?.mentors?.pending || 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                            { label: 'Approved', value: stats?.mentors?.approved || 0, color: 'text-green-600', bg: 'bg-green-50' },
                            { label: 'Rejected', value: stats?.mentors?.rejected || 0, color: 'text-red-600', bg: 'bg-red-50' }
                        ].map((item, i) => (
                            <div key={i} className={`${item.bg} rounded-xl p-4 text-center`}>
                                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                                <p className="text-gray-600 text-sm font-medium mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Session Stats */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-bold text-gray-900 mb-4">Session Analytics</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4">
                            <p className="text-2xl font-bold text-blue-700">{stats?.sessions?.total || 0}</p>
                            <p className="text-gray-600 text-sm mt-1">Total Sessions</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4">
                            <p className="text-2xl font-bold text-green-700">{stats?.sessions?.completed || 0}</p>
                            <p className="text-gray-600 text-sm mt-1">Completed</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;