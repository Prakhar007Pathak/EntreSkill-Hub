import Business from '../models/Business.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const businesses = [
    {
        title: "Social Media Marketing Agency",
        slug: "social-media-marketing-agency",
        tagline: "Help businesses grow their online presence",
        description: "Start a social media marketing agency helping small businesses and startups manage their Instagram, Facebook, LinkedIn, and TikTok accounts. Offer content creation, posting schedules, engagement, and analytics reporting.",
        category: "Digital",
        industries: ["Digital Marketing & Growth", "E-commerce & Retail", "SaaS (Software as a Service)"],
        requiredSkills: ["Digital Marketing & Growth", "Content Creation & Media"],
        investmentRange: { min: 500, max: 2000, currency: "USD" },
        timeCommitment: "20-40 hrs/week",
        difficulty: "Easy",
        viabilityScore: 8,
        competitionLevel: "Medium",
        successRate: 75,
        marketDemand: "High",
        expectedROI: { timeline: "3-6 months", percentage: 150 },
        pros: [
            "Low startup cost",
            "Work from anywhere",
            "High demand",
            "Recurring revenue model",
            "Easy to scale"
        ],
        cons: [
            "Client management can be time-intensive",
            "Requires staying updated with platform changes",
            "High competition"
        ],
        icon: "📱",
        tags: ["marketing", "social media", "digital", "remote", "low-investment"],
        featured: true
    },

    {
        title: "Freelance Web Development",
        slug: "freelance-web-development",
        tagline: "Build websites and web apps for clients",
        description: "Offer web development services to businesses needing websites, landing pages, e-commerce stores, or web applications. Work with technologies like React, WordPress, Shopify, or custom solutions.",
        category: "Technology",
        industries: ["SaaS (Software as a Service)", "E-commerce & Retail", "EdTech (Education)"],
        requiredSkills: ["Full-Stack Development", "UI/UX & Product Design"],
        investmentRange: { min: 100, max: 1000, currency: "USD" },
        timeCommitment: "20-40 hrs/week",
        difficulty: "Moderate",
        viabilityScore: 9,
        competitionLevel: "High",
        successRate: 80,
        marketDemand: "Trending",
        expectedROI: { timeline: "1-3 months", percentage: 200 },
        pros: [
            "High earning potential",
            "Global client base",
            "Portfolio builds over time",
            "Flexible schedule"
        ],
        cons: [
            "Requires technical expertise",
            "Client acquisition can be challenging initially",
            "Project-based income variability"
        ],
        icon: "💻",
        tags: ["tech", "coding", "web", "freelance", "high-income"],
        featured: true
    },

    {
        title: "Online Tutoring Platform",
        slug: "online-tutoring-platform",
        tagline: "Teach students online in your area of expertise",
        description: "Start an online tutoring business teaching academic subjects, test prep (SAT, GRE), coding, languages, or music. Use platforms like Zoom or build your own website.",
        category: "Service",
        industries: ["EdTech (Education)"],
        requiredSkills: ["Content Creation & Media", "Sales & Business Development"],
        investmentRange: { min: 200, max: 1500, currency: "USD" },
        timeCommitment: "10-20 hrs/week",
        difficulty: "Easy",
        viabilityScore: 8,
        competitionLevel: "Medium",
        successRate: 70,
        marketDemand: "High",
        expectedROI: { timeline: "2-4 months", percentage: 120 },
        pros: [
            "Flexible hours",
            "Work from home",
            "Rewarding work",
            "Scalable (group classes)"
        ],
        cons: [
            "Income depends on hours taught",
            "Marketing needed to find students",
            "Seasonal demand variations"
        ],
        icon: "📚",
        tags: ["education", "teaching", "remote", "flexible"],
        featured: false
    },

    {
        title: "E-commerce Dropshipping Store",
        slug: "ecommerce-dropshipping-store",
        tagline: "Sell products online without holding inventory",
        description: "Launch an e-commerce store using Shopify or WooCommerce and partner with dropshipping suppliers. Focus on niche products, run ads, and handle customer service while suppliers handle shipping.",
        category: "E-commerce",
        industries: ["E-commerce & Retail", "Digital Marketing & Growth"],
        requiredSkills: ["Digital Marketing & Growth", "Sales & Business Development"],
        investmentRange: { min: 500, max: 3000, currency: "USD" },
        timeCommitment: "20-40 hrs/week",
        difficulty: "Moderate",
        viabilityScore: 7,
        competitionLevel: "High",
        successRate: 60,
        marketDemand: "High",
        expectedROI: { timeline: "4-8 months", percentage: 100 },
        pros: [
            "No inventory management",
            "Low upfront costs",
            "Global market reach",
            "Automated order fulfillment"
        ],
        cons: [
            "Thin profit margins",
            "High competition",
            "Supplier dependency",
            "Customer service challenges"
        ],
        icon: "🛒",
        tags: ["ecommerce", "online-store", "dropshipping", "retail"],
        featured: false
    },

    {
        title: "Mobile App Development Studio",
        slug: "mobile-app-development-studio",
        tagline: "Build iOS and Android apps for clients",
        description: "Offer mobile app development services to startups and businesses. Build native or cross-platform apps using React Native, Flutter, or Swift/Kotlin.",
        category: "Technology",
        industries: ["SaaS (Software as a Service)", "HealthTech (Healthcare)", "FinTech (Finance)"],
        requiredSkills: ["Mobile App Dev (iOS/Android)", "UI/UX & Product Design"],
        investmentRange: { min: 1000, max: 5000, currency: "USD" },
        timeCommitment: "Full-time (40+ hrs)",
        difficulty: "Hard",
        viabilityScore: 9,
        competitionLevel: "Medium",
        successRate: 75,
        marketDemand: "Trending",
        expectedROI: { timeline: "6-12 months", percentage: 180 },
        pros: [
            "High project value",
            "Growing demand",
            "Long-term client relationships",
            "Portfolio showcases expertise"
        ],
        cons: [
            "Requires advanced technical skills",
            "Long development cycles",
            "High client expectations",
            "App store regulations"
        ],
        icon: "📱",
        tags: ["mobile", "app", "tech", "development", "high-value"],
        featured: true
    },

    {
        title: "Graphic Design Freelancing",
        slug: "graphic-design-freelancing",
        tagline: "Create visual designs for brands and businesses",
        description: "Offer graphic design services including logos, branding, social media graphics, packaging, and marketing materials. Use tools like Figma, Adobe Illustrator, or Canva.",
        category: "Creative",
        industries: ["Digital Marketing & Growth", "E-commerce & Retail", "Entertainment & Streaming"],
        requiredSkills: ["UI/UX & Product Design", "Content Creation & Media"],
        investmentRange: { min: 200, max: 1000, currency: "USD" },
        timeCommitment: "10-20 hrs/week",
        difficulty: "Easy",
        viabilityScore: 8,
        competitionLevel: "High",
        successRate: 70,
        marketDemand: "High",
        expectedROI: { timeline: "2-4 months", percentage: 140 },
        pros: [
            "Creative freedom",
            "Flexible schedule",
            "Diverse projects",
            "Portfolio growth"
        ],
        cons: [
            "Competitive market",
            "Client revisions can be time-consuming",
            "Income variability"
        ],
        icon: "🎨",
        tags: ["design", "creative", "freelance", "visual", "branding"],
        featured: false
    },

    {
        title: "Virtual Assistant Service",
        slug: "virtual-assistant-service",
        tagline: "Provide remote administrative support to busy professionals",
        description: "Offer virtual assistant services including email management, calendar scheduling, data entry, research, customer support, and social media management for entrepreneurs and executives.",
        category: "Service",
        industries: ["Operations & Logistics", "E-commerce & Retail"],
        requiredSkills: ["Operations & Logistics", "Sales & Business Development"],
        investmentRange: { min: 100, max: 500, currency: "USD" },
        timeCommitment: "20-40 hrs/week",
        difficulty: "Easy",
        viabilityScore: 7,
        competitionLevel: "Medium",
        successRate: 75,
        marketDemand: "High",
        expectedROI: { timeline: "1-2 months", percentage: 150 },
        pros: [
            "Minimal startup cost",
            "Work remotely",
            "Recurring clients",
            "Diverse tasks"
        ],
        cons: [
            "Time zone differences",
            "Multiple clients to manage",
            "Income ceiling without scaling"
        ],
        icon: "💼",
        tags: ["remote", "admin", "support", "flexible", "low-cost"],
        featured: false
    },

    {
        title: "Content Writing & Copywriting",
        slug: "content-writing-copywriting",
        tagline: "Write compelling content for websites, blogs, and ads",
        description: "Provide content writing services including blog posts, website copy, email campaigns, product descriptions, and SEO content for businesses and marketing agencies.",
        category: "Creative",
        industries: ["Digital Marketing & Growth", "E-commerce & Retail", "SaaS (Software as a Service)"],
        requiredSkills: ["Content Creation & Media", "Digital Marketing & Growth"],
        investmentRange: { min: 50, max: 500, currency: "USD" },
        timeCommitment: "10-20 hrs/week",
        difficulty: "Easy",
        viabilityScore: 8,
        competitionLevel: "High",
        successRate: 75,
        marketDemand: "High",
        expectedROI: { timeline: "1-3 months", percentage: 160 },
        pros: [
            "Very low startup cost",
            "Work from anywhere",
            "High demand",
            "Build portfolio quickly"
        ],
        cons: [
            "Competitive pricing pressure",
            "Requires constant client acquisition",
            "Tight deadlines"
        ],
        icon: "✍️",
        tags: ["writing", "content", "seo", "marketing", "remote"],
        featured: false
    },

    {
        title: "YouTube Channel & Content Creation",
        slug: "youtube-channel-content-creation",
        tagline: "Create videos and monetize through ads and sponsorships",
        description: "Start a YouTube channel in a niche you're passionate about (tech reviews, cooking, education, gaming, vlogs). Monetize through AdSense, sponsorships, and merchandise.",
        category: "Creative",
        industries: ["Entertainment & Streaming", "EdTech (Education)", "Gaming & Esports"],
        requiredSkills: ["Content Creation & Media"],
        investmentRange: { min: 300, max: 2000, currency: "USD" },
        timeCommitment: "20-40 hrs/week",
        difficulty: "Moderate",
        viabilityScore: 6,
        competitionLevel: "High",
        successRate: 45,
        marketDemand: "Trending",
        expectedROI: { timeline: "12-24 months", percentage: 300 },
        pros: [
            "Passive income potential",
            "Creative expression",
            "Global audience",
            "Multiple revenue streams"
        ],
        cons: [
            "Long time to monetize",
            "Algorithm dependency",
            "Requires consistency",
            "Equipment investment"
        ],
        icon: "🎥",
        tags: ["video", "content", "youtube", "creator", "passive-income"],
        featured: false
    },

    {
        title: "Digital Product Store (Templates, Courses)",
        slug: "digital-product-store",
        tagline: "Create and sell digital products online",
        description: "Build and sell digital products like Notion templates, resume templates, online courses, eBooks, design assets, or stock photos on platforms like Gumroad or your own website.",
        category: "Digital",
        industries: ["EdTech (Education)", "Digital Marketing & Growth"],
        requiredSkills: ["UI/UX & Product Design", "Content Creation & Media"],
        investmentRange: { min: 100, max: 1000, currency: "USD" },
        timeCommitment: "10-20 hrs/week",
        difficulty: "Moderate",
        viabilityScore: 8,
        competitionLevel: "Medium",
        successRate: 65,
        marketDemand: "High",
        expectedROI: { timeline: "3-6 months", percentage: 200 },
        pros: [
            "Sell once, earn repeatedly",
            "No inventory or shipping",
            "Scalable income",
            "Automated sales"
        ],
        cons: [
            "Requires upfront creation time",
            "Marketing needed",
            "Product updates required"
        ],
        icon: "📦",
        tags: ["digital-products", "passive-income", "online-store", "courses"],
        featured: true
    }
];

const seedBusinesses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📡 Connected to MongoDB');

        // Clear existing businesses
        await Business.deleteMany({});
        console.log('🗑️  Cleared existing businesses');

        // Insert new businesses
        const result = await Business.insertMany(businesses);
        console.log(`✅ Seeded ${result.length} businesses successfully!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding businesses:', error);
        process.exit(1);
    }
};

seedBusinesses();