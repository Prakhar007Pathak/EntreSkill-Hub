import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Upload, FileText, Video,
    CheckSquare, BookOpen, Plus, X,
    Loader2, Tag, Link as LinkIcon
} from 'lucide-react';
import mentorService from '../services/mentorService';
import toast from 'react-hot-toast';

// ─── Tag Input ─────────────────────────────────────────────
const TagInput = ({ label, tags, onAdd, onRemove, placeholder }) => {
    const [input, setInput] = useState('');
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
            </label>
            <div className="border-2 border-gray-200 focus-within:border-purple-500 rounded-xl p-3 transition-all">
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, i) => (
                        <span
                            key={i}
                            className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => onRemove(i)}
                                className="hover:text-purple-900 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
                            e.preventDefault();
                            onAdd(input.trim());
                            setInput('');
                        }
                    }}
                    placeholder={placeholder || 'Type and press Enter...'}
                    className="w-full outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent"
                />
            </div>
            <p className="text-xs text-gray-400 mt-1">
                Press Enter or comma to add
            </p>
        </div>
    );
};

// ─── Checklist Builder ─────────────────────────────────────
const ChecklistBuilder = ({ items, onChange }) => {
    const [newItem, setNewItem] = useState('');

    const addItem = () => {
        if (newItem.trim()) {
            onChange([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const removeItem = (index) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                Checklist Items *
            </label>
            <div className="space-y-2 mb-3">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200"
                    >
                        <div className="w-5 h-5 rounded border-2 border-purple-400 flex-shrink-0" />
                        <span className="flex-1 text-sm text-gray-700">{item}</span>
                        <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
                {items.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">
                        No items yet. Add at least 3 items below.
                    </p>
                )}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addItem();
                        }
                    }}
                    placeholder="Add checklist item..."
                    className="flex-1 p-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-sm"
                />
                <button
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
};

// ─── YouTube URL Helper ────────────────────────────────────
const extractYoutubeId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

