import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BookOpen, CheckCircle, XCircle, Star,
    Search, Loader2, FileText, Video,
    CheckSquare, Eye, X, ExternalLink
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const typeConfig = {
    article: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Article' },
    video: { icon: Video, color: 'text-red-600', bg: 'bg-red-100', label: 'Video' },
    checklist: { icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-100', label: 'Checklist' },
    guide: { icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Guide' }
};

// ─── Resource Preview Modal ─────────────────────────────────
const ResourcePreviewModal = ({ resource, onClose, onApprove, onReject, onFeature }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const typeInfo = typeConfig[resource.type] || typeConfig.article;
    const TypeIcon = typeInfo.icon;

    const handleApprove = async () => {
        setLoading(true);
        try {
            await onApprove(resource._id);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            await onReject(resource._id, rejectionReason);
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
                <div className="sticky top-0 bg-white border-b border-gray-100 p-5 rounded-t-3xl">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${typeInfo.bg} rounded-xl flex items-center justify-center`}>
                                <TypeIcon size={20} className={typeInfo.color} />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">{resource.title}</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-gray-500">{typeInfo.label}</span>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-xs text-gray-500">{resource.category}</span>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-xs text-gray-500">{resource.level}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {/* Uploader Info */}
                    {resource.uploadedBy && (
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                    {resource.uploadedBy.fullName?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {resource.uploadedBy.fullName}
                                </p>
                                <p className="text-xs text-gray-500">{resource.uploadedBy.email}</p>
                            </div>
                            <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                Mentor Upload
                            </span>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Description</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{resource.description}</p>
                    </div>

                    {/* Type-specific preview */}
                    {resource.type === 'video' && resource.resourceUrl && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Video</h3>
                            <a
                                href={resource.resourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-red-600 font-medium text-sm hover:underline"
                            >
                                <ExternalLink size={14} />
                                {resource.resourceUrl}
                            </a>
                            {resource.thumbnail && (
                                <img
                                    src={resource.thumbnail}
                                    alt="Thumbnail"
                                    className="w-full h-40 object-cover rounded-xl mt-2"
                                />
                            )}
                        </div>
                    )}

                    {(resource.type === 'article' || resource.type === 'guide') && resource.content && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Content Preview
                            </h3>
                            <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                                <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                                    {resource.content.substring(0, 500)}
                                    {resource.content.length > 500 && '...'}
                                </pre>
                            </div>
                        </div>
                    )}

                    {resource.type === 'checklist' && resource.checklistItems?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Checklist Items ({resource.checklistItems.length})
                            </h3>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {resource.checklistItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <div className="w-4 h-4 rounded border-2 border-green-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {resource.tags?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {resource.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {resource.status === 'pending' && (
                        <div className="pt-4 border-t border-gray-100 space-y-3">
                            {!showRejectForm ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleApprove}
                                        disabled={loading}
                                        className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-60"
                                    >
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                        Approve Resource
                                    </button>
                                    <button
                                        onClick={() => setShowRejectForm(true)}
                                        className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-200"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Reason for rejection..."
                                        rows={2}
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
                                            {loading ? '...' : 'Reject'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Feature Toggle for Approved */}
                    {resource.status === 'approved' && (
                        <button
                            onClick={() => onFeature(resource._id)}
                            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${resource.featured
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Star size={16} className={resource.featured ? 'fill-yellow-500 text-yellow-500' : ''} />
                            {resource.featured ? 'Remove from Featured' : 'Mark as Featured'}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// ─── Main Component ─────────────────────────────────────────
const ApproveResources = () => {
    const [searchParams] = useSearchParams();
    const [resources, setResources] = useState([]);
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedResource, setSelectedResource] = useState(null);
    const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'pending');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        fetchResources();
    }, [activeTab, page]);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (activeTab !== 'all') params.status = activeTab;

            const res = await adminService.getResources(params);
            setResources(res.data.resources);
            setCounts(res.data.counts || {});
            setPagination(res.data.pagination || {});
        } catch (err) {
            toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await adminService.approveResource(id);
            toast.success('Resource approved! ✅');
            fetchResources();
        } catch (err) {
            toast.error('Failed to approve resource');
        }
    };

    const handleReject = async (id, reason) => {
        try {
            await adminService.rejectResource(id, reason);
            toast.success('Resource rejected');
            fetchResources();
        } catch (err) {
            toast.error('Failed to reject resource');
        }
    };

    const handleFeature = async (id) => {
        try {
            const res = await adminService.toggleFeatured(id);
            toast.success(res.message);
            fetchResources();
            setSelectedResource(null);
        } catch (err) {
            toast.error('Failed to update resource');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this resource permanently?')) return;
        try {
            await adminService.deleteResource(id);
            toast.success('Resource deleted');
            fetchResources();
        } catch (err) {
            toast.error('Failed to delete resource');
        }
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Resources</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and approve mentor-uploaded resources</p>
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

                {/* Resources Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={32} className="animate-spin text-slate-500" />
                    </div>
                ) : resources.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <BookOpen size={36} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 font-medium">No resources found</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {resources.map(resource => {
                                const typeInfo = typeConfig[resource.type] || typeConfig.article;
                                const TypeIcon = typeInfo.icon;
                                return (
                                    <div
                                        key={resource._id}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative h-36 bg-gray-100">
                                            {resource.thumbnail ? (
                                                <img
                                                    src={resource.thumbnail}
                                                    alt={resource.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center ${typeInfo.bg}`}>
                                                    <TypeIcon size={32} className={typeInfo.color} />
                                                </div>
                                            )}
                                            {/* Status badge */}
                                            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${resource.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : resource.status === 'approved'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {resource.status}
                                            </div>
                                            {resource.featured && (
                                                <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                                    ⭐ Featured
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeInfo.bg} ${typeInfo.color}`}>
                                                    {typeInfo.label}
                                                </span>
                                                <span className="text-xs text-gray-500">{resource.category}</span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                                                {resource.title}
                                            </h3>
                                            <p className="text-gray-500 text-xs line-clamp-2 mb-3">
                                                {resource.description}
                                            </p>

                                            {resource.uploadedBy && (
                                                <p className="text-xs text-purple-600 font-medium mb-3">
                                                    by {resource.uploadedBy.fullName}
                                                </p>
                                            )}

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedResource(resource)}
                                                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 flex items-center justify-center gap-1"
                                                >
                                                    <Eye size={12} /> Review
                                                </button>
                                                {resource.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(resource._id)}
                                                            className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200"
                                                        >
                                                            ✓ Approve
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedResource(resource)}
                                                            className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200"
                                                        >
                                                            ✗ Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2">
                                {[...Array(pagination.pages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-9 h-9 rounded-lg text-sm font-semibold ${page === i + 1
                                            ? 'bg-slate-700 text-white'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedResource && (
                <ResourcePreviewModal
                    resource={selectedResource}
                    onClose={() => setSelectedResource(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onFeature={handleFeature}
                />
            )}
        </AdminLayout>
    );
};

export default ApproveResources;