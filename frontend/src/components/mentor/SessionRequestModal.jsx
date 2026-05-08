import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Video, Calendar, Clock, Send, Loader2 } from 'lucide-react';
import mentorService from '../../services/mentorService';
import toast from 'react-hot-toast';

const SessionRequestModal = ({ mentor, availableSlots, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: type, 2: details
    const [sessionType, setSessionType] = useState('');
    const [bookingMode, setBookingMode] = useState('request'); // 'request' | 'slot'
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [form, setForm] = useState({ topic: '', message: '' });
    const [loading, setLoading] = useState(false);

    const profile = mentor.mentorProfile || {};

    const handleSubmit = async () => {
        if (!form.topic.trim()) {
            toast.error('Please enter a topic');
            return;
        }

        setLoading(true);
        try {
            if (bookingMode === 'slot' && selectedSlot) {
                await mentorService.bookSlot(selectedSlot._id, {
                    type: sessionType,
                    topic: form.topic,
                    message: form.message
                });
            } else {
                await mentorService.requestSession(mentor._id, {
                    type: sessionType,
                    topic: form.topic,
                    message: form.message
                });
            }
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to request session');
        } finally {
            setLoading(false);
        }
    };

    const filteredSlots = availableSlots.filter(slot =>
        slot.sessionType === 'both' ||
        slot.sessionType === sessionType
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-white font-bold text-xl">Book a Session</h2>
                                <p className="text-white/80 text-sm">with {mentor.fullName}</p>
                            </div>
                            <button onClick={onClose} className="text-white/80 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Step indicator */}
                        <div className="flex gap-2 mt-4">
                            {[1, 2].map(s => (
                                <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${step >= s ? 'bg-white' : 'bg-white/30'}`} />
                            ))}
                        </div>
                    </div>

                    <div className="p-6">
                        <AnimatePresence mode="wait">

                            {/* STEP 1: Choose Session Type */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <h3 className="font-bold text-gray-900 mb-4">
                                        Choose Session Type
                                    </h3>

                                    <div className="grid grid-cols-2 gap-3">
                                        {profile.sessionTypes?.qa && (
                                            <button
                                                onClick={() => setSessionType('qa')}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all ${sessionType === 'qa'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-2">💬</div>
                                                <p className="font-bold text-gray-900 text-sm">Q&A Session</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    Text-based questions & answers
                                                </p>
                                            </button>
                                        )}

                                        {profile.sessionTypes?.videoCall && (
                                            <button
                                                onClick={() => setSessionType('video_call')}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all ${sessionType === 'video_call'
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:border-purple-300'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-2">🎥</div>
                                                <p className="font-bold text-gray-900 text-sm">Video Call</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    Live call via Jitsi Meet
                                                </p>
                                            </button>
                                        )}
                                    </div>

                                    {/* Booking Mode */}
                                    {sessionType && filteredSlots.length > 0 && (
                                        <div className="pt-2">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                                How do you want to book?
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setBookingMode('slot')}
                                                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${bookingMode === 'slot'
                                                        ? 'border-green-500 bg-green-50 text-green-700'
                                                        : 'border-gray-200 text-gray-600'
                                                        }`}
                                                >
                                                    📅 Pick a Slot
                                                </button>
                                                <button
                                                    onClick={() => setBookingMode('request')}
                                                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${bookingMode === 'request'
                                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                        : 'border-gray-200 text-gray-600'
                                                        }`}
                                                >
                                                    📨 Send Request
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Slot Picker */}
                                    {sessionType && bookingMode === 'slot' && filteredSlots.length > 0 && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                                Select a slot:
                                            </p>
                                            <div className="space-y-2 max-h-36 overflow-y-auto">
                                                {filteredSlots.map(slot => (
                                                    <button
                                                        key={slot._id}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedSlot?._id === slot._id
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'border-gray-200 hover:border-green-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="text-gray-500" />
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {new Date(slot.date).toLocaleDateString('en-US', {
                                                                    weekday: 'short', month: 'short', day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                                                            <Clock size={12} />
                                                            {slot.startTime}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            if (!sessionType) { toast.error('Select a session type'); return; }
                                            if (bookingMode === 'slot' && !selectedSlot) { toast.error('Select a slot'); return; }
                                            setStep(2);
                                        }}
                                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold"
                                    >
                                        Continue →
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* STEP 2: Details */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                                        {sessionType === 'qa'
                                            ? <MessageSquare size={16} className="text-blue-600" />
                                            : <Video size={16} className="text-purple-600" />
                                        }
                                        <span className="text-sm font-semibold text-gray-700">
                                            {sessionType === 'qa' ? 'Q&A Session' : 'Video Call'}
                                            {selectedSlot && ` · ${new Date(selectedSlot.date).toLocaleDateString()} ${selectedSlot.startTime}`}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Session Topic *
                                        </label>
                                        <input
                                            type="text"
                                            value={form.topic}
                                            onChange={(e) => setForm(p => ({ ...p, topic: e.target.value }))}
                                            placeholder="e.g., How to start an e-commerce business with ₹5000"
                                            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Message to Mentor (optional)
                                        </label>
                                        <textarea
                                            value={form.message}
                                            onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                                            placeholder="Tell the mentor about yourself and what you hope to gain..."
                                            rows={3}
                                            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none transition-all text-gray-900 placeholder-gray-400 text-sm resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold"
                                        >
                                            ← Back
                                        </button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="flex-[2] py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                                        >
                                            {loading ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Send size={16} />
                                            )}
                                            {loading ? 'Sending...' : 'Send Request'}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SessionRequestModal;