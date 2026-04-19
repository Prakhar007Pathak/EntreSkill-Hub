import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Sparkles, TrendingUp, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import businessService from '../services/businessService';
import BusinessCard from '../components/business/BusinessCard';
import Navbar from '../components/dashboard/Navbar';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const BusinessExplorer = () => {
    const [businesses, setBusinesses] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        difficulty: '',
        marketDemand: '',
        minInvestment: '',
        maxInvestment: '',
        featured: false
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    });

    // Load dark mode preference
    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedMode);
        if (savedMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', newMode.toString());
    };

    // Fetch businesses
    useEffect(() => {
        fetchBusinesses();
    }, [filters, pagination.page]);

    // Fetch recommendations
    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchBusinesses = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (!params[key] && params[key] !== false) delete params[key];
            });

            const response = await businessService.getBusinesses(params);
            setBusinesses(response.data.businesses);
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination.total,
                pages: response.data.pagination.pages
            }));
        } catch (error) {
            toast.error('Failed to load businesses');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const response = await businessService.getRecommendations();
            setRecommendations(response.data.recommendations);
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchBusinesses();
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            difficulty: '',
            marketDemand: '',
            minInvestment: '',
            maxInvestment: '',
            featured: false
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleBookmark = async (businessId) => {
        try {
            await businessService.toggleBookmark(businessId);
            toast.success('Bookmark updated!');
            // Refresh businesses to update bookmark count
            fetchBusinesses();
        } catch (error) {
            toast.error('Failed to bookmark');
        }
    };

    const activeFiltersCount = Object.values(filters).filter(v => v && v !== '').length;

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

                {/* Navbar */}
                <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                            Explore Business Ideas 💡
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Discover {pagination.total}+ business opportunities tailored to your skills
                        </p>
                    </motion.div>

                    {/* Recommendations Section */}
                    {recommendations.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mb-8"
                        >
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <Sparkles size={28} />
                                    <div>
                                        <h2 className="text-2xl font-bold">Recommended for You</h2>
                                        <p className="text-sm opacity-90">Based on your profile and interests</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {recommendations.slice(0, 3).map((business, index) => (
                                        <Link key={business._id} to={`/business/${business.slug}`}>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.2 + index * 0.1 }}
                                                className="bg-white/10 backdrop-blur-xl rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer border border-white/20"
                                            >
                                                <div className="text-3xl mb-2">{business.icon}</div>
                                                <h3 className="font-bold mb-1 line-clamp-1">{business.title}</h3>
                                                <p className="text-sm opacity-90 line-clamp-2">{business.tagline}</p>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Search & Filter Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                    >
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Search businesses, skills, industries..."
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all text-gray-900 dark:text-white"
                                />
                            </form>

                            {/* Filter Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-500 transition-all flex items-center gap-2 relative"
                            >
                                <Filter size={20} />
                                Filters
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            {/* View Bookmarks */}
                            <Link to="/bookmarks">
                                <button className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center gap-2">
                                    <Bookmark size={20} />
                                    My Bookmarks
                                </button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                                        >
                                            Clear All
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Category
                                            </label>
                                            <select
                                                value={filters.category}
                                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                                className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-blue-500"
                                            >
                                                <option value="">All Categories</option>
                                                <option value="Technology">Technology</option>
                                                <option value="Service">Service</option>
                                                <option value="Digital">Digital</option>
                                                <option value="Creative">Creative</option>
                                                <option value="E-commerce">E-commerce</option>
                                                <option value="Consulting">Consulting</option>
                                            </select>
                                        </div>

                                        {/* Difficulty */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Difficulty
                                            </label>
                                            <select
                                                value={filters.difficulty}
                                                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                                                className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-blue-500"
                                            >
                                                <option value="">All Levels</option>
                                                <option value="Easy">Easy</option>
                                                <option value="Moderate">Moderate</option>
                                                <option value="Hard">Hard</option>
                                            </select>
                                        </div>

                                        {/* Market Demand */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Market Demand
                                            </label>
                                            <select
                                                value={filters.marketDemand}
                                                onChange={(e) => handleFilterChange('marketDemand', e.target.value)}
                                                className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-blue-500"
                                            >
                                                <option value="">All Demand</option>
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                                <option value="Trending">🔥 Trending</option>
                                            </select>
                                        </div>

                                        {/* Investment Range */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Max Investment
                                            </label>
                                            <select
                                                value={filters.maxInvestment}
                                                onChange={(e) => handleFilterChange('maxInvestment', e.target.value)}
                                                className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-blue-500"
                                            >
                                                <option value="">Any Budget</option>
                                                <option value="500">Under $500</option>
                                                <option value="1000">Under $1,000</option>
                                                <option value="2000">Under $2,000</option>
                                                <option value="5000">Under $5,000</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Featured Only Toggle */}
                                    <div className="mt-4">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.featured}
                                                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                ⭐ Show Featured Only
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results Count */}
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-gray-600 dark:text-gray-400">
                            Showing {businesses.length} of {pagination.total} businesses
                        </p>

                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-2"
                            >
                                <X size={16} />
                                Clear {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
                            </button>
                        )}
                    </div>

                    {/* Business Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <LoadingSkeleton key={i} className="h-96" />
                            ))}
                        </div>
                    ) : businesses.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16"
                        >
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                No businesses found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Try adjusting your filters or search terms
                            </p>
                            <button
                                onClick={clearFilters}
                                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all"
                            >
                                Clear Filters
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {businesses.map((business, index) => (
                                <Link key={business._id} to={`/business/${business.slug}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <BusinessCard
                                            business={business}
                                            onBookmark={handleBookmark}
                                            isBookmarked={false} // TODO: Check if bookmarked
                                        />
                                    </motion.div>
                                </Link>
                            ))}
                        </motion.div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 flex items-center justify-center gap-2"
                        >
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            {[...Array(pagination.pages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${pagination.page === i + 1
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                                disabled={pagination.page === pagination.pages}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessExplorer;