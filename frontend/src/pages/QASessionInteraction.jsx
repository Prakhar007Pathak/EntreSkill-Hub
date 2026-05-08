import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, MessageSquare, Send, Loader2,
    Clock, Calendar, AlertCircle, CheckCircle,
    User, GraduationCap, Plus, ChevronDown
} from 'lucide-react';
import mentorService from '../services/mentorService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/dashboard/Navbar';
import toast from 'react-hot-toast';

// ─── Status Badge ──────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const config = {
        requested: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
        scheduled: { label: 'Active', class: 'bg-green-100 text-green-700 border-green-200' },
        completed: { label: 'Completed', class: 'bg-gray-100 text-gray-600 border-gray-200' },
        rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700 border-red-200' },
        cancelled: { label: 'Cancelled', class: 'bg-gray-100 text-gray-600 border-gray-200' }
    };
    const c = config[status] || config.requested;
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${c.class}`}>
            {c.label}
        </span>
    );
};

// ─── Q&A Item ──────────────────────────────────────────────
const QAItem = ({
    qa,
    index,
    isMentor,
    sessionStatus,
    userName,
    mentorName,
    onAnswer
}) => {
    const [showAnswerForm, setShowAnswerForm] = useState(false);
    const [answerText, setAnswerText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmitAnswer = async () => {
        if (!answerText.trim()) {
            toast.error('Answer cannot be empty');
            return;
        }
        setSubmitting(true);
        try {
            await onAnswer(index, answerText.trim());
            setAnswerText('');
            setShowAnswerForm(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
            {/* Question */}
            <div className="p-5">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-900">{userName}</span>
                            <span className="text-xs text-gray-400">asked</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                Q{index + 1}
                            </span>
                        </div>
                        <p className="text-gray-800 leading-relaxed">{qa.question}</p>
                    </div>
                </div>
            </div>

            {/* Answer or Answer Form */}
            {qa.answer ? (
                <div className="border-t border-gray-100 bg-gradient-to-br from-purple-50 to-blue-50 p-5">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <GraduationCap size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-gray-900">{mentorName}</span>
                                <span className="text-xs text-gray-400">answered</span>
                                <CheckCircle size={12} className="text-green-500" />
                            </div>
                            <p className="text-gray-800 leading-relaxed">{qa.answer}</p>
                            {qa.answeredAt && (
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <Clock size={10} />
                                    {new Date(qa.answeredAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border-t border-gray-100">
                    {/* Mentor: Show Answer Form */}
                    {isMentor && sessionStatus === 'scheduled' ? (
                        <div className="p-4">
                            {!showAnswerForm ? (
                                <button
                                    onClick={() => setShowAnswerForm(true)}
                                    className="flex items-center gap-2 text-sm text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                                >
                                    <Plus size={14} />
                                    Write an answer
                                </button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-3"
                                >
                                    <textarea
                                        value={answerText}
                                        onChange={(e) => setAnswerText(e.target.value)}
                                        placeholder="Type your answer here..."
                                        rows={3}
                                        autoFocus
                                        className="w-full p-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none text-sm resize-none bg-white"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setShowAnswerForm(false);
                                                setAnswerText('');
                                            }}
                                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSubmitAnswer}
                                            disabled={submitting}
                                            className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                                        >
                                            {submitting
                                                ? <Loader2 size={14} className="animate-spin" />
                                                : <Send size={14} />
                                            }
                                            {submitting ? 'Submitting...' : 'Submit Answer'}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        /* User: Waiting for answer */
                        <div className="px-5 py-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                            <p className="text-sm text-gray-400 italic">
                                Waiting for mentor's answer...
                            </p>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

// ─── Main Component ─────────────────────────────────────────
const QASessionInteraction = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user, isMentor } = useAuth();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState('');
    const [submittingQuestion, setSubmittingQuestion] = useState(false);
    const questionInputRef = useRef(null);

    useEffect(() => {
        fetchSession();
    }, [sessionId]);

    const fetchSession = async () => {
        setLoading(true);
        try {
            let res;
            if (isMentor) {
                res = await mentorService.getMentorSessions(sessionId);
            } else {
                res = await mentorService.getUserSessions(sessionId);
            }

            const fetchedSession = res.data.session;

            if (!fetchedSession) {
                toast.error('Session not found');
                navigate(isMentor ? '/mentor/dashboard' : '/my-sessions');
                return;
            }

            if (fetchedSession.type !== 'qa') {
                toast.error('This is not a Q&A session');
                navigate(isMentor ? '/mentor/dashboard' : '/my-sessions');
                return;
            }

            setSession(fetchedSession);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load session');
            navigate(isMentor ? '/mentor/dashboard' : '/my-sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async () => {
        if (!newQuestion.trim()) {
            toast.error('Please write a question first');
            return;
        }

        setSubmittingQuestion(true);
        try {
            await mentorService.addQuestion(sessionId, newQuestion.trim());
            toast.success('Question added! ✅');
            setNewQuestion('');
            fetchSession();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add question');
        } finally {
            setSubmittingQuestion(false);
        }
    };

    const handleAnswerQuestion = async (index, answer) => {
        try {
            await mentorService.answerQuestion(sessionId, index, answer);
            toast.success('Answer submitted! ✅');
            fetchSession();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit answer');
            throw err;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Loader2 size={36} className="animate-spin text-purple-500 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">Loading Q&A session...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) return null;

    const mentorData = session.mentorId;
    const userData = session.userId;
    const mentorName = mentorData?.fullName || 'Mentor';
    const userName = userData?.fullName || 'User';

    const answeredCount = session.questions?.filter(q => q.answer)?.length || 0;
    const totalCount = session.questions?.length || 0;
    const isActive = session.status === 'scheduled';

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

                {/* Back Button */}
                <button
                    onClick={() => navigate(isMentor ? '/mentor/dashboard' : '/my-sessions')}
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-600 font-medium mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to {isMentor ? 'Dashboard' : 'My Sessions'}
                </button>

                {/* Session Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                <MessageSquare size={24} className="text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {session.topic}
                                    </h1>
                                    <StatusBadge status={session.status} />
                                </div>
                                <p className="text-gray-500 text-sm">
                                    {isMentor
                                        ? `With ${userName}`
                                        : `With ${mentorName}`
                                    }
                                </p>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <MessageSquare size={11} />
                                        Q&A Session
                                    </span>
                                    {session.duration && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={11} />
                                            {session.duration} min
                                        </span>
                                    )}
                                    {session.scheduledAt && (
                                        <span className="flex items-center gap-1">
                                            <Calendar size={11} />
                                            {new Date(session.scheduledAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Progress */}
                        {totalCount > 0 && (
                            <div className="text-right flex-shrink-0">
                                <p className="text-2xl font-bold text-gray-900">
                                    {answeredCount}/{totalCount}
                                </p>
                                <p className="text-xs text-gray-500">answered</p>
                                <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1.5 ml-auto">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-600 rounded-full transition-all"
                                        style={{ width: `${totalCount > 0 ? (answeredCount / totalCount) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Warning */}
                    {!isActive && (
                        <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-700">
                                {session.status === 'completed'
                                    ? 'This session has been completed. You can view the Q&A history below.'
                                    : session.status === 'requested'
                                        ? 'This session is pending mentor approval. Q&A will be available once approved.'
                                        : 'This session is no longer active.'
                                }
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Q&A List */}
                <div className="space-y-4 mb-6">
                    {session.questions?.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm"
                        >
                            <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
                            <p className="font-semibold text-gray-600">No questions yet</p>
                            {!isMentor && isActive && (
                                <p className="text-sm text-gray-400 mt-1">
                                    Ask your first question below!
                                </p>
                            )}
                            {isMentor && isActive && (
                                <p className="text-sm text-gray-400 mt-1">
                                    Waiting for the user to ask questions.
                                </p>
                            )}
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {session.questions.map((qa, index) => (
                                <QAItem
                                    key={index}
                                    qa={qa}
                                    index={index}
                                    isMentor={isMentor}
                                    sessionStatus={session.status}
                                    userName={userName}
                                    mentorName={mentorName}
                                    onAnswer={handleAnswerQuestion}
                                />
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Ask New Question (User Only, Active Session) */}
                {!isMentor && isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border-2 border-purple-100 shadow-sm p-5"
                    >
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Plus size={18} className="text-purple-500" />
                            Ask a Question
                        </h3>
                        <textarea
                            ref={questionInputRef}
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                    handleAddQuestion();
                                }
                            }}
                            placeholder="Type your question here... (Ctrl+Enter to submit)"
                            rows={3}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-gray-900 placeholder-gray-400 resize-none transition-colors"
                        />
                        <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-gray-400">
                                {newQuestion.length}/500 characters
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddQuestion}
                                disabled={submittingQuestion || !newQuestion.trim()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submittingQuestion
                                    ? <Loader2 size={16} className="animate-spin" />
                                    : <Send size={16} />
                                }
                                {submittingQuestion ? 'Sending...' : 'Ask Question'}
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Mentor Info Banner when all answered */}
                {isMentor && isActive && totalCount > 0 && answeredCount === totalCount && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-center"
                    >
                        <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
                        <p className="font-semibold text-green-800">
                            All questions answered! 🎉
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                            Waiting for the user to ask more questions, or mark the session as complete from your dashboard.
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default QASessionInteraction;