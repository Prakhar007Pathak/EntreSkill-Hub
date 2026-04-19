import Roadmap from '../models/Roadmap.js';
import Business from '../models/Business.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const seedRoadmaps = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📡 Connected to MongoDB');

        // Clear existing roadmaps
        await Roadmap.deleteMany({});
        console.log('🗑️  Cleared existing roadmaps');

        // Get all businesses
        const businesses = await Business.find({});

        // Create roadmap for "Social Media Marketing Agency"
        const socialMediaBusiness = businesses.find(b => b.slug === 'social-media-marketing-agency');

        if (socialMediaBusiness) {
            await Roadmap.create({
                businessId: socialMediaBusiness._id,
                title: 'Social Media Marketing Agency Launch Plan',
                description: 'Complete step-by-step guide to launching and growing your social media marketing agency from scratch.',
                totalDuration: '12-16 weeks',
                prerequisites: [
                    'Basic understanding of social media platforms',
                    'Good communication skills',
                    'Computer with internet access',
                    'Willingness to learn and adapt'
                ],
                outcomes: [
                    'Fully operational social media agency',
                    '3-5 paying clients',
                    'Established service packages',
                    'Proven content creation workflow',
                    'Client management system in place'
                ],
                stages: [
                    {
                        stageNumber: 1,
                        title: 'Foundation & Market Research',
                        description: 'Understand the market, define your niche, and set up business basics',
                        duration: 'Week 1-2',
                        icon: '🎯',
                        tasks: [
                            {
                                title: 'Define Your Niche',
                                description: 'Choose 2-3 industries you want to focus on (e.g., restaurants, fitness, real estate)',
                                type: 'checklist',
                                estimatedTime: '3 hours',
                                tips: [
                                    'Pick industries you understand or are passionate about',
                                    'Research which niches have budget for social media',
                                    'Avoid overly saturated markets initially'
                                ],
                                order: 1
                            },
                            {
                                title: 'Research Competitors',
                                description: 'Identify 5-10 agencies in your niche and analyze their services, pricing, and positioning',
                                type: 'action',
                                estimatedTime: '4 hours',
                                tips: [
                                    'Check their websites, social media, and client reviews',
                                    'Note gaps in their services you could fill',
                                    'Study their pricing models'
                                ],
                                order: 2
                            },
                            {
                                title: 'Define Your Services',
                                description: 'Create 3 service packages (Starter, Growth, Premium) with clear deliverables',
                                type: 'document',
                                estimatedTime: '2 hours',
                                tips: [
                                    'Starter: Basic posting + engagement (3-5 posts/week)',
                                    'Growth: Content creation + ads + analytics',
                                    'Premium: Full-service management + strategy'
                                ],
                                order: 3
                            },
                            {
                                title: 'Set Your Pricing',
                                description: 'Research market rates and set competitive but profitable prices',
                                type: 'checklist',
                                estimatedTime: '2 hours',
                                tips: [
                                    'Starter: $300-500/month',
                                    'Growth: $800-1500/month',
                                    'Premium: $2000-5000/month',
                                    'Consider hourly rates for custom projects'
                                ],
                                order: 4
                            },
                            {
                                title: 'Register Your Business',
                                description: 'Choose a business name and register it (LLC recommended in US)',
                                type: 'action',
                                estimatedTime: '3 hours',
                                tips: [
                                    'Check domain availability before finalizing name',
                                    'Use services like LegalZoom or local registration',
                                    'Get an EIN from IRS (free)'
                                ],
                                order: 5
                            }
                        ],
                        milestoneReward: {
                            badge: 'Foundation Laid',
                            points: 50
                        }
                    },
                    {
                        stageNumber: 2,
                        title: 'Brand & Online Presence',
                        description: 'Create your agency brand and establish credibility online',
                        duration: 'Week 3-4',
                        icon: '🎨',
                        tasks: [
                            {
                                title: 'Design Your Brand Identity',
                                description: 'Create logo, choose colors, and define brand voice using Canva or hire on Fiverr',
                                type: 'action',
                                estimatedTime: '5 hours',
                                tips: [
                                    'Keep it simple and professional',
                                    'Use tools like Canva (free) or hire designer ($20-50)',
                                    'Create brand guidelines document'
                                ],
                                order: 1
                            },
                            {
                                title: 'Build Website/Landing Page',
                                description: 'Create a simple website showcasing services, pricing, and contact info',
                                type: 'action',
                                resourceUrl: 'https://www.wix.com',
                                estimatedTime: '6 hours',
                                tips: [
                                    'Use Wix, WordPress, or Carrd (easiest)',
                                    'Include: Services, Pricing, Portfolio, Contact',
                                    'Add testimonials section (even if empty initially)'
                                ],
                                order: 2
                            },
                            {
                                title: 'Set Up Social Media Profiles',
                                description: 'Create professional Instagram, LinkedIn, and Facebook pages for your agency',
                                type: 'checklist',
                                estimatedTime: '3 hours',
                                tips: [
                                    'Use consistent branding across all platforms',
                                    'Write compelling bio with clear CTA',
                                    'Post 5-10 pieces of content before going live'
                                ],
                                order: 3
                            },
                            {
                                title: 'Create Portfolio Samples',
                                description: 'Design 10-15 sample social media posts for your niche industries',
                                type: 'action',
                                estimatedTime: '8 hours',
                                tips: [
                                    'Create posts for imaginary clients in your niche',
                                    'Show variety: quotes, tips, promotions, behind-scenes',
                                    'Use these to demonstrate your skills to prospects'
                                ],
                                order: 4
                            },
                            {
                                title: 'Set Up Business Email',
                                description: 'Create professional email (yourname@youragency.com) using Google Workspace',
                                type: 'action',
                                estimatedTime: '1 hour',
                                tips: [
                                    'Google Workspace: $6/month',
                                    'Use email signature with branding',
                                    'Set up automated responses'
                                ],
                                order: 5
                            }
                        ],
                        milestoneReward: {
                            badge: 'Brand Builder',
                            points: 75
                        }
                    },
                    {
                        stageNumber: 3,
                        title: 'Tools & Systems Setup',
                        description: 'Implement tools for content creation, scheduling, and client management',
                        duration: 'Week 5-6',
                        icon: '🛠️',
                        tasks: [
                            {
                                title: 'Choose Content Creation Tools',
                                description: 'Set up Canva Pro for design and CapCut/InShot for video editing',
                                type: 'action',
                                estimatedTime: '2 hours',
                                tips: [
                                    'Canva Pro: $13/month (essential)',
                                    'CapCut: Free for video editing',
                                    'Learn basic design principles'
                                ],
                                order: 1
                            },
                            {
                                title: 'Set Up Scheduling Tools',
                                description: 'Install Meta Business Suite and consider Buffer/Hootsuite for multi-platform',
                                type: 'action',
                                estimatedTime: '2 hours',
                                tips: [
                                    'Meta Business Suite: Free (for FB/IG)',
                                    'Buffer free plan: Up to 3 channels',
                                    'Learn to schedule 1 week ahead'
                                ],
                                order: 2
                            },
                            {
                                title: 'Client Management System',
                                description: 'Set up simple CRM using Google Sheets or Notion',
                                type: 'document',
                                estimatedTime: '3 hours',
                                tips: [
                                    'Track: Client name, package, payment status, login details',
                                    'Create content approval workflow',
                                    'Set reminders for deliverables'
                                ],
                                order: 3
                            },
                            {
                                title: 'Analytics Dashboard Template',
                                description: 'Create reporting template to show monthly results to clients',
                                type: 'document',
                                estimatedTime: '3 hours',
                                tips: [
                                    'Track: Followers growth, engagement rate, reach, top posts',
                                    'Use Google Slides or Canva for visual reports',
                                    'Make it simple to update monthly'
                                ],
                                order: 4
                            },
                            {
                                title: 'Contract & Invoice Templates',
                                description: 'Create service agreement and invoice templates',
                                type: 'document',
                                estimatedTime: '2 hours',
                                tips: [
                                    'Use free templates from HoneyBook or Bonsai',
                                    'Include: Scope, deliverables, payment terms, cancellation policy',
                                    'Get it reviewed by lawyer (optional but recommended)'
                                ],
                                order: 5
                            }
                        ],
                        milestoneReward: {
                            badge: 'Systems Expert',
                            points: 100
                        }
                    },
                    {
                        stageNumber: 4,
                        title: 'Land Your First 3 Clients',
                        description: 'Implement proven strategies to get paying clients',
                        duration: 'Week 7-10',
                        icon: '🎯',
                        tasks: [
                            {
                                title: 'Create Outreach List',
                                description: 'Identify 50 potential clients in your niche with active but poorly managed social media',
                                type: 'checklist',
                                estimatedTime: '4 hours',
                                tips: [
                                    'Look for businesses with <1000 followers but clear potential',
                                    'Check if they post inconsistently or have low engagement',
                                    'Find decision-maker contact info (owner/marketing manager)'
                                ],
                                order: 1
                            },
                            {
                                title: 'Personalized Outreach Campaign',
                                description: 'Send custom emails/DMs to 10 prospects per day with audit of their social media',
                                type: 'action',
                                estimatedTime: '2 hours/day',
                                tips: [
                                    'Compliment something specific about their business',
                                    'Offer free mini-audit (3 quick wins)',
                                    'Don\'t pitch immediately - add value first'
                                ],
                                order: 2
                            },
                            {
                                title: 'Offer Free Trial Week',
                                description: 'Provide 1 week of free service (3 posts + engagement) to first 3 interested prospects',
                                type: 'action',
                                estimatedTime: '10 hours',
                                tips: [
                                    'This builds trust and shows results',
                                    'Document the process and results',
                                    'Convert to paid at end of week'
                                ],
                                order: 3
                            },
                            {
                                title: 'Network Locally',
                                description: 'Attend 3 local business networking events or chambers of commerce meetings',
                                type: 'action',
                                estimatedTime: '6 hours',
                                tips: [
                                    'Bring business cards',
                                    'Offer to help attendees for free initially',
                                    'Follow up within 24 hours'
                                ],
                                order: 4
                            },
                            {
                                title: 'Leverage Your Network',
                                description: 'Reach out to friends, family, former colleagues - ask for referrals',
                                type: 'action',
                                estimatedTime: '3 hours',
                                tips: [
                                    'Offer referral bonus ($50-100 per client)',
                                    'Create simple referral program',
                                    'Make it easy for them to share your info'
                                ],
                                order: 5
                            },
                            {
                                title: 'Close & Onboard First Client',
                                description: 'Sign contract, collect payment, and set up first month\'s content calendar',
                                type: 'checklist',
                                estimatedTime: '4 hours',
                                tips: [
                                    'Use contract template',
                                    'Collect 50% upfront or full month in advance',
                                    'Set clear expectations and communication schedule'
                                ],
                                order: 6
                            }
                        ],
                        milestoneReward: {
                            badge: 'Client Closer',
                            points: 150
                        }
                    },
                    {
                        stageNumber: 5,
                        title: 'Deliver Excellence',
                        description: 'Execute flawlessly for your first clients and build case studies',
                        duration: 'Week 11-14',
                        icon: '🚀',
                        tasks: [
                            {
                                title: 'Content Production Workflow',
                                description: 'Create monthly content calendars and batch-produce content weekly',
                                type: 'action',
                                estimatedTime: '15 hours/week',
                                tips: [
                                    'Plan full month at once',
                                    'Batch create all graphics in one day',
                                    'Schedule posts 1 week in advance',
                                    'Leave room for trending topics'
                                ],
                                order: 1
                            },
                            {
                                title: 'Daily Engagement',
                                description: 'Spend 30 mins/day engaging with followers and relevant accounts',
                                type: 'checklist',
                                estimatedTime: '30 mins/day',
                                tips: [
                                    'Respond to all comments within 24 hours',
                                    'Like and comment on target audience posts',
                                    'Use relevant hashtags'
                                ],
                                order: 2
                            },
                            {
                                title: 'Weekly Client Updates',
                                description: 'Send brief update every Friday with metrics and next week\'s plan',
                                type: 'action',
                                estimatedTime: '1 hour/week',
                                tips: [
                                    'Keep it short and visual',
                                    'Highlight wins (even small ones)',
                                    'Ask for feedback'
                                ],
                                order: 3
                            },
                            {
                                title: 'Collect Testimonials',
                                description: 'After 30 days, ask satisfied clients for video/written testimonial',
                                type: 'action',
                                estimatedTime: '2 hours',
                                tips: [
                                    'Make it easy - send them questions to answer',
                                    'Offer small discount for testimonial',
                                    'Use on website and in pitches'
                                ],
                                order: 4
                            },
                            {
                                title: 'Document Case Studies',
                                description: 'Create before/after case study for each client showing growth',
                                type: 'document',
                                estimatedTime: '3 hours',
                                tips: [
                                    'Show: Followers gained, engagement increase, best posts',
                                    'Include client quote',
                                    'Make visually appealing'
                                ],
                                order: 5
                            }
                        ],
                        milestoneReward: {
                            badge: 'Results Driver',
                            points: 125
                        }
                    },
                    {
                        stageNumber: 6,
                        title: 'Scale & Systemize',
                        description: 'Grow to 10+ clients and build sustainable business systems',
                        duration: 'Week 15+',
                        icon: '📈',
                        tasks: [
                            {
                                title: 'Hire Your First Contractor',
                                description: 'Find freelance graphic designer or content writer to handle overflow',
                                type: 'action',
                                estimatedTime: '5 hours',
                                tips: [
                                    'Use Upwork or Fiverr',
                                    'Start with small test project',
                                    'Pay per project initially, then retainer'
                                ],
                                order: 1
                            },
                            {
                                title: 'Create SOPs (Standard Operating Procedures)',
                                description: 'Document your processes so you can delegate effectively',
                                type: 'document',
                                estimatedTime: '8 hours',
                                tips: [
                                    'Document: Content creation, client onboarding, reporting',
                                    'Use Loom videos to show processes',
                                    'Update as you refine'
                                ],
                                order: 2
                            },
                            {
                                title: 'Implement Referral Program',
                                description: 'Formalize referral incentives and automate tracking',
                                type: 'action',
                                estimatedTime: '3 hours',
                                tips: [
                                    'Offer 10% discount to referrer and referee',
                                    'Create referral cards/links',
                                    'Track in CRM'
                                ],
                                order: 3
                            },
                            {
                                title: 'Run Paid Ads for Agency',
                                description: 'Invest $200-500 in Facebook/Instagram ads targeting local businesses',
                                type: 'action',
                                estimatedTime: '6 hours',
                                tips: [
                                    'Target business owners in your niche',
                                    'Offer free audit as lead magnet',
                                    'A/B test ad creative and copy'
                                ],
                                order: 4
                            },
                            {
                                title: 'Build Strategic Partnerships',
                                description: 'Partner with web designers, photographers, business consultants for cross-referrals',
                                type: 'action',
                                estimatedTime: '4 hours',
                                tips: [
                                    'They have same target clients',
                                    'Create win-win referral agreement',
                                    'Meet quarterly to discuss leads'
                                ],
                                order: 5
                            },
                            {
                                title: 'Optimize Pricing & Upsell',
                                description: 'Increase rates for new clients and upsell existing clients',
                                type: 'action',
                                estimatedTime: '2 hours',
                                tips: [
                                    'Raise rates 20-30% after first 5 clients',
                                    'Offer add-ons: ads management, content creation, consulting',
                                    'Grandfather existing clients or give 90-day notice'
                                ],
                                order: 6
                            }
                        ],
                        milestoneReward: {
                            badge: 'Agency Owner',
                            points: 200
                        }
                    }
                ]
            });
        }

        // Create roadmap for "Freelance Web Development"
        const webDevBusiness = businesses.find(b => b.slug === 'freelance-web-development');

        if (webDevBusiness) {
            await Roadmap.create({
                businessId: webDevBusiness._id,
                title: 'Freelance Web Development Launch Plan',
                description: 'Complete guide to starting a profitable web development freelance business',
                totalDuration: '8-12 weeks',
                prerequisites: [
                    'HTML, CSS, JavaScript knowledge',
                    'Understanding of at least one framework (React, Vue, etc.)',
                    'Portfolio with 2-3 projects',
                    'Computer and internet access'
                ],
                outcomes: [
                    'Active freelance web development business',
                    '3-5 paying clients',
                    'Professional portfolio website',
                    'Established pricing structure',
                    'Client acquisition system'
                ],
                stages: [
                    {
                        stageNumber: 1,
                        title: 'Portfolio & Positioning',
                        description: 'Build your portfolio and define your niche',
                        duration: 'Week 1-2',
                        icon: '💼',
                        tasks: [
                            {
                                title: 'Build Portfolio Website',
                                description: 'Create a stunning portfolio showcasing your best work',
                                type: 'action',
                                estimatedTime: '10 hours',
                                tips: [
                                    'Use Next.js or React for modern stack',
                                    'Show 3-5 best projects with case studies',
                                    'Include: About, Services, Portfolio, Contact, Blog'
                                ],
                                order: 1
                            },
                            {
                                title: 'Define Your Niche',
                                description: 'Choose 1-2 specializations (e.g., e-commerce, SaaS, landing pages)',
                                type: 'checklist',
                                estimatedTime: '3 hours',
                                tips: [
                                    'Pick what you enjoy and what pays well',
                                    'Research demand in each niche',
                                    'Stand out by specializing'
                                ],
                                order: 2
                            },
                            {
                                title: 'Set Your Rates',
                                description: 'Research market rates and establish your pricing',
                                type: 'action',
                                estimatedTime: '2 hours',
                                tips: [
                                    'Beginner: $30-50/hour or $1500-3000/project',
                                    'Intermediate: $60-100/hour or $3000-8000/project',
                                    'Always charge per project, not hourly to clients'
                                ],
                                order: 3
                            }
                        ],
                        milestoneReward: {
                            badge: 'Portfolio Pro',
                            points: 50
                        }
                    },
                    {
                        stageNumber: 2,
                        title: 'Platform Presence',
                        description: 'Set up profiles on freelance platforms',
                        duration: 'Week 3-4',
                        icon: '🌐',
                        tasks: [
                            {
                                title: 'Create Upwork Profile',
                                description: 'Build optimized profile with portfolio and clear services',
                                type: 'action',
                                estimatedTime: '3 hours',
                                tips: [
                                    'Professional photo',
                                    'Clear headline with specialization',
                                    'Detailed skills and portfolio'
                                ],
                                order: 1
                            },
                            {
                                title: 'Apply to 10 Jobs Daily',
                                description: 'Submit personalized proposals to relevant projects',
                                type: 'checklist',
                                estimatedTime: '2 hours/day',
                                tips: [
                                    'Customize each proposal',
                                    'Address client\'s specific needs',
                                    'Show relevant past work'
                                ],
                                order: 2
                            },
                            {
                                title: 'Land First Client',
                                description: 'Close your first freelance project',
                                type: 'action',
                                estimatedTime: 'Varies',
                                tips: [
                                    'May take 20-50 applications',
                                    'Consider starting with lower rate',
                                    'Focus on getting 5-star review'
                                ],
                                order: 3
                            }
                        ],
                        milestoneReward: {
                            badge: 'First Client',
                            points: 100
                        }
                    }
                ]
            });
        }

        const count = await Roadmap.countDocuments();
        console.log(`✅ Seeded ${count} roadmaps successfully!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding roadmaps:', error);
        process.exit(1);
    }
};

seedRoadmaps();