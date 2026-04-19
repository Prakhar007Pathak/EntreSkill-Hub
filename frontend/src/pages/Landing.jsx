import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import {
    ArrowRight, CheckCircle, TrendingUp, Users, Target, BarChart3, Lightbulb, Zap, Sparkles,
    Rocket, GraduationCap, Map, MessageSquare, Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

// Animated Counter Component for Mentorship
const Counter = ({ value, duration = 2 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            let start = 0;
            const end = parseInt(value.substring(0, value.length - 1));
            if (start === end) return;
            let totalMiliseconds = duration * 1000;
            let incrementTime = totalMiliseconds / end;
            let timer = setInterval(() => {
                start += 1;
                setCount(start);
                if (start === end) clearInterval(timer);
            }, incrementTime);
        }
    }, [isInView, value, duration]);

    return <span ref={ref}>{count}{value.slice(-1)}</span>;
};

const Landing = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const [selectedSkill, setSelectedSkill] = useState(null);

    const skillMatches = {
        'Handicrafts': 'E-commerce Boutique & Global Export',
        'Cooking': 'Cloud Kitchen or Specialist Catering',
        'Digital': 'Niche Agency or Creative Studio',
        'Repair': 'Authorized Multi-Brand Service Hub'
    };

    return (
        <div ref={ref} className="bg-[#FAFAFA] text-slate-900 selection:bg-blue-100 scroll-smooth">
            {/* 1. UPDATED NAVIGATION */}
            <nav className="fixed top-4 inset-x-0 max-w-5xl mx-auto z-50">
                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl px-6 py-3 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Zap className="text-white fill-white" size={18} />
                        </div>
                        <span className="font-bold text-lg tracking-tight">EntreSkill</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                        <a href="#roadmaps" className="hover:text-blue-600 transition-colors">Roadmaps</a>
                        <a href="#mentors" className="hover:text-blue-600 transition-colors">Mentors</a>
                        <a href="#impact" className="hover:text-blue-600 transition-colors">Impact</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/register" className="text-sm font-semibold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all active:scale-95">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="relative pt-44 pb-32 overflow-hidden px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full mb-6 shadow-sm">
                            <Sparkles size={14} className="text-blue-500" />
                            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Enablement Platform</span>
                        </div>
                        <h1 className="text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                            Build a Business <br /> Around Your <span className="text-blue-600">Skill.</span>
                        </h1>
                        <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-xl">
                            EntreSkill Hub converts practical skills into profitable micro-enterprises through structured roadmaps and expert-led mentorship.
                        </p>
                        <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-group">
                            Explore Opportunities <ArrowRight size={18} className="ml-2" />
                        </button>
                    </motion.div>

                    {/* Interactive Preview */}
                    <div className="hidden lg:block">
                        <div className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-2xl">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Target className="text-blue-600" /> Smart Match Engine</h3>
                            <p className="text-slate-500 text-sm mb-6">Select your existing skill to generate a startup concept:</p>
                            <div className="flex flex-wrap gap-3 mb-10">
                                {Object.keys(skillMatches).map((skill) => (
                                    <button key={skill} onClick={() => setSelectedSkill(skill)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${selectedSkill === skill ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 hover:border-blue-300'}`}>
                                        {skill}
                                    </button>
                                ))}
                            </div>
                            <AnimatePresence mode="wait">
                                {selectedSkill && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                                        <p className="text-blue-600 text-[10px] font-bold uppercase mb-1">Recommended Venture</p>
                                        <h4 className="text-xl font-bold text-slate-800">{skillMatches[selectedSkill]}</h4>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* 1. THE ENTREPRENEUR'S TOOLKIT - UPDATED CONTENT & DESIGN */}
            <section id="features" className="py-32 px-6 bg-white scroll-mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mb-16">
                        <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">Core Infrastructure</span>
                        <h2 className="text-5xl font-extrabold tracking-tight mt-4 mb-6">
                            Everything you need to <br />
                            <span className="text-slate-400">go from Zero to Revenue.</span>
                        </h2>
                        <p className="text-slate-500 text-lg leading-relaxed">
                            We’ve condensed years of business experience into a modular toolkit designed to eliminate
                            operational friction and focus on what matters: your growth.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-12 gap-6">

                        {/* 1. Personalized Roadmaps - Large Primary Card */}
                        <div className="md:col-span-7 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group min-h-[400px] flex flex-col justify-between">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
                                    <Map className="text-white" size={28} />
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Personalized Roadmaps</h3>
                                <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                                    No more generic advice. Get a structured, step-by-step blueprint generated specifically
                                    around your unique skillset and long-term business objectives.
                                </p>
                            </div>

                            {/* Visual element: Roadmap Path Illustration */}
                            <div className="mt-8 flex gap-3 overflow-hidden">
                                {[1, 2, 3, 4].map((step) => (
                                    <div key={step} className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl">
                                        <div className="text-[10px] text-blue-400 font-bold mb-1">PHASE 0{step}</div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: step * 25 + '%' }}
                                                className="h-full bg-blue-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Expert Mentorship - Tall Sidebar Card */}
                        <div className="md:col-span-5 bg-blue-50 border border-blue-100 rounded-[2.5rem] p-10 flex flex-col">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                                <Users className="text-blue-600" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900">Expert Mentorship</h3>
                            <p className="text-slate-600 leading-relaxed mb-10">
                                Skip the expensive mistakes. Connect directly with verified mentors who have
                                actually built and scaled successful businesses in your specific industry.
                            </p>
                            <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                    <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white" />
                                    <div>
                                        <p className="text-xs font-bold">Arjun V.</p>
                                        <p className="text-[10px] text-slate-500">Founded 2 Cloud Kitchens</p>
                                    </div>
                                    <button className="ml-auto text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">Available</button>
                                </div>
                            </div>
                        </div>

                        {/* 3. Multiple Business Ideas - Wide Bottom Card */}
                        <div className="md:col-span-5 bg-gray-50 border border-gray-200 rounded-[2.5rem] p-10 flex flex-col justify-between">
                            <div>
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                                    <Lightbulb className="text-orange-500" size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Multiple Business Ideas</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    Access a curated library of profitable opportunities. Each idea comes with
                                    market insights, viability scores, and localized demand data.
                                </p>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-slate-600">E-commerce</span>
                                <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-slate-600">SaaS</span>
                                <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-slate-600">Local Services</span>
                            </div>
                        </div>

                        {/* 4. Progress Analytics - Impactful End Card */}
                        <div className="md:col-span-7 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                            <div className="relative z-10 grid md:grid-cols-2 gap-8 h-full items-center">
                                <div>
                                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                                        <BarChart3 className="text-white" size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Progress Analytics</h3>
                                    <p className="text-indigo-100 leading-relaxed">
                                        Visualize your growth with granular metrics. Track milestones, completion rates,
                                        and capital efficiency in real-time.
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-xs font-bold text-indigo-200 uppercase tracking-tighter">Milestones Met</span>
                                        <span className="text-2xl font-black">78%</span>
                                    </div>
                                    <div className="space-y-3">
                                        {[70, 45, 90].map((w, i) => (
                                            <div key={i} className="h-2 w-full bg-white/10 rounded-full">
                                                <div className="h-full bg-white rounded-full" style={{ width: `${w}%` }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Decorative background shape */}
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. ROADMAP: THE JOURNEY*/}
            <section id="roadmaps" className="py-32 px-6 bg-[#FAFAFA] scroll-mt-20">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-24">
                        <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-xs">A Proven Reality</span>
                        <h2 className="text-5xl font-extrabold mt-4">The Journey: How you build it.</h2>
                    </div>

                    <div className="relative">
                        {/* The Roadmap Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 hidden md:block" />

                        {[
                            { step: "Step 01", title: "Skill-to-Business Alignment", desc: "Identify the highest-earning business model aligned with your existing practical skills and local market gap.", icon: Lightbulb, color: "text-orange-600", bg: "bg-orange-100" },
                            { step: "Step 02", stepLabel: "Market Validation", title: "Unit Economic Analysis", desc: "Calculate your 'Point of Profitability'. We define exactly how much you need to sell to cover costs and scale.", icon: BarChart3, color: "text-blue-600", bg: "bg-blue-100" },
                            { step: "Step 03", stepLabel: "Operations", title: "Standard Operating Procedures", desc: "Access professional workflows, vendor templates, and legal checklists to launch with zero operational friction.", icon: Briefcase, color: "text-purple-600", bg: "bg-purple-100" },
                            { step: "Step 04", stepLabel: "Growth", title: "Market Penetration", desc: "Implement hyper-local marketing strategies to acquire your first 100 customers within the first 30 days of launch.", icon: Rocket, color: "text-green-600", bg: "bg-green-100" }
                        ].map((item, idx) => (
                            <div key={idx} className={`flex flex-col md:flex-row items-center mb-24 relative ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                {/* Content Side */}
                                <div className="w-full md:w-[42%]">
                                    <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: idx % 2 === 0 ? 20 : -20 }} viewport={{ once: true }}
                                        className={`bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 ${idx % 2 === 0 ? 'text-left' : 'md:text-right'}`}>
                                        <span className={`text-xs font-bold uppercase tracking-widest ${item.color}`}>{item.step}</span>
                                        <h3 className="text-2xl font-bold mt-2 mb-4 italic leading-tight">{item.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                                    </motion.div>
                                </div>

                                {/* Center Point */}
                                <div className="z-10 my-6 md:my-0">
                                    <div className={`w-14 h-14 ${item.bg} rounded-2xl border-4 border-white shadow-xl flex items-center justify-center scale-110`}>
                                        <item.icon className={item.color} size={24} />
                                    </div>
                                </div>

                                {/* Empty Side (Used for Spacing) */}
                                <div className="w-full md:w-[42%] hidden md:block" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. MENTORSHIP SECTION */}
            <section id="mentors" className="py-32 px-6 bg-slate-900 text-white scroll-mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <span className="text-blue-400 font-bold uppercase tracking-widest text-xs">Human-Centric Guidance</span>
                            <h2 className="text-5xl font-bold mt-6 mb-8 leading-tight">Expert Mentorship <br /> Every Step of the Way.</h2>
                            <p className="text-slate-400 text-lg mb-12 leading-relaxed">Starting a business is hard; doing it alone is harder. EntreSkill connects you with veteran entrepreneurs who have already navigated the path you're on.</p>

                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0 border border-blue-500/20"><MessageSquare className="text-blue-400" size={20} /></div>
                                    <div>
                                        <h4 className="font-bold mb-1">Weekly Q&A</h4>
                                        <p className="text-slate-500 text-xs">Direct sessions to resolve hurdles in real-time.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0 border border-blue-500/20"><GraduationCap className="text-blue-400" size={20} /></div>
                                    <div>
                                        <h4 className="font-bold mb-1">SBA Guidance</h4>
                                        <p className="text-slate-500 text-xs">Advice aligned with Small Business Administration standards.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 text-center relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-blue-400 font-bold text-sm uppercase mb-4 tracking-widest">Network Strength</p>
                                <div className="text-[100px] font-black leading-none mb-4 text-white">
                                    <Counter value="250+" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Verified Industry Mentors</h3>
                                <p className="text-slate-400">Ready to help you launch and scale.</p>
                            </div>
                            <div className="absolute inset-0 bg-blue-600/10 blur-[100px] -z-0" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. IMPACT SECTION (Why Choose Us?) */}
            <section id="impact" className="py-32 px-6 bg-white border-y border-gray-100 scroll-mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-4xl font-bold mb-6">Why Choose EntreSkill?</h2>
                                <p className="text-slate-500 text-lg italic">We provide more than just information—we deliver structured, actionable frameworks designed for success.</p>
                            </div>

                            <div className="grid gap-4">
                                {[
                                    "Risk-validated business models",
                                    "Industry-specific financial planning",
                                    "Legal and compliance guidance",
                                    "Marketing and growth strategies",
                                    "Operational framework templates",
                                    "Peer networking opportunities"
                                ].map((text, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle className="text-green-600" size={14} /></div>
                                        <span className="text-slate-700 font-semibold text-sm">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[3rem] p-12 text-white">
                            <h3 className="text-2xl font-bold mb-12 text-blue-400">Platform Performance</h3>
                            <div className="space-y-10">
                                <div>
                                    <p className="text-slate-400 text-sm mb-2 font-bold tracking-widest uppercase">Average Investment</p>
                                    <p className="text-5xl font-black tracking-tight">₹15,000 <span className="text-xl text-slate-500">to</span> ₹50,000</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm mb-2 font-bold tracking-widest uppercase">Time to Launch</p>
                                    <p className="text-5xl font-black tracking-tight">8-12 <span className="text-xl text-slate-500">Weeks</span></p>
                                </div>
                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-slate-400 text-sm mb-1 font-bold tracking-widest uppercase">Success Rate</p>
                                            <p className="text-6xl font-black text-blue-500">85%</p>
                                        </div>
                                        <div className="pb-2">
                                            <TrendingUp className="text-blue-500" size={48} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION (UNCHANGED) */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px]" />
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">Stop dreaming, <br /> start building.</h2>
                    <p className="text-slate-400 mb-10 text-lg max-w-lg mx-auto relative z-10">Join 10,000+ people who turned their skills into local success stories.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                        <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold hover:bg-blue-50 transition-colors shadow-lg">Get Started for Free</Link>
                        <button className="w-full sm:w-auto px-10 py-5 bg-slate-800 text-white rounded-2xl font-bold border border-slate-700 hover:bg-slate-700 transition-colors">Speak to an Expert</button>
                    </div>
                </div>
            </section>

            <footer className="py-16 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Zap className="text-white fill-white" size={14} /></div>
                        <span className="font-bold text-lg">EntreSkill Hub</span>
                    </div>
                    <p className="text-slate-400 text-sm italic">Turning skills into self-reliance since 2024.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;