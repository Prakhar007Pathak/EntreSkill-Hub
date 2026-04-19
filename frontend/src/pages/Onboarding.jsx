import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Briefcase, Target, Sparkles, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import onboardingService from "../services/onboardingService";
import { useAuth } from "../context/AuthContext";

const Onboarding = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        status: "",
        education: "",
        field: "",
        skills: "",
        tools: "",
        proficiency: "Intermediate",
        industry: [],
        budget: "0",
        commitment: "20",
    });

    // --- DATA REPOSITORIES ---
    const statusOptions = [
        "Student (High School/Undergrad)",
        "Postgraduate Student",
        "Working Professional (Full-time)",
        "Freelancer / Gig Worker",
        "Founder / Self-employed",
        "Career Switcher",
        "Recent Graduate",
        "Researcher / Academic",
        "Homemaker / Re-entering Workforce"
    ];

    const educationOptions = [
        "High School Diploma",
        "Associate Degree",
        "Bachelor's Degree",
        "Master's Degree",
        "PhD / Doctorate",
        "Bootcamp Graduate",
        "Self-Taught Expert",
        "Professional Certification Holder"
    ];

    // NEW INDUSTRY STRUCTURE
    const topGrowingIndustries = [
        "Artificial Intelligence & Automation",
        "Renewable Energy & CleanTech",
        "Digital Health & Telemedicine",
        "FinTech & Digital Finance",
        "Cybersecurity",
        "Aerospace & Space Technology",
        "Advanced Manufacturing & Semiconductors",
        "E-commerce",
        "Streaming & Content Services",
        "Waste Management & Recycling"
    ];

    const industryCategories = {
        "Information Technology (IT)": [
            "SaaS (Software as a Service)",
            "Technology Hardware & Equipment",
            "AI & Robotics",
            "EdTech (Education)",
            "AdTech (Advertising)",
            "Gaming & Esports",
            "Web3 & Crypto"
        ],
        "Financials": [
            "Banking",
            "Insurance",
            "Diversified Financials"
        ],
        "Healthcare": [
            "Healthcare Equipment & Services",
            "Pharmaceuticals & Biotech"
        ],
        "Consumer Discretionary": [
            "Automobiles & Components",
            "Consumer Durables & Apparel",
            "Household Appliances",
            "Home Furnishings",
            "Textiles",
            "Footwear",
            "Consumer Services",
            "Retailing",
            "Travel & Hospitality"
        ],
        "Consumer Staples": [
            "Food & Staples Retailing",
            "Food, Beverage & Tobacco",
            "Household & Personal Products"
        ],
        "Industrials": [
            "Capital Goods",
            "Construction & Engineering",
            "Commercial & Professional Services",
            "Transportation",
            "Logistics & Supply Chain"
        ],
        "Materials": [
            "Chemicals",
            "Construction Materials",
            "Containers & Packaging",
            "Metals & Mining",
            "Paper & Forest Products"
        ],
        "Energy & Sustainability": [
            "Oil & Gas",
            "Coal & Consumable Fuels",
            "CleanTech (Sustainability)"
        ],
        "Communication Services": [
            "Telecommunication Services",
            "Media & Entertainment"
        ],
        "Real Estate": [
            "Real Estate Investment Trusts (REITs)",
            "Real Estate Management & Development"
        ],
        "Agriculture & Primary Sector": [
            "AgriTech (Agriculture)"
        ]
    };

    // Flatten all industries for rendering
    const allIndustries = [
        ...topGrowingIndustries,
        ...Object.values(industryCategories).flat()
    ];

    // --- HANDLERS ---
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const toggleIndustry = (val) => {
        const current = form.industry;
        if (current.includes(val)) {
            setForm({ ...form, industry: current.filter(i => i !== val) });
        } else if (current.length < 5) {
            setForm({ ...form, industry: [...current, val] });
        } else {
            toast.error('You can select up to 5 industries');
        }
    };

    const validateStep = () => {
        if (step === 1) {
            if (!form.status || !form.education || !form.field) {
                toast.error('Please complete all required fields');
                return false;
            }
        }
        if (step === 2) {
            if (!form.skills || !form.tools) {
                toast.error('Please enter your skills and tools');
                return false;
            }
        }
        if (step === 3) {
            if (form.industry.length === 0) {
                toast.error('Please select at least one industry');
                return false;
            }
        }
        return true;
    };

    const handleNext = async () => {
        if (!validateStep()) return;

        if (step < 3) {
            setStep(step + 1);
        } else {
            setLoading(true);
            try {
                // Convert comma-separated strings to arrays
                const skillsArray = form.skills.split(',').map(s => s.trim()).filter(s => s);
                const toolsArray = form.tools.split(',').map(t => t.trim()).filter(t => t);

                const response = await onboardingService.submitOnboarding({
                    ...form,
                    skills: skillsArray,
                    tools: toolsArray,
                    budget: parseInt(form.budget) || 0
                });

                const updatedUser = response.data.user;
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));

                toast.success('Profile setup complete! 🎉');
                setTimeout(() => navigate('/dashboard'), 1500);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to save profile');
            } finally {
                setLoading(false);
            }
        }
    };

    const stepIcons = [User, Briefcase, Target];
    const StepIcon = stepIcons[step - 1];

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">

            {/* Animated Background */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [90, 0, 90],
                }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"
            />

            {/* Main Card */}
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
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg"
                        >
                            <StepIcon className="text-white" size={28} />
                        </motion.div>

                        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                            {step === 1 && "Tell Us About Yourself"}
                            {step === 2 && "Your Skills & Expertise"}
                            {step === 3 && "Your Vision & Goals"}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {step === 1 && "Let's start by understanding your background"}
                            {step === 2 && "What are you great at?"}
                            {step === 3 && "Where do you see yourself building?"}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center justify-between mb-10 px-2">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="flex flex-col items-center gap-2 flex-1">
                                <div className="relative w-full">
                                    <div className={`h-2 rounded-full transition-all duration-500 ${step >= num
                                        ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                                        : "bg-gray-200 dark:bg-gray-700"
                                        }`} />
                                </div>
                                <span className={`text-xs font-semibold ${step >= num ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                                    }`}>
                                    Step {num}
                                </span>
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
                            {/* STEP 1: BACKGROUND */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            What best describes you? *
                                        </label>
                                        <select
                                            name="status"
                                            value={form.status}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all text-gray-900 dark:text-white"
                                        >
                                            <option value="">Select your current status</option>
                                            {statusOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Highest Education Level *
                                        </label>
                                        <select
                                            name="education"
                                            value={form.education}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all text-gray-900 dark:text-white"
                                        >
                                            <option value="">Select your education</option>
                                            {educationOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Field of Study/Interest *
                                        </label>
                                        <input
                                            type="text"
                                            name="field"
                                            value={form.field}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., Computer Science, Business, Design, Marketing"
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: SKILLS */}
                            {step === 2 && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            What's your primary skillset? *
                                        </label>
                                        <input
                                            type="text"
                                            name="skills"
                                            value={form.skills}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., Web Development, Graphic Design, Content Writing (separate with commas)"
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            💡 Separate multiple skills with commas
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Tools & Technologies You Use *
                                        </label>
                                        <input
                                            type="text"
                                            name="tools"
                                            value={form.tools}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., React, Figma, Python, Adobe Photoshop (separate with commas)"
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            💡 List the tools you're comfortable with
                                        </p>
                                    </div>

                                    <div className="p-5 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-100 dark:border-blue-800">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                Skill Level
                                            </label>
                                            <span className="px-3 py-1 bg-blue-500 text-white text-sm font-bold rounded-full">
                                                {form.proficiency}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            name="proficiency"
                                            min="1"
                                            max="100"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const label = val < 40 ? "Beginner" : val < 75 ? "Intermediate" : "Expert";
                                                setForm({ ...form, proficiency: label });
                                            }}
                                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            <span>Beginner</span>
                                            <span>Intermediate</span>
                                            <span>Expert</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: VISION */}
                            {step === 3 && (
                                <div className="space-y-5">
                                    {/* Top Growing Industries */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            🔥 Top Growing Industries
                                        </label>
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            {topGrowingIndustries.map((ind) => (
                                                <button
                                                    key={ind}
                                                    type="button"
                                                    onClick={() => toggleIndustry(ind)}
                                                    className={`p-3 text-sm font-medium rounded-xl border-2 transition-all text-left ${form.industry.includes(ind)
                                                        ? "bg-gradient-to-r from-orange-500 to-red-600 border-orange-500 text-white shadow-lg"
                                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-orange-400"
                                                        }`}
                                                >
                                                    {form.industry.includes(ind) && (
                                                        <CheckCircle size={16} className="inline mr-2" />
                                                    )}
                                                    {ind}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Industry Categories */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            📂 Industry Categories
                                        </label>
                                        <div className="max-h-80 overflow-y-auto p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 space-y-4">
                                            {Object.entries(industryCategories).map(([category, industries]) => (
                                                <div key={category}>
                                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                                                        {category}
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {industries.map((ind) => (
                                                            <button
                                                                key={ind}
                                                                type="button"
                                                                onClick={() => toggleIndustry(ind)}
                                                                className={`p-2 text-xs font-medium rounded-lg border-2 transition-all text-left ${form.industry.includes(ind)
                                                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 text-white shadow-lg"
                                                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400"
                                                                    }`}
                                                            >
                                                                {form.industry.includes(ind) && (
                                                                    <CheckCircle size={14} className="inline mr-1" />
                                                                )}
                                                                {ind}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            Selected: {form.industry.length}/5
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Initial Budget (₹)
                                            </label>
                                            <input
                                                type="number"
                                                name="budget"
                                                value={form.budget}
                                                onChange={handleChange}
                                                min="0"
                                                placeholder="0"
                                                className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Hours/Week
                                            </label>
                                            <input
                                                type="number"
                                                name="commitment"
                                                value={form.commitment}
                                                onChange={handleChange}
                                                placeholder="20"
                                                className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all text-gray-900 dark:text-white"
                                            />
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
                            className={`flex-[2] py-4 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-2xl'
                                }`}
                        >
                            {loading ? (
                                'Saving...'
                            ) : step === 3 ? (
                                <>
                                    Complete Setup <Sparkles size={20} />
                                </>
                            ) : (
                                <>
                                    Continue →
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Onboarding;