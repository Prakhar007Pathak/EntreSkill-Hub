import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Star, MapPin, Calendar, Clock,
    Video, MessageSquare, Globe, ExternalLink,
    Loader2, Check, Plus, User
} from 'lucide-react';
import mentorService from '../services/mentorService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/dashboard/Navbar';
import toast from 'react-hot-toast';

const MentorPublicProfile = () => {
    const { mentorSlug } = useParams();
    const navigate = useNavigate();
    const { user, isMentor } = useAuth();
    const [mentor, setMentor] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingType, setBookingType] = useState('qa');
    const [bookingForm, setBookingForm] = useState({
        topic: '',
        message: '',
        preferredTimes: []
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMentor();
    }, [mentorSlug]);

    const fetchMentor = async () => {
        try {
            const res = await mentorService.getMentorBySlug(mentorSlug);
            setMentor(res.data.mentor);
            setIsConnected(res.data.isConnected);
            setAvailableSlots(res.data.availableSlots || []);
        } catch (err) {
            toast.error('Mentor not found');
            navigate('/mentors');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        if (isMentor && user?._id === mentor._id) {
            toast.error("You can't connect with yourself!");
            return;
        }

        setConnecting(true);
        try {
            const res = await mentorService.connectMentor(mentor._id);
            setIsConnected(res.data.isConnected);
            toast.success(res.message);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to connect');
        } finally {
            setConnecting(false);
        }
    };

    const handleRequestSession = async () => {
        if (!bookingForm.topic.trim()) {
            toast.error('Please enter a topic for the session');
            return;
        }

        setSubmitting(true);
        try {
            await mentorService.requestSession(mentor._id, {
                type: bookingType,
                topic: bookingForm.topic,
                message: bookingForm.message,
                preferredTimes: bookingForm.preferredTimes
            });
            toast.success('Session request sent! 🎉');
            setShowBookingModal(false);
            setBookingForm({ topic: '', message: '', preferredTimes: [] });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to request session');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBookSlot = async (slotId, type) => {
        if (!bookingForm.topic.trim()) {
            toast.error('Please enter a topic for the session');
            return;
        }

        setSubmitting(true);
        try {
            await mentorService.bookSlot(slotId, {
                type,
                topic: bookingForm.topic,
                message: bookingForm.message
            });
            toast.success('Slot booked successfully! 🎉');
            setShowBookingModal(false);
            fetchMentor(); // Refresh slots
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to book slot');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center pt-40">
                    <Loader2 size={32} className="animate-spin text-purple-500" />
                </div>
            </div>
        );
    }

    if (!mentor) return null;

    const profile = mentor.mentorProfile || {};

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/mentors')}
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-600 font-medium mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Mentors
                </button>

                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6"
                >
                    {/* Cover Gradient */}
                    <div className="h-32 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500" />

                    <div className="px-6 sm:px-8 pb-8">
                        {/* Avatar */}
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center border-4 border-white shadow-xl">
                                    {mentor.profilePicture ? (
                                        <img
                                            src={mentor.profilePicture}
                                            alt={mentor.fullName}
                                            className="w-full h-full rounded-2xl object-cover"
                                        />
                                    ) : (
                                        <span className="text-white text-3xl sm:text-4xl font-bold">
                                            {mentor.fullName?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-3 sm:mt-0 sm:mb-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        {mentor.fullName}
                                    </h1>
                                    <p className="text-gray-500 mt-0.5">{profile.headline}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4 sm:mt-0">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleConnect}
                                    disabled={connecting}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${isConnected
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : 'bg-purple-500 text-white hover:bg-purple-600 shadow-sm'
                                        }`}
                                >
                                    {connecting ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : isConnected ? (
                                        <Check size={16} />
                                    ) : (
                                        <Plus size={16} />
                                    )}
                                    {connecting
                                        ? '...'
                                        : isConnected
                                            ? 'Connected'
                                            : 'Connect'
                                    }
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowBookingModal(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold text-sm shadow-sm"
                                >
                                    <Calendar size={16} />
                                    Book Session
                                </motion.button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-100">
                            {profile.averageRating > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold text-gray-900">
                                        {profile.averageRating.toFixed(1)}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        ({profile.totalReviews} reviews)
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-gray-600">
                                <User size={16} className="text-gray-400" />
                                <span className="font-medium">{profile.totalMentees || 0}</span>
                                <span className="text-sm">mentees</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600">
                                <Calendar size={16} className="text-gray-400" />
                                <span className="font-medium">{profile.totalSessions || 0}</span>
                                <span className="text-sm">sessions</span>
                            </div>
                            {mentor.location?.city && (
                                <div className="flex items-center gap-1.5 text-gray-600">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span className="text-sm">
                                        {mentor.location.city}
                                        {mentor.location.country && `, ${mentor.location.country}`}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Session Types Offered */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {profile.sessionTypes?.qa && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                                    <MessageSquare size={12} />
                                    Q&A Sessions
                                </span>
                            )}
                            {profile.sessionTypes?.videoCall && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold border border-purple-200">
                                    <Video size={12} />
                                    Video Calls
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Bio, Expertise, etc. */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio */}
                        {profile.bio && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                            >
                                <h2 className="font-bold text-gray-900 mb-3">About</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {profile.bio}
                                </p>
                            </motion.div>
                        )}

                        {/* Expertise */}
                        {profile.primaryExpertise?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                            >
                                <h2 className="font-bold text-gray-900 mb-3">Areas of Expertise</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.primaryExpertise.map((exp, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                                        >
                                            {exp}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Skills */}
                        {profile.skills?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                            >
                                <h2 className="font-bold text-gray-900 mb-3">Skills</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Industries */}
                        {profile.industries?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                            >
                                <h2 className="font-bold text-gray-900 mb-3">Industries</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.industries.map((ind, i) => (
                                        <span
                                            key={i}
                                            className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                                        >
                                            {ind}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Trust Statement */}
                        {profile.trustStatement && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-6"
                            >
                                <p className="text-gray-700 italic">"{profile.trustStatement}"</p>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column: Availability, Links */}
                    <div className="space-y-6">
                        {/* Availability Slots */}
                        {availableSlots.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                            >
                                <h2 className="font-bold text-gray-900 mb-3">Available Slots</h2>
                                <div className="space-y-2">
                                    {availableSlots.slice(0, 5).map((slot, i) => (
                                        <div
                                            key={slot._id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {new Date(slot.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {slot.startTime} - {slot.endTime}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setBookingForm(p => ({ ...p, topic: p.topic || 'General Session' }));
                                                    handleBookSlot(slot._id, slot.sessionType === 'both' ? 'qa' : slot.sessionType);
                                                }}
                                                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-200 transition-all"
                                            >
                                                Book
                                            </button>
                                        </div>
                                    ))}
                                    {availableSlots.length > 5 && (
                                        <button
                                            onClick={() => setShowBookingModal(true)}
                                            className="w-full py-2 text-purple-600 text-sm font-medium hover:underline"
                                        >
                                            View all {availableSlots.length} slots →
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Languages */}
                        {profile.languages?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                            >
                                <h2 className="font-bold text-gray-900 mb-3">Languages</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.languages.map((lang, i) => (
                                        <span
                                            key={i}
                                            className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                                        >
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Links */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                        >
                            <h2 className="font-bold text-gray-900 mb-3">Links</h2>
                            <div className="space-y-2">
                                {profile.linkedinUrl && (
                                    <a
                                        href={profile.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                                    >
                                        <ExternalLink size={14} />
                                        LinkedIn Profile
                                    </a>
                                )}
                                {profile.websiteUrl && (
                                    <a
                                        href={profile.websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors"
                                    >
                                        <Globe size={14} />
                                        Personal Website
                                    </a>
                                )}
                                {!profile.linkedinUrl && !profile.websiteUrl && (
                                    <p className="text-gray-400 text-sm">No links provided</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowBookingModal(false)}
                    />
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Request a Session
                        </h3>

                        {/* Session Type Toggle */}
                        <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-xl">
                            {profile.sessionTypes?.qa && (
                                <button
                                    onClick={() => setBookingType('qa')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${bookingType === 'qa'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <MessageSquare size={14} />
                                    Q&A Session
                                </button>
                            )}
                            {profile.sessionTypes?.videoCall && (
                                <button
                                    onClick={() => setBookingType('video_call')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${bookingType === 'video_call'
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Video size={14} />
                                    Video Call
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Topic *
                                </label>
                                <input
                                    type="text"
                                    value={bookingForm.topic}
                                    onChange={(e) =>
                                        setBookingForm(p => ({ ...p, topic: e.target.value }))
                                    }
                                    placeholder="What would you like to discuss?"
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Message (optional)
                                </label>
                                <textarea
                                    value={bookingForm.message}
                                    onChange={(e) =>
                                        setBookingForm(p => ({ ...p, message: e.target.value }))
                                    }
                                    placeholder="Any additional details..."
                                    rows={3}
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-sm resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold"
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleRequestSession}
                                disabled={submitting}
                                className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-60"
                            >
                                {submitting ? 'Sending...' : 'Send Request'}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default MentorPublicProfile;