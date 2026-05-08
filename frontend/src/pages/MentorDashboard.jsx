import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Calendar, CheckCircle, Clock, Star,
    BookOpen, Video, MessageSquare, LogOut,
    AlertCircle, XCircle, Upload, Award,
    GraduationCap, Loader2, Eye, Plus, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import mentorService from '../services/mentorService';
import toast from 'react-hot-toast';

// ─── Mentor Navbar ─────────────────────────────────────────
const MentorNavbar = ({ user, onLogout }) => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <GraduationCap size={18} className="text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-gray-900">EntreSkill</span>
                        <span className="ml-1.5 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                            Mentor
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                                {user?.fullName?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <span className="font-medium">{user?.fullName}</span>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-all"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    </nav>
);

// ─── Stat Card ─────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <motion.div
        whileHover={{ y: -2 }}
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
    >
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
            <Icon size={20} className={color} />
        </div>
        <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
        <p className="text-gray-500 text-sm mt-0.5">{label}</p>
    </motion.div>
);

// ─── Session Card ───────────────────────────────────────────
const SessionCard = ({ session, onApprove, onReject, onComplete }) => {
    const navigate = useNavigate();
    const [showApproveForm, setShowApproveForm] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [scheduledAt, setScheduledAt] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [responding, setResponding] = useState(false);

    const statusColors = {
        requested: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        scheduled: 'bg-blue-50 border-blue-200 text-blue-700',
        completed: 'bg-green-50 border-green-200 text-green-700',
        rejected: 'bg-red-50 border-red-200 text-red-700',
        cancelled: 'bg-gray-50 border-gray-200 text-gray-700'
    };

    const handleApprove = async () => {
        if (!scheduledAt) {
            toast.error('Please set a scheduled date and time');
            return;
        }
        setResponding(true);
        try {
            await onApprove(session._id, scheduledAt);
            setShowApproveForm(false);
        } finally {
            setResponding(false);
        }
    };

    const handleReject = async () => {
        setResponding(true);
        try {
            await onReject(session._id, rejectionReason);
            setShowRejectForm(false);
        } finally {
            setResponding(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
            {/* Top Row */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    {/* Status + Type Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColors[session.status] || statusColors.requested}`}>
                            {session.status.toUpperCase()}
                        </span>
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${session.type === 'qa'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                            }`}>
                            {session.type === 'qa'
                                ? <MessageSquare size={10} />
                                : <Video size={10} />
                            }
                            {session.type === 'qa' ? 'Q&A Session' : 'Video Call'}
                        </span>
                    </div>

                    {/* Topic */}
                    <h3 className="font-bold text-gray-900 truncate">{session.topic}</h3>

                    {/* User Info */}
                    <p className="text-gray-500 text-sm mt-0.5">
                        <span className="font-medium text-gray-700">
                            {session.userId?.fullName || 'User'}
                        </span>
                        {session.userId?.email && (
                            <span className="text-gray-400"> · {session.userId.email}</span>
                        )}
                    </p>

                    {/* Message */}
                    {session.message && (
                        <p className="text-gray-500 text-sm mt-1.5 italic line-clamp-2">
                            "{session.message}"
                        </p>
                    )}

                    {/* Scheduled Time */}
                    {session.scheduledAt && (
                        <p className="text-blue-600 text-xs font-medium mt-1.5 flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(session.scheduledAt).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    )}

                    {/* Preferred Times */}
                    {session.status === 'requested' && session.preferredTimes?.length > 0 && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 font-medium">Preferred times:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {session.preferredTimes.slice(0, 3).map((time, i) => (
                                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {new Date(time).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Q&A question count */}
                    {session.type === 'qa' && session.status === 'scheduled' && (
                        <p className="text-blue-600 text-xs mt-1.5 font-medium">
                            💬 {session.questions?.length || 0} question(s) · {session.questions?.filter(q => q.answer)?.length || 0} answered
                        </p>
                    )}
                </div>
            </div>

            {/* ─── Action Buttons: Requested ─── */}
            {session.status === 'requested' && (
                <div className="mt-3 space-y-3">
                    {!showApproveForm && !showRejectForm && (
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowApproveForm(true)}
                                className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-1.5"
                            >
                                <CheckCircle size={14} /> Approve
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowRejectForm(true)}
                                className="flex-1 py-2.5 bg-red-100 text-red-600 rounded-xl text-sm font-bold hover:bg-red-200 transition-all flex items-center justify-center gap-1.5"
                            >
                                <XCircle size={14} /> Reject
                            </motion.button>
                        </div>
                    )}

                    {/* Approve Form */}
                    {showApproveForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3 p-4 bg-green-50 rounded-xl border border-green-200"
                        >
                            <p className="text-sm font-semibold text-green-800">
                                Set Session Date & Time:
                            </p>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full p-2.5 rounded-xl border-2 border-green-200 focus:border-green-400 outline-none text-sm bg-white text-gray-900"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowApproveForm(false)}
                                    className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={responding}
                                    className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-1"
                                >
                                    {responding
                                        ? <Loader2 size={14} className="animate-spin" />
                                        : <CheckCircle size={14} />
                                    }
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Reject Form */}
                    {showRejectForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3 p-4 bg-red-50 rounded-xl border border-red-200"
                        >
                            <p className="text-sm font-semibold text-red-800">
                                Reason for rejection (optional):
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g. Not available at requested times..."
                                rows={2}
                                className="w-full p-2.5 rounded-xl border-2 border-red-200 focus:border-red-400 outline-none text-sm resize-none bg-white"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowRejectForm(false)}
                                    className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={responding}
                                    className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-60"
                                >
                                    {responding ? '...' : 'Reject'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* ─── Action Buttons: Scheduled ─── */}
            {session.status === 'scheduled' && (
                <div className="flex gap-2 mt-3">
                    {/* Join/View button based on type */}
                    {session.type === 'video_call' && session.jitsiRoomUrl && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/session-room/${session._id}`)}
                            className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm"
                        >
                            <Video size={14} /> Join Call
                        </motion.button>
                    )}

                    {session.type === 'qa' && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/qa-room/${session._id}`)}
                            className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm"
                        >
                            <Eye size={14} /> View Q&A
                        </motion.button>
                    )}

                    {/* Complete Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onComplete(session._id)}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-1.5"
                    >
                        <CheckCircle size={14} className="text-green-500" />
                        Mark Complete
                    </motion.button>
                </div>
            )}

            {/* ─── Completed: View Q&A ─── */}
            {session.status === 'completed' && session.type === 'qa' && (
                <button
                    onClick={() => navigate(`/qa-room/${session._id}`)}
                    className="mt-3 w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-1.5"
                >
                    <Eye size={14} /> View Q&A History
                </button>
            )}
        </div>
    );
};

// ─── Availability Slot Manager ──────────────────────────────
const SlotManager = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({
        date: '',
        startTime: '',
        endTime: '',
        duration: 60,
        sessionType: 'both'
    });

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await mentorService.getMentorSlots();
            setSlots(res.data.slots);
        } catch (err) {
            toast.error('Failed to load slots');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlot = async () => {
        if (!form.date || !form.startTime || !form.endTime) {
            toast.error('Please fill all required fields');
            return;
        }
        setAdding(true);
        try {
            await mentorService.addAvailabilitySlot(form);
            toast.success('Slot added!');
            setShowAddForm(false);
            setForm({ date: '', startTime: '', endTime: '', duration: 60, sessionType: 'both' });
            fetchSlots();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add slot');
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        try {
            await mentorService.deleteSlot(slotId);
            toast.success('Slot deleted');
            fetchSlots();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete slot');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Availability Slots</h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-semibold hover:bg-purple-600 transition-all"
                >
                    <Plus size={14} />
                    {showAddForm ? 'Cancel' : 'Add Slot'}
                </button>
            </div>

            {/* Add Slot Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-purple-50 rounded-2xl border border-purple-200 p-5 space-y-4"
                    >
                        <p className="font-semibold text-purple-900">Add New Availability Slot</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Date *</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full p-2.5 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none text-sm bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time *</label>
                                <input
                                    type="time"
                                    value={form.startTime}
                                    onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none text-sm bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">End Time *</label>
                                <input
                                    type="time"
                                    value={form.endTime}
                                    onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none text-sm bg-white"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Duration (minutes)</label>
                                <select
                                    value={form.duration}
                                    onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))}
                                    className="w-full p-2.5 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none text-sm bg-white"
                                >
                                    <option value={30}>30 minutes</option>
                                    <option value={45}>45 minutes</option>
                                    <option value={60}>60 minutes</option>
                                    <option value={90}>90 minutes</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Session Type</label>
                                <select
                                    value={form.sessionType}
                                    onChange={e => setForm(p => ({ ...p, sessionType: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none text-sm bg-white"
                                >
                                    <option value="both">Both (Q&A & Video)</option>
                                    <option value="qa">Q&A Only</option>
                                    <option value="video_call">Video Call Only</option>
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={handleAddSlot}
                            disabled={adding}
                            className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
                        >
                            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {adding ? 'Adding...' : 'Add Slot'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Slots List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-purple-500" />
                </div>
            ) : slots.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-medium">No availability slots yet</p>
                    <p className="text-sm">Add slots so users can book sessions with you</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {slots.map(slot => (
                        <div
                            key={slot._id}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 ${slot.isBooked
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-gray-200'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${slot.isBooked ? 'bg-green-100' : 'bg-purple-100'
                                    }`}>
                                    <Calendar size={16} className={slot.isBooked ? 'text-green-600' : 'text-purple-600'} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">
                                        {new Date(slot.date).toLocaleDateString('en-US', {
                                            weekday: 'short', month: 'short', day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                        {slot.startTime} – {slot.endTime} · {slot.duration} min
                                        <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium ${slot.sessionType === 'qa' ? 'bg-blue-100 text-blue-700' :
                                            slot.sessionType === 'video_call' ? 'bg-purple-100 text-purple-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                            {slot.sessionType === 'both' ? 'Q&A & Video' :
                                                slot.sessionType === 'qa' ? 'Q&A' : 'Video Call'}
                                        </span>
                                    </p>
                                    {slot.isBooked && slot.bookedBy && (
                                        <p className="text-green-600 text-xs font-medium mt-0.5">
                                            Booked by {slot.bookedBy.fullName}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {!slot.isBooked && (
                                <button
                                    onClick={() => handleDeleteSlot(slot._id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                            {slot.isBooked && (
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full">
                                    Booked ✓
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Main Dashboard ─────────────────────────────────────────
const MentorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, sessionsRes] = await Promise.all([
                mentorService.getMentorStats(),
                mentorService.getMentorSessions()
            ]);
            setStats(statsRes.data.stats);
            setSessions(sessionsRes.data.sessions);
        } catch (err) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (sessionId, scheduledAt) => {
        try {
            await mentorService.respondToSession(sessionId, {
                action: 'approve',
                scheduledAt
            });
            toast.success('Session approved! 🎉');
            fetchDashboardData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve session');
        }
    };

    const handleReject = async (sessionId, rejectionReason) => {
        try {
            await mentorService.respondToSession(sessionId, {
                action: 'reject',
                rejectionReason
            });
            toast.success('Session rejected');
            fetchDashboardData();
        } catch (err) {
            toast.error('Failed to reject session');
        }
    };

    const handleComplete = async (sessionId) => {
        try {
            await mentorService.completeSession(sessionId);
            toast.success('Session marked as completed! ✅');
            fetchDashboardData();
        } catch (err) {
            toast.error('Failed to complete session');
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const pendingSessions = sessions.filter(s => s.status === 'requested');
    const scheduledSessions = sessions.filter(s => s.status === 'scheduled');
    const completedSessions = sessions.filter(s => s.status === 'completed');

    const tabs = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'pending', label: `⏳ Pending (${pendingSessions.length})` },
        { id: 'scheduled', label: `📅 Scheduled (${scheduledSessions.length})` },
        { id: 'completed', label: '✅ Completed' },
        { id: 'slots', label: '🗓️ Availability' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={36} className="animate-spin text-purple-500 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <MentorNavbar user={user} onLogout={handleLogout} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.fullName?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Here's what's happening with your mentorship today
                    </p>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap gap-3 mb-8"
                >
                    <Link
                        to="/mentor/upload-resource"
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm"
                    >
                        <Upload size={16} /> Upload Resource
                    </Link>
                    <button
                        onClick={() => setActiveTab('slots')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-purple-400 transition-all text-sm"
                    >
                        <Calendar size={16} /> Manage Slots
                    </button>
                    {pendingSessions.length > 0 && (
                        <button
                            onClick={() => setActiveTab('pending')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-yellow-50 border-2 border-yellow-300 text-yellow-700 rounded-xl font-semibold hover:bg-yellow-100 transition-all text-sm"
                        >
                            <AlertCircle size={16} />
                            {pendingSessions.length} Pending Request{pendingSessions.length !== 1 ? 's' : ''}
                        </button>
                    )}
                </motion.div>

                {/* Stats Grid */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        <StatCard
                            icon={Users}
                            label="Total Mentees"
                            value={stats.totalConnections}
                            color="text-purple-600"
                            bg="bg-purple-100"
                        />
                        <StatCard
                            icon={Calendar}
                            label="Total Sessions"
                            value={stats.totalSessions}
                            color="text-blue-600"
                            bg="bg-blue-100"
                        />
                        <StatCard
                            icon={Clock}
                            label="Pending"
                            value={stats.pendingSessions}
                            color="text-yellow-600"
                            bg="bg-yellow-100"
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="Completed"
                            value={stats.completedSessions}
                            color="text-green-600"
                            bg="bg-green-100"
                        />
                    </motion.div>
                )}

                {/* Tabs Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    {/* Tab Headers */}
                    <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 px-5 py-4 text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50/50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                {/* ── Overview Tab ── */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        {/* Rating Card */}
                                        {stats?.averageRating > 0 && (
                                            <div className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100">
                                                <div className="flex items-center gap-3">
                                                    <Star size={24} className="text-yellow-500 fill-yellow-500" />
                                                    <div>
                                                        <p className="text-2xl font-bold text-gray-900">
                                                            {stats.averageRating.toFixed(1)}
                                                        </p>
                                                        <p className="text-gray-500 text-sm">
                                                            Average rating · {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Resources Stats */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                                <p className="text-2xl font-bold text-purple-700">
                                                    {stats?.totalResources || 0}
                                                </p>
                                                <p className="text-sm text-purple-600 font-medium">Approved Resources</p>
                                            </div>
                                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                                <p className="text-2xl font-bold text-orange-700">
                                                    {stats?.pendingResources || 0}
                                                </p>
                                                <p className="text-sm text-orange-600 font-medium">Pending Approval</p>
                                            </div>
                                        </div>

                                        {/* Pending Sessions Alert */}
                                        {pendingSessions.length > 0 ? (
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <AlertCircle size={16} className="text-yellow-500" />
                                                    Needs Attention ({pendingSessions.length})
                                                </h3>
                                                <div className="space-y-3">
                                                    {pendingSessions.slice(0, 3).map(session => (
                                                        <SessionCard
                                                            key={session._id}
                                                            session={session}
                                                            onApprove={handleApprove}
                                                            onReject={handleReject}
                                                            onComplete={handleComplete}
                                                        />
                                                    ))}
                                                    {pendingSessions.length > 3 && (
                                                        <button
                                                            onClick={() => setActiveTab('pending')}
                                                            className="w-full py-2.5 text-purple-600 font-semibold text-sm hover:underline"
                                                        >
                                                            View all {pendingSessions.length} pending requests →
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <CheckCircle size={36} className="mx-auto mb-3 text-green-400" />
                                                <p className="font-semibold">All caught up!</p>
                                                <p className="text-sm">No pending session requests</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Pending Tab ── */}
                                {activeTab === 'pending' && (
                                    <div>
                                        {pendingSessions.length === 0 ? (
                                            <div className="text-center py-12 text-gray-500">
                                                <CheckCircle size={36} className="mx-auto mb-3 text-green-400" />
                                                <p className="font-semibold">No pending session requests</p>
                                                <p className="text-sm mt-1">You're all caught up!</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {pendingSessions.map(session => (
                                                    <SessionCard
                                                        key={session._id}
                                                        session={session}
                                                        onApprove={handleApprove}
                                                        onReject={handleReject}
                                                        onComplete={handleComplete}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Scheduled Tab ── */}
                                {activeTab === 'scheduled' && (
                                    <div>
                                        {scheduledSessions.length === 0 ? (
                                            <div className="text-center py-12 text-gray-500">
                                                <Calendar size={36} className="mx-auto mb-3 text-blue-300" />
                                                <p className="font-semibold">No upcoming sessions</p>
                                                <p className="text-sm mt-1">Approve pending requests to see them here</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {scheduledSessions.map(session => (
                                                    <SessionCard
                                                        key={session._id}
                                                        session={session}
                                                        onApprove={handleApprove}
                                                        onReject={handleReject}
                                                        onComplete={handleComplete}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Completed Tab ── */}
                                {activeTab === 'completed' && (
                                    <div>
                                        {completedSessions.length === 0 ? (
                                            <div className="text-center py-12 text-gray-500">
                                                <Award size={36} className="mx-auto mb-3 text-purple-300" />
                                                <p className="font-semibold">No completed sessions yet</p>
                                                <p className="text-sm mt-1">Sessions you complete will appear here</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {completedSessions.map(session => (
                                                    <SessionCard
                                                        key={session._id}
                                                        session={session}
                                                        onApprove={handleApprove}
                                                        onReject={handleReject}
                                                        onComplete={handleComplete}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Slots Tab ── */}
                                {activeTab === 'slots' && <SlotManager />}

                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default MentorDashboard;