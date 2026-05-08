import { useState, useEffect } from 'react';
import { Briefcase, Search, Loader2, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const ManageBusinesses = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        fetchBusinesses();
    }, [page]);

    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (search) params.search = search;
            const res = await adminService.getBusinesses(params);
            setBusinesses(res.data.businesses);
            setPagination(res.data.pagination || {});
        } catch (err) {
            toast.error('Failed to load businesses');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (businessId) => {
        try {
            const res = await adminService.toggleBusinessStatus(businessId);
            toast.success(res.message);
            fetchBusinesses();
        } catch (err) {
            toast.error('Failed to update business');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Businesses</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {pagination.total || 0} business ideas
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchBusinesses()}
                            placeholder="Search businesses..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-sm"
                        />
                    </div>
                    <button onClick={fetchBusinesses} className="px-4 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-semibold">
                        Search
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={32} className="animate-spin text-slate-500" />
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Business</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Investment</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {businesses.map(biz => (
                                    <tr key={biz._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
                                                    <Briefcase size={16} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{biz.title}</p>
                                                    <p className="text-gray-500 text-xs">{biz.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                                                {biz.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600 text-sm">
                                                {biz.investment?.min ? `₹${biz.investment.min?.toLocaleString()}` : '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${biz.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {biz.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggle(biz._id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${biz.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                            >
                                                {biz.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
                                {[...Array(pagination.pages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-9 h-9 rounded-lg text-sm font-semibold ${page === i + 1 ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ManageBusinesses;