// ─── Main Component ─────────────────────────────────────────
const MentorUploadResource = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        type: '',
        title: '',
        description: '',
        category: '',
        level: 'Beginner',
        duration: '',
        thumbnail: '',
        resourceUrl: '',
        content: '',
        checklistItems: [],
        tags: [],
        estimatedPoints: 10
    });

    const [youtubePreview, setYoutubePreview] = useState('');

    const resourceTypes = [
        {
            id: 'article',
            label: 'Article',
            icon: FileText,
            color: 'from-blue-500 to-cyan-500',
            desc: 'Write a detailed article with markdown content'
        },
        {
            id: 'video',
            label: 'Video',
            icon: Video,
            color: 'from-red-500 to-pink-500',
            desc: 'Share a YouTube video with description'
        },
        {
            id: 'checklist',
            label: 'Checklist',
            icon: CheckSquare,
            color: 'from-green-500 to-emerald-500',
            desc: 'Create an actionable step-by-step checklist'
        },
        {
            id: 'guide',
            label: 'Guide',
            icon: BookOpen,
            color: 'from-purple-500 to-violet-500',
            desc: 'Write a comprehensive how-to guide'
        }
    ];

    const categories = [
        'Business Basics', 'Marketing', 'Finance', 'Legal',
        'Technology', 'Sales', 'Operations', 'Mindset'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // YouTube URL preview
        if (name === 'resourceUrl' && form.type === 'video') {
            const ytId = extractYoutubeId(value);
            setYoutubePreview(
                ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : ''
            );
        }
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            + '-' + Math.random().toString(36).substring(2, 6);
    };

    const validateForm = () => {
        if (!form.type) {
            toast.error('Please select a resource type');
            return false;
        }
        if (!form.title || form.title.length < 5) {
            toast.error('Title must be at least 5 characters');
            return false;
        }
        if (!form.description) {
            toast.error('Description is required');
            return false;
        }
        if (!form.category) {
            toast.error('Please select a category');
            return false;
        }
        if (form.type === 'video') {
            if (!form.resourceUrl) {
                toast.error('YouTube URL is required');
                return false;
            }
            if (!extractYoutubeId(form.resourceUrl)) {
                toast.error('Please enter a valid YouTube URL');
                return false;
            }
        }
        if ((form.type === 'article' || form.type === 'guide') && !form.content) {
            toast.error('Content is required for articles and guides');
            return false;
        }
        if (form.type === 'checklist' && form.checklistItems.length < 3) {
            toast.error('Please add at least 3 checklist items');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const slug = generateSlug(form.title);

            let thumbnail = form.thumbnail;
            if (form.type === 'video' && !thumbnail && youtubePreview) {
                thumbnail = youtubePreview;
            }

            const resourceData = {
                ...form,
                slug,
                thumbnail: thumbnail ||
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
                estimatedPoints: Number(form.estimatedPoints) || 10
            };

            await mentorService.uploadResource(resourceData);
            toast.success('Resource uploaded! Pending admin approval 🎉');
            setTimeout(() => navigate('/mentor/dashboard'), 1500);
        } catch (err) {
            toast.error(
                err.response?.data?.message || 'Failed to upload resource'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/mentor/dashboard')}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Upload size={16} className="text-white" />
                        </div>
                        <h1 className="font-bold text-gray-900">Upload Resource</h1>
                    </div>
                    <div className="ml-auto">
                        <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-medium">
                            Pending Admin Approval after upload
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* STEP 1: Choose Type */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center font-bold">
                                1
                            </span>
                            Resource Type *
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {resourceTypes.map(type => (
                                <motion.button
                                    key={type.id}
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setForm(prev => ({
                                        ...prev,
                                        type: type.id,
                                        resourceUrl: '',
                                        content: '',
                                        checklistItems: []
                                    }))}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${form.type === type.id
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                >
                                    <div className={`w-10 h-10 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center mb-3`}>
                                        <type.icon size={20} className="text-white" />
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm">{type.label}</p>
                                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                        {type.desc}
                                    </p>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* STEP 2: Basic Info */}
                    <AnimatePresence>
                        {form.type && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
                            >
                                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center font-bold">
                                        2
                                    </span>
                                    Basic Information
                                </h2>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder={
                                            form.type === 'video'
                                                ? 'e.g., How to Start an E-commerce Store'
                                                : form.type === 'checklist'
                                                    ? 'e.g., Business Launch Checklist'
                                                    : 'e.g., Complete Guide to Digital Marketing'
                                        }
                                        className="w-full p-3.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Briefly describe what learners will gain from this resource..."
                                        className="w-full p-3.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none transition-all text-gray-900 placeholder-gray-400 resize-none"
                                    />
                                </div>

                                {/* Category + Level + Duration */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Category *
                                        </label>
                                        <select
                                            name="category"
                                            value={form.category}
                                            onChange={handleChange}
                                            className="w-full p-3.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none transition-all text-gray-700 bg-white"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Level
                                        </label>
                                        <select
                                            name="level"
                                            value={form.level}
                                            onChange={handleChange}
                                            className="w-full p-3.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none transition-all text-gray-700 bg-white"
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Duration
                                        </label>
                                        <input
                                            type="text"
                                            name="duration"
                                            value={form.duration}
                                            onChange={handleChange}
                                            placeholder="e.g., 15 min, 2 hours"
                                            className="w-full p-3.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Thumbnail */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Thumbnail URL (optional)
                                    </label>
                                    <input
                                        type="url"
                                        name="thumbnail"
                                        value={form.thumbnail}
                                        onChange={handleChange}
                                        placeholder="https://example.com/thumbnail.jpg"
                                        className="w-full p-3.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                    {form.type === 'video' && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            💡 YouTube thumbnail will be auto-used if not provided
                                        </p>
                                    )}
                                </div>

                                {/* Tags */}
                                <TagInput
                                    label="Tags"
                                    tags={form.tags}
                                    onAdd={(val) => setForm(prev => ({
                                        ...prev,
                                        tags: prev.tags.includes(val)
                                            ? prev.tags
                                            : [...prev.tags, val]
                                    }))}
                                    onRemove={(i) => setForm(prev => ({
                                        ...prev,
                                        tags: prev.tags.filter((_, idx) => idx !== i)
                                    }))}
                                    placeholder="e.g., marketing, startup..."
                                />

                                {/* Points */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Completion Points
                                    </label>
                                    <input
                                        type="number"
                                        name="estimatedPoints"
                                        value={form.estimatedPoints}
                                        onChange={handleChange}
                                        min="5"
                                        max="100"
                                        className="w-32 p-3.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none transition-all text-gray-900"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Points users earn for completing this resource (5–100)
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* STEP 3: Type-specific Content */}
                    <AnimatePresence>
                        {form.type && form.title && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
                            >
                                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center font-bold">
                                        3
                                    </span>
                                    {form.type === 'video'
                                        ? 'Video Content'
                                        : form.type === 'checklist'
                                            ? 'Checklist Items'
                                            : 'Content'
                                    }
                                </h2>

                                {/* ── VIDEO ── */}
                                {form.type === 'video' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                YouTube URL *
                                            </label>
                                            <div className="relative">
                                                <LinkIcon
                                                    size={18}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400"
                                                />
                                                <input
                                                    type="url"
                                                    name="resourceUrl"
                                                    value={form.resourceUrl}
                                                    onChange={handleChange}
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Paste the full YouTube video URL
                                            </p>
                                        </div>

                                        {/* YouTube Preview */}
                                        {youtubePreview && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="rounded-xl overflow-hidden border-2 border-green-200"
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={youtubePreview}
                                                        alt="YouTube Preview"
                                                        className="w-full h-48 object-cover"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-xl">
                                                            <div className="w-0 h-0 border-l-[18px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                                        ✓ Valid YouTube URL
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Additional Notes / Description
                                            </label>
                                            <textarea
                                                name="content"
                                                value={form.content}
                                                onChange={handleChange}
                                                rows={4}
                                                placeholder="Add any notes, timestamps, key topics covered in the video..."
                                                className="w-full p-3.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none transition-all text-gray-900 placeholder-gray-400 resize-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ── ARTICLE or GUIDE ── */}
                                {(form.type === 'article' || form.type === 'guide') && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Content * (Markdown supported)
                                        </label>
                                        <div className="rounded-xl border-2 border-gray-200 focus-within:border-purple-500 transition-all overflow-hidden">
                                            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-3">
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Markdown Editor
                                                </span>
                                                <div className="flex gap-1 text-xs text-gray-400">
                                                    <span className="px-1.5 py-0.5 bg-gray-200 rounded font-mono">
                                                        # H1
                                                    </span>
                                                    <span className="px-1.5 py-0.5 bg-gray-200 rounded font-mono">
                                                        **bold**
                                                    </span>
                                                    <span className="px-1.5 py-0.5 bg-gray-200 rounded font-mono">
                                                        - list
                                                    </span>
                                                </div>
                                            </div>
                                            <textarea
                                                name="content"
                                                value={form.content}
                                                onChange={handleChange}
                                                rows={14}
                                                placeholder={`# ${form.type === 'article' ? 'Article' : 'Guide'} Title\n\n## Introduction\n\nStart writing your content here...\n\n## Section 1\n\nYour content...\n\n## Conclusion\n\nWrap up here...`}
                                                className="w-full p-4 outline-none font-mono text-sm text-gray-900 placeholder-gray-400 resize-none bg-white"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {form.content.length} characters
                                        </p>
                                    </div>
                                )}

                                {/* ── CHECKLIST ── */}
                                {form.type === 'checklist' && (
                                    <ChecklistBuilder
                                        items={form.checklistItems}
                                        onChange={(items) =>
                                            setForm(prev => ({
                                                ...prev,
                                                checklistItems: items
                                            }))
                                        }
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit Buttons */}
                    <AnimatePresence>
                        {form.type && form.title && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex gap-4"
                            >
                                <button
                                    type="button"
                                    onClick={() => navigate('/mentor/dashboard')}
                                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    className="flex-[2] py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {loading
                                        ? <Loader2 size={20} className="animate-spin" />
                                        : <Upload size={20} />
                                    }
                                    {loading ? 'Uploading...' : 'Submit for Approval'}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </form>
            </div>
        </div>
    );
};

export default MentorUploadResource;