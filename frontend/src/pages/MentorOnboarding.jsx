import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap, Briefcase, Target, Users,
    CheckCircle, Sparkles, Plus, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import mentorService from '../services/mentorService';
import { useAuth } from '../context/AuthContext';

// ─── Tag Input Component ─────────────────────────────────────
const TagInput = ({ label, placeholder, tags, onAdd, onRemove, hint }) => {
    const [input, setInput] = useState('');

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
            e.preventDefault();
            onAdd(input.trim());
            setInput('');
        }
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {label}
            </label>
            <div className="w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus-within:border-blue-500 transition-all">
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, i) => (
                        <span
                            key={i}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => onRemove(i)}
                                className="hover:text-blue-900"
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
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full outline-none bg-transparent text-gray-900 dark:text-white text-sm placeholder-gray-400"
                />
            </div>
            {hint && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>
            )}
        </div>
    );
};

const MentorOnboarding = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        // Step 1 - Professional Identity
        headline: '',
        yearsOfExperience: '',
        currentRole: '',
        linkedinUrl: '',
        websiteUrl: '',

        // Step 2 - Expertise
        primaryExpertise: [],
        industries: [],
        skills: [],
        tools: [],

        // Step 3 - Mentorship Details
        bio: '',
        targetMentees: '',
        sessionTypes: { qa: false, videoCall: false },
        availableDays: [],
        hoursPerWeek: '',
        languages: [],

        // Step 4 - Credentials
        achievements: [],
        businessesBuilt: [],
        notableClients: [],
        trustStatement: ''
    });

    const expertiseOptions = [
        'Digital Marketing', 'Web Development', 'Mobile App Dev',
        'E-commerce', 'SaaS', 'Content Creation', 'Social Media',
        'Business Strategy', 'Finance & Accounting', 'Legal & Compliance',
        'Sales & CRM', 'Product Management', 'UI/UX Design',
        'Data Science & AI', 'Operations & Logistics', 'HR & Recruitment',
        'Real Estate', 'Food & Beverage', 'Healthcare', 'EdTech'
    ];

    const industryOptions = [
        'Technology', 'E-commerce', 'Healthcare', 'Finance',
        'Education', 'Marketing', 'Manufacturing', 'Real Estate',
        'Food & Beverage', 'Media & Entertainment', 'Consulting',
        'Agriculture', 'Logistics', 'Retail', 'SaaS'
    ];

    const dayOptions = [
        'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const toggleExpertise = (val) => {
        const current = form.primaryExpertise;
        if (current.includes(val)) {
            setForm({ ...form, primaryExpertise: current.filter(e => e !== val) });
        } else if (current.length < 5) {
            setForm({ ...form, primaryExpertise: [...current, val] });
        } else {
            toast.error('Select up to 5 expertise areas');
        }
    };

    const toggleIndustry = (val) => {
        const current = form.industries;
        if (current.includes(val)) {
            setForm({ ...form, industries: current.filter(i => i !== val) });
        } else if (current.length < 5) {
            setForm({ ...form, industries: [...current, val] });
        } else {
            toast.error('Select up to 5 industries');
        }
    };

    const toggleDay = (day) => {
        const current = form.availableDays;
        setForm({
            ...form,
            availableDays: current.includes(day)
                ? current.filter(d => d !== day)
                : [...current, day]
        });
    };

    const addTag = (field, value) => {
        if (!form[field].includes(value)) {
            setForm({ ...form, [field]: [...form[field], value] });
        }
    };

    const removeTag = (field, index) => {
        setForm({
            ...form,
            [field]: form[field].filter((_, i) => i !== index)
        });
    };

    const validateStep = () => {
        if (step === 1) {
            if (!form.headline || !form.yearsOfExperience || !form.currentRole) {
                toast.error('Please fill all required fields');
                return false;
            }
        }
        if (step === 2) {
            if (form.primaryExpertise.length === 0) {
                toast.error('Select at least one expertise area');
                return false;
            }
            if (form.skills.length === 0) {
                toast.error('Add at least one skill');
                return false;
            }
        }
        if (step === 3) {
            if (!form.bio || form.bio.length < 50) {
                toast.error('Bio must be at least 50 characters');
                return false;
            }
            if (!form.sessionTypes.qa && !form.sessionTypes.videoCall) {
                toast.error('Select at least one session type');
                return false;
            }
            if (form.languages.length === 0) {
                toast.error('Add at least one language (e.g., English, Hindi)');
                return false;
            }
        }
        if (step === 4) {
            if (!form.trustStatement) {
                toast.error('Please add your trust statement');
                return false;
            }
        }
        return true;
    };

    const handleNext = async () => {
        if (!validateStep()) return;

        if (step < 4) {
            setStep(step + 1);
        } else {
            setLoading(true);
            try {
                const response = await mentorService.submitMentorOnboarding(form);
                const updatedUser = response.data.user;
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));

                toast.success('Profile submitted! Awaiting admin verification 🎓');
                setTimeout(() => navigate('/mentor/pending'), 1500);
            } catch (error) {
                toast.error(
                    error.response?.data?.message || 'Failed to save mentor profile'
                );
            } finally {
                setLoading(false);
            }
        }
    };

    const stepIcons = [Briefcase, GraduationCap, Users, Target];
    const stepTitles = [
        'Professional Identity',
        'Expertise & Skills',
        'Mentorship Details',
        'Credentials & Proof'
    ];
    const stepSubtitles = [
        'Tell us about your professional background',
        'What are you an expert in?',
        'How will you mentor others?',
        'Prove your credibility'
    ];

    const StepIcon = stepIcons[step - 1];

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden py-8">

            {/* Background */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"
            />
            <motion.div
                animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl relative z-10"
            >
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            key={step}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg"
                        >
                            <StepIcon className="text-white" size={28} />
                        </motion.div>
                        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                            {stepTitles[step - 1]}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {stepSubtitles[step - 1]}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mb-10">
                        {[1, 2, 3, 4].map((num) => (
                            <div key={num} className="flex-1">
                                <div className={`h-2 rounded-full transition-all duration-500 ${step >= num
                                    ? 'bg-gradient-to-r from-purple-500 to-blue-600'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                    }`} />
                                <p className={`text-xs font-semibold mt-1 text-center ${step >= num
                                    ? 'text-purple-600 dark:text-purple-400'
                                    : 'text-gray-400'
                                    }`}>
                                    Step {num}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Form Steps */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >

                            {/* STEP 1: Professional Identity */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Professional Headline *
                                        </label>
                                        <input
                                            type="text"
                                            name="headline"
                                            value={form.headline}
                                            onChange={handleChange}
                                            placeholder="e.g., Serial Entrepreneur & Digital Marketing Expert"
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Years of Experience *
                                            </label>
                                            <input
                                                type="number"
                                                name="yearsOfExperience"
                                                value={form.yearsOfExperience}
                                                onChange={handleChange}
                                                min="0"
                                                placeholder="e.g., 5"
                                                className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Current Role/Designation *
                                            </label>
                                            <input
                                                type="text"
                                                name="currentRole"
                                                value={form.currentRole}
                                                onChange={handleChange}
                                                placeholder="e.g., Founder & CEO"
                                                className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            LinkedIn Profile URL
                                        </label>
                                        <input
                                            type="url"
                                            name="linkedinUrl"
                                            value={form.linkedinUrl}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/in/yourprofile"
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Website / Portfolio URL
                                        </label>
                                        <input
                                            type="url"
                                            name="websiteUrl"
                                            value={form.websiteUrl}
                                            onChange={handleChange}
                                            placeholder="https://yourwebsite.com"
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Expertise & Skills */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    {/* Primary Expertise */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Primary Expertise Areas * (select up to 5)
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {expertiseOptions.map((exp) => (
                                                <button
                                                    key={exp}
                                                    type="button"
                                                    onClick={() => toggleExpertise(exp)}
                                                    className={`p-2.5 text-xs font-medium rounded-xl border-2 transition-all text-left ${form.primaryExpertise.includes(exp)
                                                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 border-purple-500 text-white shadow-lg'
                                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                                                        }`}
                                                >
                                                    {form.primaryExpertise.includes(exp) && (
                                                        <CheckCircle size={12} className="inline mr-1" />
                                                    )}
                                                    {exp}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Selected: {form.primaryExpertise.length}/5
                                        </p>
                                    </div>

                                    {/* Industries */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Industries You've Worked In (select up to 5)
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {industryOptions.map((ind) => (
                                                <button
                                                    key={ind}
                                                    type="button"
                                                    onClick={() => toggleIndustry(ind)}
                                                    className={`p-2.5 text-xs font-medium rounded-xl border-2 transition-all text-left ${form.industries.includes(ind)
                                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-500 text-white shadow-lg'
                                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                                                        }`}
                                                >
                                                    {form.industries.includes(ind) && (
                                                        <CheckCircle size={12} className="inline mr-1" />
                                                    )}
                                                    {ind}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <TagInput
                                        label="Skills You Can Mentor On *"
                                        placeholder="Type a skill and press Enter..."
                                        tags={form.skills}
                                        onAdd={(val) => addTag('skills', val)}
                                        onRemove={(i) => removeTag('skills', i)}
                                        hint="💡 Press Enter or comma to add each skill"
                                    />

                                    {/* Tools */}
                                    <TagInput
                                        label="Tools & Technologies"
                                        placeholder="Type a tool and press Enter..."
                                        tags={form.tools}
                                        onAdd={(val) => addTag('tools', val)}
                                        onRemove={(i) => removeTag('tools', i)}
                                        hint="💡 e.g., React, Figma, Google Ads, Shopify"
                                    />
                                </div>
                            )}

                            {/* STEP 3: Mentorship Details - ✅ FIXED */}
                            {step === 3 && (
                                <div className="space-y-5">
                                    {/* Bio */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Your Bio / About You * (min 50 characters)
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={form.bio}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="Describe your journey, experience, and what drives you to mentor others..."
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {form.bio.length}/1000 characters
                                        </p>
                                    </div>

                                    {/* Target Mentees */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Who Do You Want to Help?
                                        </label>
                                        <input
                                            type="text"
                                            name="targetMentees"
                                            value={form.targetMentees}
                                            onChange={handleChange}
                                            placeholder="e.g., Early-stage founders, Students looking to start businesses"
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                        />
                                    </div>

                                    {/* Session Types */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Session Types You Offer *
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setForm({
                                                    ...form,
                                                    sessionTypes: {
                                                        ...form.sessionTypes,
                                                        qa: !form.sessionTypes.qa
                                                    }
                                                })}
                                                className={`p-4 rounded-2xl border-2 transition-all text-left ${form.sessionTypes.qa
                                                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 border-purple-500 text-white'
                                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-2">💬</div>
                                                <p className="font-bold">Q&A Sessions</p>
                                                <p className={`text-xs mt-1 ${form.sessionTypes.qa ? 'text-white/80' : 'text-gray-500'}`}>
                                                    Text-based Q&A with mentees
                                                </p>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setForm({
                                                    ...form,
                                                    sessionTypes: {
                                                        ...form.sessionTypes,
                                                        videoCall: !form.sessionTypes.videoCall
                                                    }
                                                })}
                                                className={`p-4 rounded-2xl border-2 transition-all text-left ${form.sessionTypes.videoCall
                                                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 border-purple-500 text-white'
                                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-2">🎥</div>
                                                <p className="font-bold">Video Call Sessions</p>
                                                <p className={`text-xs mt-1 ${form.sessionTypes.videoCall ? 'text-white/80' : 'text-gray-500'}`}>
                                                    Live video sessions via Jitsi
                                                </p>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Available Days */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Available Days
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {dayOptions.map((day) => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleDay(day)}
                                                    className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${form.availableDays.includes(day)
                                                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 border-purple-500 text-white'
                                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                                                        }`}
                                                >
                                                    {day.slice(0, 3)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hours per week */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Hours/Week for Mentoring
                                        </label>
                                        <input
                                            type="number"
                                            name="hoursPerWeek"
                                            value={form.hoursPerWeek}
                                            onChange={handleChange}
                                            min="1"
                                            max="40"
                                            placeholder="e.g., 5"
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                        />
                                    </div>

                                    {/* ✅ FIXED: Languages moved OUTSIDE grid */}
                                    <TagInput
                                        label="Languages You Mentor In *"
                                        placeholder="Type language and press Enter (e.g., English, Hindi, Spanish)..."
                                        tags={form.languages}
                                        onAdd={(val) => addTag('languages', val)}
                                        onRemove={(i) => removeTag('languages', i)}
                                        hint="💡 Add at least one language"
                                    />
                                </div>
                            )}

                            {/* STEP 4: Credentials */}
                            {step === 4 && (
                                <div className="space-y-5">
                                    {/* Achievements */}
                                    <TagInput
                                        label="Key Achievements / Certifications"
                                        placeholder="Type achievement and press Enter..."
                                        tags={form.achievements}
                                        onAdd={(val) => addTag('achievements', val)}
                                        onRemove={(i) => removeTag('achievements', i)}
                                        hint="e.g., Forbes 30 Under 30, Google Certified, Founded 3 startups"
                                    />

                                    {/* Businesses Built */}
                                    <TagInput
                                        label="Businesses You've Built / Founded"
                                        placeholder="Type business name and press Enter..."
                                        tags={form.businessesBuilt}
                                        onAdd={(val) => addTag('businessesBuilt', val)}
                                        onRemove={(i) => removeTag('businessesBuilt', i)}
                                        hint="e.g., TechStartup Inc, Digital Agency XYZ"
                                    />

                                    {/* Notable Clients */}
                                    <TagInput
                                        label="Notable Clients / Brands Worked With"
                                        placeholder="Type client name and press Enter..."
                                        tags={form.notableClients}
                                        onAdd={(val) => addTag('notableClients', val)}
                                        onRemove={(i) => removeTag('notableClients', i)}
                                        hint="e.g., Google, Tata, Local MSME brands"
                                    />

                                    {/* Trust Statement */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Why Should Mentees Trust You? *
                                        </label>
                                        <textarea
                                            name="trustStatement"
                                            value={form.trustStatement}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Share what makes you uniquely qualified to guide aspiring entrepreneurs..."
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                                        />
                                    </div>

                                    {/* Summary Preview */}
                                    <div className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border-2 border-purple-100 dark:border-purple-800">
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Sparkles size={18} className="text-purple-500" />
                                            Profile Summary
                                        </h3>
                                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                            <p><span className="font-semibold">Headline:</span> {form.headline || '—'}</p>
                                            <p><span className="font-semibold">Experience:</span> {form.yearsOfExperience || '—'} years</p>
                                            <p><span className="font-semibold">Expertise:</span> {form.primaryExpertise.join(', ') || '—'}</p>
                                            <p><span className="font-semibold">Sessions:</span> {[
                                                form.sessionTypes.qa && 'Q&A',
                                                form.sessionTypes.videoCall && 'Video Call'
                                            ].filter(Boolean).join(', ') || '—'}</p>
                                            <p><span className="font-semibold">Languages:</span> {form.languages.join(', ') || '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-8">
                        {step > 1 && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setStep(step - 1)}
                                className="flex-1 py-4 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            >
                                ← Back
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNext}
                            disabled={loading}
                            className={`flex-[2] py-4 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:shadow-2xl'
                                }`}
                        >
                            {loading ? 'Submitting...' : step === 4 ? (
                                <>Submit for Verification <Sparkles size={20} /></>
                            ) : (
                                <>Continue →</>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MentorOnboarding;