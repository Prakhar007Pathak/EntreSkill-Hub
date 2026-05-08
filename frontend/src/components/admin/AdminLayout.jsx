import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, GraduationCap,
    BookOpen, Briefcase, LogOut, Shield,
    Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/mentors', icon: GraduationCap, label: 'Mentors' },
    { to: '/admin/resources', icon: BookOpen, label: 'Resources' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/businesses', icon: Briefcase, label: 'Businesses' }
];

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Logged out');
        navigate('/admin/login');
    };

    const Sidebar = ({ mobile = false }) => (
        <div className={`flex flex-col h-full ${mobile ? 'p-4' : 'p-6'}`}>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center">
                    <Shield size={20} className="text-white" />
                </div>
                <div>
                    <p className="font-bold text-white text-sm">EntreSkill</p>
                    <p className="text-gray-400 text-xs">Admin Panel</p>
                </div>
                {mobile && (
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="ml-auto text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Admin Info */}
            <div className="bg-white/10 rounded-xl p-3 mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                            {user?.fullName?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="text-white text-sm font-medium">{user?.fullName}</p>
                        <p className="text-gray-400 text-xs">Administrator</p>
                    </div>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 space-y-1">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${isActive
                                ? 'bg-white/20 text-white'
                                : 'text-gray-400 hover:bg-white/10 hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={18} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all font-medium text-sm mt-4"
            >
                <LogOut size={18} />
                Logout
            </button>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-slate-800 to-slate-900 flex-shrink-0">
                <Sidebar />
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-gradient-to-b from-slate-800 to-slate-900 lg:hidden"
                        >
                            <Sidebar mobile />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar (mobile) */}
                <div className="lg:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100 flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-600"
                    >
                        <Menu size={22} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Shield size={18} className="text-slate-700" />
                        <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
                    </div>
                    <div className="w-8" />
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;