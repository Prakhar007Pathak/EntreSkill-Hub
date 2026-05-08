import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Star, Users, Video,
    MessageSquare, MapPin, X, SlidersHorizontal,
    GraduationCap, ChevronRight, Loader2
} from 'lucide-react';
import mentorService from '../services/mentorService';
import Navbar from '../components/dashboard/Navbar';
import MentorCard from '../components/mentor/MentorCard';
import toast from 'react-hot-toast';

const MentorDirectory = () => {
    const navigate = useNavigate();
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        search: '',
        expertise: '',
        industry: '',
        language: '',
        sessionType: '',
        page: 1
    });

    const expertiseOptions = [
        'Digital Marketing', 'Web Development', 'E-commerce',
        'Business Strategy', 'Finance & Accounting', 'Sales & CRM',
        'Product Management', 'UI/UX Design', 'Data Science & AI',
        'Content Creation', 'Social Media', 'SaaS'
    ];

    const industryOptions = [
        'Technology', 'E-commerce', 'Healthcare', 'Finance',
        'Education', 'Marketing', 'Manufacturing', 'Real Estate',
        'Food & Beverage', 'Consulting', 'SaaS'
    ];

    useEffect(() => {
        fetchMentors();
    }, [filters.page, filters.expertise, filters.industry,
    filters.language, filters.sessionType]);

    const fetchMentors = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.expertise) params.expertise = filters.expertise;
            if (filters.industry) params.industry = filters.industry;
            if (filters.language) params.language = filters.language;
            if (filters.sessionType) params.sessionType = filters.sessionType;
            params.page = filters.page;
            params.limit = 12;

            const res = await mentorService.getMentors(params);
            setMentors(res.data.mentors);
            setPagination(res.data.pagination);
        } catch (err) {
            toast.error('Failed to load mentors');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchMentors();
    };

    const clearFilter = (key) => {
        setFilters(prev => ({ ...prev, [key]: '', page: 1 }));
    };

    const activeFilters = [
        filters.expertise && { key: 'expertise', label: filters.expertise },
        filters.industry && { key: 'industry', label: filters.industry },
        filters.sessionType && {
            key: 'sessionType',
            label: filters.sessionType === 'qa' ? 'Q&A Sessions' : 'Video Calls'
        },
        filters.language && { key: 'language', label: filters.language }
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <GraduationCap size={20} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Find Your Mentor
                        </h1>
                    </div>
                    <p className="text-gray-600 ml-13">
                        Connect with verified experts to accelerate your entrepreneurship journey
                    </p>
                </motion.div>

                {/* Search + Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
                >
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                placeholder="Search by name, skills, expertise..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 rounded-xl border-2 font-semibold flex items-center gap-2 transition-all ${showFilters
                                ? 'border-purple-500 text-purple-600 bg-purple-50'
                                : 'border-gray-200 text-gray-600 hover:border-purple-400'
                                }`}
                        >
                            <SlidersHorizontal size={18} />
                            Filters
                            {activeFilters.length > 0 && (
                                <span className="w-5 h-5 bg-purple-500 text-white rounded-full text-xs flex items-center justify-center">
                                    {activeFilters.length}
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Expanded Filters */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3"
                            >
                                {/* Expertise Filter */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                                        Expertise
                                    </label>
                                    <select
                                        value={filters.expertise}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev, expertise: e.target.value, page: 1
                                        }))}
                                        className="w-full p-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-sm text-gray-700"
                                    >
                                        <option value="">All Expertise</option>
                                        {expertiseOptions.map(exp => (
                                            <option key={exp} value={exp}>{exp}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Industry Filter */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                                        Industry
                                    </label>
                                    <select
                                        value={filters.industry}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev, industry: e.target.value, page: 1
                                        }))}
                                        className="w-full p-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-sm text-gray-700"
                                    >
                                        <option value="">All Industries</option>
                                        {industryOptions.map(ind => (
                                            <option key={ind} value={ind}>{ind}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Session Type Filter */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                                        Session Type
                                    </label>
                                    <select
                                        value={filters.sessionType}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev, sessionType: e.target.value, page: 1
                                        }))}
                                        className="w-full p-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-sm text-gray-700"
                                    >
                                        <option value="">All Types</option>
                                        <option value="qa">Q&A Sessions</option>
                                        <option value="video_call">Video Calls</option>
                                    </select>
                                </div>

                                {/* Language Filter */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                                        Language
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.language}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev, language: e.target.value, page: 1
                                        }))}
                                        placeholder="e.g., English"
                                        className="w-full p-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-sm text-gray-700"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Active Filters */}
                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {activeFilters.map(filter => (
                                <span
                                    key={filter.key}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                                >
                                    {filter.label}
                                    <button onClick={() => clearFilter(filter.key)}>
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                            <button
                                onClick={() => setFilters({
                                    search: '', expertise: '', industry: '',
                                    language: '', sessionType: '', page: 1
                                })}
                                className="text-sm text-gray-500 hover:text-red-500 font-medium"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Results Count */}
                {!loading && (
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-600 text-sm">
                            Showing <span className="font-semibold text-gray-900">
                                {mentors.length}
                            </span> of <span className="font-semibold text-gray-900">
                                {pagination.total || 0}
                            </span> mentors
                        </p>
                    </div>
                )}

                {/* Mentors Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-5/6" />
                            </div>
                        ))}
                    </div>
                ) : mentors.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <GraduationCap size={36} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No mentors found</h3>
                        <p className="text-gray-500 mb-6">
                            Try adjusting your filters or search terms
                        </p>
                        <button
                            onClick={() => setFilters({
                                search: '', expertise: '', industry: '',
                                language: '', sessionType: '', page: 1
                            })}
                            className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold"
                        >
                            Clear Filters
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {mentors.map((mentor, index) => (
                            <MentorCard
                                key={mentor._id}
                                mentor={mentor}
                                index={index}
                                onClick={() => navigate(`/mentors/${mentor.mentorSlug}`)}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {[...Array(pagination.pages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                                className={`w-10 h-10 rounded-xl font-semibold transition-all ${filters.page === i + 1
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-400'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentorDirectory;