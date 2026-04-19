import Resource from '../models/Resource.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const resources = [
    // ─── VIDEOS ───────────────────────────────────────────
    {
        title: 'How to Validate Your Business Idea in 24 Hours',
        slug: 'validate-business-idea-24-hours',
        description: 'Learn the exact framework to test if your business idea has real demand before investing time and money. Covers customer interviews, landing page tests, and pre-selling.',
        type: 'video',
        category: 'Business Basics',
        level: 'Beginner',
        duration: '18 mins',
        thumbnail: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400',
        resourceUrl: 'https://www.youtube.com/watch?v=example1',
        tags: ['validation', 'startup', 'idea', 'beginner'],
        instructor: {
            name: 'Rahul Sharma',
            bio: 'Serial entrepreneur with 3 successful exits'
        },
        featured: true,
        estimatedPoints: 15,
        isAdminCurated: true,
        status: 'approved',
    },
    {
        title: 'Social Media Marketing for Beginners (Full Course)',
        slug: 'social-media-marketing-beginners-course',
        description: 'Complete beginner guide to building a social media presence for your business. Covers Instagram, LinkedIn, Facebook, and content strategy.',
        type: 'video',
        category: 'Marketing',
        level: 'Beginner',
        duration: '45 mins',
        thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400',
        resourceUrl: 'https://www.youtube.com/watch?v=example2',
        tags: ['social media', 'marketing', 'instagram', 'beginner'],
        instructor: {
            name: 'Priya Patel',
            bio: 'Digital marketing expert, 200+ clients served'
        },
        featured: true,
        estimatedPoints: 20,
        isAdminCurated: true,
        status: 'approved',
    },
    {
        title: 'Financial Planning for Micro-Businesses',
        slug: 'financial-planning-micro-businesses',
        description: 'Understand the basics of business finance - cash flow, profit margins, pricing strategies, and simple bookkeeping for small business owners.',
        type: 'video',
        category: 'Finance',
        level: 'Beginner',
        duration: '32 mins',
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
        resourceUrl: 'https://www.youtube.com/watch?v=example3',
        tags: ['finance', 'budgeting', 'cashflow', 'pricing'],
        instructor: {
            name: 'Amit Verma',
            bio: 'CA and Small Business Financial Advisor'
        },
        featured: false,
        estimatedPoints: 15,
        isAdminCurated: true,
        status: 'approved',
    },
    {
        title: 'How to Get Your First 10 Clients',
        slug: 'get-first-10-clients',
        description: 'Proven outreach strategies, networking tips, and closing techniques to land your first paying clients. Includes cold email templates and pitch scripts.',
        type: 'video',
        category: 'Sales',
        level: 'Beginner',
        duration: '28 mins',
        thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        resourceUrl: 'https://www.youtube.com/watch?v=example4',
        tags: ['sales', 'clients', 'outreach', 'networking'],
        instructor: {
            name: 'Sneha Reddy',
            bio: 'Sales coach, helped 500+ freelancers scale'
        },
        featured: true,
        estimatedPoints: 20,
        isAdminCurated: true,
        status: 'approved',
    },
    {
        title: 'Building a Personal Brand from Zero',
        slug: 'building-personal-brand-zero',
        description: 'Step-by-step guide to building a personal brand that attracts clients and opportunities. Covers LinkedIn optimization, content creation, and thought leadership.',
        type: 'video',
        category: 'Marketing',
        level: 'Intermediate',
        duration: '38 mins',
        thumbnail: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400',
        resourceUrl: 'https://www.youtube.com/watch?v=example5',
        tags: ['personal brand', 'linkedin', 'content', 'visibility'],
        instructor: {
            name: 'Vikram Nair',
            bio: '100K+ LinkedIn followers, brand strategist'
        },
        featured: false,
        estimatedPoints: 15,
        isAdminCurated: true,
        status: 'approved',
    },

    // ─── ARTICLES ──────────────────────────────────────────
    {
        title: 'The Ultimate Guide to Registering Your Business in India',
        slug: 'register-business-india-guide',
        description: 'Complete step-by-step guide covering Sole Proprietorship, Partnership, LLP, and Private Limited Company registration. Includes costs, timelines, and required documents.',
        type: 'article',
        category: 'Legal',
        level: 'Beginner',
        duration: '12 mins read',
        thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
        resourceUrl: '#',
        content: `
# How to Register Your Business in India

Starting a business is exciting, but getting the legal structure right is crucial...

## Step 1: Choose Your Business Structure
- **Sole Proprietorship**: Simplest, lowest cost, unlimited liability
- **Partnership**: 2+ partners, shared liability  
- **LLP**: Limited liability, flexible structure
- **Private Limited**: Best for scaling, investor-friendly

## Step 2: Choose a Business Name
- Check MCA21 portal for name availability
- Avoid restricted words
- Register trademark if needed

## Step 3: Get Required Registrations
- PAN Card (mandatory)
- GST Registration (if turnover > ₹40L)
- MSME/Udyam Registration (recommended)
- Professional Tax Registration

## Step 4: Open a Business Bank Account
- Required documents: Registration certificate, PAN, Address proof
- Recommended banks: HDFC, ICICI, Kotak for startups

## Key Costs:
- Sole Proprietorship: ₹0 - ₹2,000
- LLP: ₹5,000 - ₹15,000
- Pvt Ltd: ₹10,000 - ₹30,000
        `,
        tags: ['legal', 'registration', 'india', 'startup', 'compliance'],
        instructor: {
            name: 'EntreSkill Editorial',
            bio: 'Curated by our expert team'
        },
        featured: true,
        estimatedPoints: 10,
        isAdminCurated: true,
        status: 'approved',
    },
    {
        title: '10 Pricing Strategies That Actually Work for Freelancers',
        slug: 'pricing-strategies-freelancers',
        description: 'Stop undercharging for your services. Learn value-based pricing, package pricing, retainer models, and how to raise your rates without losing clients.',
        type: 'article',
        category: 'Finance',
        level: 'Intermediate',
        duration: '8 mins read',
        thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
        resourceUrl: '#',
        tags: ['pricing', 'freelance', 'revenue', 'value'],
        instructor: {
            name: 'EntreSkill Editorial',
            bio: 'Curated by our expert team'
        },
        featured: false,
        estimatedPoints: 10,
        isAdminCurated: true,
        status: 'approved',
    },
    {
        title: 'SEO Basics Every Small Business Owner Must Know',
        slug: 'seo-basics-small-business',
        description: 'Learn how to get your business found on Google without paying for ads. Covers keyword research, on-page SEO, local SEO, and Google My Business setup.',
        type: 'article',
        category: 'Marketing',
        level: 'Beginner',
        duration: '10 mins read',
        thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400',
        resourceUrl: '#',
        tags: ['seo', 'google', 'marketing', 'organic', 'local'],
        instructor: {
            name: 'EntreSkill Editorial',
            bio: 'Curated by our expert team'
        },
        featured: false,
        estimatedPoints: 10,
        isAdminCurated: true,
        status: 'approved',
    },
    {
        title: 'How to Write a Business Plan in One Weekend',
        slug: 'write-business-plan-weekend',
        description: 'A practical, no-fluff guide to writing a business plan that actually gets read. Includes templates for executive summary, market analysis, and financial projections.',
        type: 'article',
        category: 'Business Basics',
        level: 'Beginner',
        duration: '15 mins read',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        resourceUrl: '#',
        tags: ['business plan', 'planning', 'strategy', 'finance'],
        instructor: {
            name: 'EntreSkill Editorial',
            bio: 'Curated by our expert team'
        },
        featured: true,
        estimatedPoints: 10,
        isAdminCurated: true,
        status: 'approved',
    },

    // ─── CHECKLISTS ────────────────────────────────────────
    {
        title: 'Pre-Launch Checklist for Any Business',
        slug: 'pre-launch-checklist-any-business',
        description: 'The ultimate 30-point checklist to make sure you have everything ready before launching your business. Never miss a critical step.',
        type: 'checklist',
        category: 'Business Basics',
        level: 'Beginner',
        duration: '5 mins',
        thumbnail: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400',
        checklistItems: [
            'Business name registered',
            'Domain name purchased',
            'Business email set up',
            'Bank account opened',
            'GST registration done (if applicable)',
            'Website/landing page live',
            'Social media profiles created',
            'Service packages defined',
            'Pricing finalized',
            'Contract template ready',
            'Invoice template created',
            'Payment gateway set up (Razorpay/PayPal)',
            'First 10 prospects identified',
            'Elevator pitch practiced',
            'Portfolio/samples ready',
            'Tools and software set up',
            'Client onboarding process defined',
            'Support email/phone active',
            'Privacy policy added to website',
            'Terms of service added',
            'Business cards designed',
            'LinkedIn profile updated',
            'First content piece published',
            'Analytics tracking installed',
            'Backup and security set up',
            'Emergency fund of 3 months ready',
            'Mentor or advisor identified',
            'First client outreach sent',
            'Follow-up system in place',
            'Launch announcement planned'
        ],
        tags: ['launch', 'checklist', 'startup', 'preparation'],
        instructor: {
            name: 'EntreSkill Team',
            bio: 'Compiled from 500+ successful launches'
        },
        featured: true,
        estimatedPoints: 10,
        isAdminCurated: true,
        status: 'approved',
    },
    {
        title: 'Monthly Business Health Checklist',
        slug: 'monthly-business-health-checklist',
        description: 'Run through this checklist every month to keep your business on track. Covers finances, marketing, operations, and client relationships.',
        type: 'checklist',
        category: 'Operations',
        level: 'Intermediate',
        duration: '10 mins',
        thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400',
        checklistItems: [
            'Review monthly revenue vs target',
            'Check cash flow statement',
            'Follow up on unpaid invoices',
            'Review top 3 performing services',
            'Analyze social media metrics',
            'Respond to all pending reviews',
            'Check website analytics',
            'Update portfolio with new work',
            'Reach out to 5 past clients',
            'Send 10 new outreach messages',
            'Review and update pricing',
            'Check software subscriptions',
            'Back up all client files',
            'Update CRM/spreadsheet',
            'Plan next month content',
            'Schedule 1 learning session',
            'Review business goals',
            'Check competitor updates',
            'Ask 2 clients for testimonials',
            'Celebrate one win!'
        ],
        tags: ['monthly', 'operations', 'health check', 'management'],
        instructor: {
            name: 'EntreSkill Team',
            bio: 'Compiled from 500+ successful launches'
        },
        featured: false,
        estimatedPoints: 10,
        isAdminCurated: true,
        status: 'approved',
    },
    {
        title: 'Social Media Content Checklist',
        slug: 'social-media-content-checklist',
        description: 'Use this checklist before publishing any social media post to ensure quality, consistency, and engagement potential.',
        type: 'checklist',
        category: 'Marketing',
        level: 'Beginner',
        duration: '3 mins',
        thumbnail: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400',
        checklistItems: [
            'Caption is clear and engaging',
            'Call-to-action included',
            'Relevant hashtags added (5-10)',
            'Image/video is high quality',
            'Brand colors used correctly',
            'Logo or watermark added',
            'Spelling and grammar checked',
            'Mentions and tags added',
            'Best time to post checked',
            'Link in bio updated (if needed)',
            'Story version planned',
            'Engagement response time set'
        ],
        tags: ['social media', 'content', 'checklist', 'quality'],
        instructor: {
            name: 'EntreSkill Team',
            bio: 'Compiled from 500+ successful launches'
        },
        featured: false,
        estimatedPoints: 10,
        isAdminCurated: true,
        status: 'approved',
    },

    // ─── GUIDES ───────────────────────────────────────────
    {
        title: 'Complete Guide to Cold Email Outreach',
        slug: 'cold-email-outreach-guide',
        description: 'Master the art of cold emailing to win clients. Includes proven templates, subject line formulas, follow-up sequences, and tools to scale your outreach.',
        type: 'guide',
        category: 'Sales',
        level: 'Intermediate',
        duration: '20 mins read',
        thumbnail: 'https://images.unsplash.com/photo-1596526131083-e8c633064dbc?w=400',
        resourceUrl: '#',
        tags: ['cold email', 'outreach', 'sales', 'templates', 'clients'],
        instructor: {
            name: 'EntreSkill Editorial',
            bio: 'Curated by our expert team'
        },
        featured: true,
        estimatedPoints: 15,
        isAdminCurated: true,
        status: 'approved',
    },
    {
        title: 'Mindset Mastery for Entrepreneurs',
        slug: 'mindset-mastery-entrepreneurs',
        description: 'Overcome self-doubt, fear of failure, and imposter syndrome. Build the mental resilience needed to push through challenges and build a successful business.',
        type: 'guide',
        category: 'Mindset',
        level: 'Beginner',
        duration: '15 mins read',
        thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
        resourceUrl: '#',
        tags: ['mindset', 'motivation', 'confidence', 'growth'],
        instructor: {
            name: 'EntreSkill Editorial',
            bio: 'Curated by our expert team'
        },
        featured: false,
        estimatedPoints: 10,
        isAdminCurated: true,
        status: 'approved',
    },
    {
        title: 'Tech Stack Guide for Non-Technical Founders',
        slug: 'tech-stack-guide-non-technical-founders',
        description: 'Choose the right tools to run your business without writing code. Covers website builders, CRMs, payment tools, automation, and collaboration software.',
        type: 'guide',
        category: 'Technology',
        level: 'Beginner',
        duration: '18 mins read',
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
        resourceUrl: '#',
        tags: ['tech', 'tools', 'no-code', 'software', 'automation'],
        instructor: {
            name: 'EntreSkill Editorial',
            bio: 'Curated by our expert team'
        },
        featured: false,
        estimatedPoints: 10,
        isAdminCurated: true,
        status: 'approved',
    }
];

const seedResources = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📡 Connected to MongoDB');

        // Clear existing resources
        await Resource.deleteMany({});
        console.log('🗑️  Cleared existing resources');

        // Insert new resources
        const result = await Resource.insertMany(resources);
        console.log(`✅ Seeded ${result.length} resources successfully!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding resources:', error);
        process.exit(1);
    }
};

seedResources();