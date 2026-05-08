import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap, CheckCircle, XCircle, Eye,
    Search, Loader2, User, Mail, Phone,
    Briefcase, Globe, Star, X, Clock
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

// ─── Mentor Detail Modal ────────────────────────────────────
const MentorDetailModal = ({ mentor, onClose, onApprove, onReject }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const profile = mentor.mentorProfile || {};

    const handleApprove = async () => {
        setLoading(true);
        try {
            await onApprove(mentor._id);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            await onReject(mentor._id, rejectionReason);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-slate-700 to-slate-900 p-6 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {mentor.fullName?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg">{mentor.fullName}</h2>
                                <p className="text-gray-300 text-sm">{profile.headline || 'Mentor'}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/80 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} className="text-gray-400" />
                            {mentor.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} className="text-gray-400" />
                            {mentor.phone || 'N/A'}
                        </div>
                        {profile.currentRole && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Briefcase size={14} className="text-gray-400" />
                                {profile.currentRole}
                            </div>
                        )}
                        {profile.yearsOfExperience && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Star size={14} className="text-gray-400" />
                                {profile.yearsOfExperience} years experience
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wider">Bio</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
                        </div>
                    )}

                    {/* Expertise */}
                    {profile.primaryExpertise?.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wider">Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.primaryExpertise.map(exp => (
                                    <span key={exp} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                        {exp}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {profile.skills?.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wider">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.slice(0, 10).map(skill => (
                                    <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Session Types */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wider">Session Types</h3>
                        <div className="flex gap-2">
                            {profile.sessionTypes?.qa && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">💬 Q&A</span>
                            )}
                            {profile.sessionTypes?.videoCall && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">🎥 Video Call</span>
                            )}
                        </div>
                    </div>

                    {/* Trust Statement */}
                    {profile.trustStatement && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Trust Statement</h3>
                            <p className="text-gray-600 text-sm italic">"{profile.trustStatement}"</p>
                        </div>
                    )}

                    {/* LinkedIn */}
                    {profile.linkedinUrl && (
                        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline">
                            <Globe size={14} /> View LinkedIn Profile
                        </a>
                    )}

                    {/* Action Buttons */}
                    {mentor.mentorVerificationStatus === 'pending' && (
                        <div className="pt-4 border-t border-gray-100 space-y-3">
                            {!showRejectForm ? (
                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleApprove}
                                        disabled={loading}
                                        className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-60"
                                    >
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                        Approve Mentor
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowRejectForm(true)}
                                        className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-200"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Reason for rejection (optional but helpful for mentor)..."
                                        rows={3}
                                        className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-red-400 outline-none text-sm resize-none"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowRejectForm(false)}
                                            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            disabled={loading}
                                            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold disabled:opacity-60"
                                        >
                                            {loading ? '...' : 'Confirm Rejection'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// ─── Main Component ─────────────────────────────────────────
const ManageMentors = () => {
    const [searchParams] = useSearchParams();
    const [mentors, setMentors] = useState([]);
    const [counts, setCounts] = useState({});
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'pending');
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchMentors();
    }, [activeTab, page]);

    const fetchMentors = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (activeTab !== 'all') params.status = activeTab;
            if (search) params.search = search;

            const res = await adminService.getMentors(params);
            setMentors(res.data.mentors);
            setCounts(res.data.counts || {});
            setPagination(res.data.pagination || {});
        } catch (err) {
            toast.error('Failed to load mentors');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (mentorId) => {
        try {
            await adminService.approveMentor(mentorId);
            toast.success('Mentor approved! 🎉');
            fetchMentors();
        } catch (err) {
            toast.error('Failed to approve mentor');
        }
    };

    const handleReject = async (mentorId, reason) => {
        try {
            await adminService.rejectMentor(mentorId, reason);
            toast.success('Mentor rejected');
            fetchMentors();
        } catch (err) {
            toast.error('Failed to reject mentor');
        }
    };

    const statusConfig = {
        pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
        approved: { label: 'Approved', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
        rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50 border-red-200' }
    };

    const tabs = [
        { id: 'pending', label: 'Pending', count: counts.pending },
        { id: 'approved', label: 'Approved', count: counts.approved },
        { id: 'rejected', label: 'Rejected', count: counts.rejected }
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Mentors</h1>
                        <p className="text-gray-500 text-sm mt-1">Verify and manage mentor accounts</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchMentors()}
                            placeholder="Search mentors..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-sm"
                        />
                    </div>
                    <button
                        onClick={fetchMentors}
                        className="px-4 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all"
                    >
                        Search
                    </button>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={32} className="animate-spin text-slate-500" />
                    </div>
                ) : mentors.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <GraduationCap size={36} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 font-medium">No mentors found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mentor</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expertise</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {mentors.map(mentor => {
                                        const config = statusConfig[mentor.mentorVerificationStatus] || statusConfig.pending;
                                        const profile = mentor.mentorProfile || {};
                                        return (
                                            <tr key={mentor._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                            <span className="text-white text-sm font-bold">
                                                                {mentor.fullName?.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">{mentor.fullName}</p>
                                                            <p className="text-gray-500 text-xs">{mentor.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {profile.primaryExpertise?.slice(0, 2).map(exp => (
                                                            <span key={exp} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs">
                                                                {exp}
                                                            </span>
                                                        ))}
                                                        {!profile.primaryExpertise?.length && (
                                                            <span className="text-gray-400 text-xs">No profile</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.color}`}>
                                                        {config.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-500 text-xs">
                                                        {new Date(mentor.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setSelectedMentor(mentor)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all"
                                                        >
                                                            <Eye size={12} /> Review
                                                        </button>

                                                        {/* ✅ NEW: Deactivate/Activate Button */}
                                                        {mentor.mentorVerificationStatus === 'approved' && (
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await adminService.toggleMentorStatus(mentor._id);
                                                                        toast.success(mentor.isActive ? 'Mentor deactivated' : 'Mentor activated');
                                                                        fetchMentors();
                                                                    } catch (error) {
                                                                        toast.error('Failed to update status');
                                                                    }
                                                                }}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mentor.isActive
                                                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                    }`}
                                                            >
                                                                {mentor.isActive ? '⊗ Deactivate' : '✓ Activate'}
                                                            </button>
                                                        )}

                                                        {mentor.mentorVerificationStatus === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(mentor._id)}
                                                                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200"
                                                                >
                                                                    ✓ Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => setSelectedMentor(mentor)}
                                                                    className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200"
                                                                >
                                                                    ✗ Reject
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
                                {[...Array(pagination.pages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${page === i + 1
                                            ? 'bg-slate-700 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mentor Detail Modal */}
            {selectedMentor && (
                <MentorDetailModal
                    mentor={selectedMentor}
                    onClose={() => setSelectedMentor(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </AdminLayout>
    );
};

export default ManageMentors;