import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    Clock,
    FileText,
    Video,
    Link as LinkIcon,
    CheckSquare,
    Award,
    Target,
    Flag,
    Sparkles,
    Plus,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import roadmapService from '../services/roadmapService';
import Navbar from '../components/dashboard/Navbar';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const RoadmapView = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [roadmap, setRoadmap] = useState(null);
    const [userProgress, setUserProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [expandedStages, setExpandedStages] = useState([1]); // First stage expanded by default
    const [noteText, setNoteText] = useState('');
    const [addingNoteToStage, setAddingNoteToStage] = useState(null);

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

    useEffect(() => {
        fetchRoadmap();
    }, [slug]);

    const fetchRoadmap = async () => {
        try {
            setLoading(true);
            const response = await roadmapService.getRoadmap(slug);
            setRoadmap(response.data.roadmap);
            setUserProgress(response.data.userProgress);
        } catch (error) {
            toast.error('Roadmap not found');
            navigate('/businesses');
        } finally {
            setLoading(false);
        }
    };

    const handleStartRoadmap = async () => {
        try {
            const response = await roadmapService.startRoadmap(roadmap._id);
            setUserProgress(response.data.userProgress);
            toast.success('Roadmap started! Good luck! 🚀');
        } catch (error) {
            toast.error('Failed to start roadmap');
        }
    };

    const handleCompleteTask = async (taskId) => {
        try {
            const response = await roadmapService.completeTask(roadmap._id, taskId);
            setUserProgress(response.data.userProgress);

            // Confetti!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            toast.success('Task completed! +15 points 🎉');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete task');
        }
    };

    const handleAddNote = async (stageNumber) => {
        if (!noteText.trim()) return;

        try {
            const response = await roadmapService.addNote(roadmap._id, stageNumber, noteText);
            setUserProgress(response.data.userProgress);
            setNoteText('');
            setAddingNoteToStage(null);
            toast.success('Note added!');
        } catch (error) {
            toast.error('Failed to add note');
        }
    };

    const toggleStage = (stageNumber) => {
        setExpandedStages(prev =>
            prev.includes(stageNumber)
                ? prev.filter(s => s !== stageNumber)
                : [...prev, stageNumber]
        );
    };

    const isTaskCompleted = (taskId) => {
        if (!userProgress) return false;
        return userProgress.completedTasks.some(t => t.taskId === taskId);
    };

    const getStageProgress = (stage) => {
        if (!userProgress) return 0;
        const stageTasks = stage.tasks;
        const completedInStage = stageTasks.filter(task =>
            isTaskCompleted(task._id)
        ).length;
        return Math.round((completedInStage / stageTasks.length) * 100);
    };

    const getTaskIcon = (type) => {
        switch (type) {
            case 'checklist': return CheckSquare;
            case 'video': return Video;
            case 'document': return FileText;
            case 'link': return LinkIcon;
            default: return Circle;
        }
    };

    if (loading) {
        return (
            <div className={darkMode ? 'dark' : ''}>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                    <div className="max-w-6xl mx-auto px-4 py-8">
                        <LoadingSkeleton className="h-96" />
                    </div>
                </div>
            </div>
        );
    }

    if (!roadmap) return null;

    const totalTasks = roadmap.stages.reduce((sum, stage) => sum + stage.tasks.length, 0);
    const completedTasks = userProgress?.completedTasks.length || 0;
    const overallProgress = userProgress?.overallProgress || 0;

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate(`/business/${slug}`)}
                        className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Business Details
                    </motion.button>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden"
                    >
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Target size={32} />
                                <h1 className="text-3xl md:text-4xl font-heading font-bold">
                                    {roadmap.title}
                                </h1>
                            </div>
                            <p className="text-lg opacity-90 mb-6">
                                {roadmap.description}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white/20 backdrop-blur-xl rounded-xl p-4">
                                    <Clock size={20} className="mb-2" />
                                    <p className="text-sm opacity-90">Duration</p>
                                    <p className="text-lg font-bold">{roadmap.totalDuration}</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-xl rounded-xl p-4">
                                    <Flag size={20} className="mb-2" />
                                    <p className="text-sm opacity-90">Stages</p>
                                    <p className="text-lg font-bold">{roadmap.stages.length}</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-xl rounded-xl p-4">
                                    <CheckSquare size={20} className="mb-2" />
                                    <p className="text-sm opacity-90">Tasks</p>
                                    <p className="text-lg font-bold">{totalTasks}</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-xl rounded-xl p-4">
                                    <Sparkles size={20} className="mb-2" />
                                    <p className="text-sm opacity-90">Progress</p>
                                    <p className="text-lg font-bold">{overallProgress}%</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {userProgress && (
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Your Progress</span>
                                        <span>{completedTasks} / {totalTasks} tasks</span>
                                    </div>
                                    <div className="bg-white/20 rounded-full h-4 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${overallProgress}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="bg-white h-full rounded-full"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Start Button */}
                            {!userProgress && (
                                <button
                                    onClick={handleStartRoadmap}
                                    className="mt-6 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
                                >
                                    <Flag size={24} />
                                    Start This Roadmap
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Prerequisites & Outcomes */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <CheckCircle2 className="text-blue-500" size={24} />
                                Prerequisites
                            </h3>
                            <ul className="space-y-2">
                                {roadmap.prerequisites.map((item, index) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                        <span className="text-blue-500 mt-1">✓</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Award className="text-purple-500" size={24} />
                                Expected Outcomes
                            </h3>
                            <ul className="space-y-2">
                                {roadmap.outcomes.map((item, index) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                        <span className="text-purple-500 mt-1">★</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    {/* Roadmap Stages */}
                    <div className="space-y-6">
                        {roadmap.stages.map((stage, stageIndex) => {
                            const isExpanded = expandedStages.includes(stage.stageNumber);
                            const stageProgress = getStageProgress(stage);
                            const Icon = getTaskIcon('checklist');

                            return (
                                <motion.div
                                    key={stage._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: stageIndex * 0.1 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                                >
                                    {/* Stage Header */}
                                    <button
                                        onClick={() => toggleStage(stage.stageNumber)}
                                        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="text-4xl">{stage.icon}</div>
                                            <div className="text-left flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-bold">
                                                        Stage {stage.stageNumber}
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {stage.duration}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                                    {stage.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                    {stage.description}
                                                </p>

                                                {/* Progress bar for stage */}
                                                {userProgress && (
                                                    <div className="mt-3 flex items-center gap-3">
                                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                            <div
                                                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                                                style={{ width: `${stageProgress}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                            {stageProgress}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ChevronDown size={24} className="text-gray-400" />
                                        </motion.div>
                                    </button>

                                    {/* Stage Tasks */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="border-t border-gray-200 dark:border-gray-700"
                                            >
                                                <div className="p-6 space-y-4">
                                                    {stage.tasks.map((task, taskIndex) => {
                                                        const TaskIcon = getTaskIcon(task.type);
                                                        const isCompleted = isTaskCompleted(task._id);

                                                        return (
                                                            <motion.div
                                                                key={task._id}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: taskIndex * 0.05 }}
                                                                className={`p-4 rounded-xl border-2 transition-all ${isCompleted
                                                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                                                                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                                                                    }`}
                                                            >
                                                                <div className="flex items-start gap-4">
                                                                    {/* Checkbox */}
                                                                    <button
                                                                        onClick={() => !isCompleted && userProgress && handleCompleteTask(task._id)}
                                                                        disabled={!userProgress || isCompleted}
                                                                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted
                                                                            ? 'bg-green-500 border-green-500'
                                                                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                                                                            } ${!userProgress ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                                    >
                                                                        {isCompleted && <CheckCircle2 size={16} className="text-white" />}
                                                                    </button>

                                                                    <div className="flex-1">
                                                                        {/* Task Title */}
                                                                        <div className="flex items-start justify-between gap-4 mb-2">
                                                                            <h4 className={`font-semibold text-gray-900 dark:text-white ${isCompleted ? 'line-through opacity-60' : ''}`}>
                                                                                {task.title}
                                                                            </h4>
                                                                            {task.estimatedTime && (
                                                                                <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                                    <Clock size={12} />
                                                                                    {task.estimatedTime}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {/* Task Description */}
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                                            {task.description}
                                                                        </p>

                                                                        {/* Task Tips */}
                                                                        {task.tips && task.tips.length > 0 && (
                                                                            <div className="mb-3">
                                                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">💡 Tips:</p>
                                                                                <ul className="space-y-1">
                                                                                    {task.tips.map((tip, tipIndex) => (
                                                                                        <li key={tipIndex} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                                                                            <span className="text-blue-500">•</span>
                                                                                            <span>{tip}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}

                                                                        {/* Task Type Badge */}
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${task.type === 'video' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                                task.type === 'document' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                                    task.type === 'link' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                                                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                                                }`}>
                                                                                <TaskIcon size={12} />
                                                                                {task.type}
                                                                            </span>

                                                                            {task.isOptional && (
                                                                                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs font-semibold">
                                                                                    Optional
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {/* Resource URL */}
                                                                        {task.resourceUrl && (
                                                                            <a
                                                                                href={task.resourceUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                                            >
                                                                                <LinkIcon size={14} />
                                                                                View Resource
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}

                                                    {/* Stage Notes Section */}
                                                    {userProgress && (
                                                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                                    <FileText size={18} />
                                                                    Notes for this stage
                                                                </h4>
                                                                <button
                                                                    onClick={() => setAddingNoteToStage(addingNoteToStage === stage.stageNumber ? null : stage.stageNumber)}
                                                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                                >
                                                                    <Plus size={16} />
                                                                    Add Note
                                                                </button>
                                                            </div>

                                                            {/* Add Note Form */}
                                                            {addingNoteToStage === stage.stageNumber && (
                                                                <div className="mb-4">
                                                                    <textarea
                                                                        value={noteText}
                                                                        onChange={(e) => setNoteText(e.target.value)}
                                                                        placeholder="Write your notes here..."
                                                                        rows={3}
                                                                        className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-blue-500"
                                                                    />
                                                                    <div className="flex gap-2 mt-2">
                                                                        <button
                                                                            onClick={() => handleAddNote(stage.stageNumber)}
                                                                            disabled={!noteText.trim()}
                                                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            Save Note
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setAddingNoteToStage(null);
                                                                                setNoteText('');
                                                                            }}
                                                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Display Notes */}
                                                            <div className="space-y-2">
                                                                {userProgress.notes
                                                                    .filter(note => note.stageNumber === stage.stageNumber)
                                                                    .map((note, index) => (
                                                                        <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                                            <p className="text-sm text-gray-700 dark:text-gray-300">{note.note}</p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                {new Date(note.createdAt).toLocaleDateString()}
                                                                            </p>
                                                                        </div>
                                                                    ))}

                                                                {userProgress.notes.filter(n => n.stageNumber === stage.stageNumber).length === 0 && (
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                        No notes yet for this stage
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Milestone Reward */}
                                                    {stage.milestoneReward && (
                                                        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl">
                                                            <div className="flex items-center gap-3">
                                                                <Award size={24} className="text-yellow-600 dark:text-yellow-400" />
                                                                <div>
                                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                                        Milestone Reward
                                                                    </p>
                                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                        {stage.milestoneReward.badge} • +{stage.milestoneReward.points} points
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Bottom CTA */}
                    {!userProgress && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white text-center"
                        >
                            <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Journey?</h2>
                            <p className="text-lg mb-6 opacity-90">
                                Start this roadmap and track your progress every step of the way
                            </p>
                            <button
                                onClick={handleStartRoadmap}
                                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
                            >
                                Start Roadmap Now →
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoadmapView;