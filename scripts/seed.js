/**
 * Seed Yaclam CMS — settings, pages, entities
 * Run: npm run seed
 * First admin: POST /api/users/admin/bootstrap
 */
require("dotenv").config();
const db = require("../config/db");
const Settings = require("../models/settings.model");
const Footer = require("../models/footer.model");
const Page = require("../models/page.model");
const Course = require("../models/course.model");
const Roadmap = require("../models/roadmap.model");
const Scholarship = require("../models/scholarship.model");
const BlogPost = require("../models/blog_post.model");

async function seed() {
  await db.connectDB();
  console.log("Seeding Yaclam CMS...");

  await Settings.findOneAndUpdate(
    { del_status: "Live" },
    {
      siteName: "Yaclam",
      siteNameArabic: "يعلم",
      siteTagline: "Learn Without Limits",
      logo: {
        isVisible: true,
        text: {
          mark: "ي",
          name: "Yaclam",
          highlight: ".",
          isVisible: true,
        },
        picture: {
          light: "/uploads/logo-light.svg",
          dark: "/uploads/logo-dark.svg",
          alt: "Yaclam",
          isVisible: true,
        },
      },
      favicon: "/uploads/favicon.ico",
      contact: {
        email: "hello@yaclam.com",
        phone: "+353 1 234 5678",
        location: "Dublin, Ireland · Serving learners worldwide",
      },
      socials: {
        facebook: "https://facebook.com/yaclam",
        twitter: "https://twitter.com/yaclam",
        linkedin: "https://linkedin.com/company/yaclam",
        youtube: "https://youtube.com/yaclam",
        instagram: "https://instagram.com/yaclam",
      },
      seo: {
        title: "Yaclam (يعلم) — Learn Without Limits",
        description:
          "Yaclam is the leading Somali-language e-learning platform. Master practical skills, earn certificates, discover scholarships and advance your career.",
        keywords: ["Somali courses", "e-learning Somali", "scholarships", "Yaclam"],
      },
      isVisible: true,
      del_status: "Live",
    },
    { upsert: true, new: true }
  );

  await Footer.findOneAndUpdate(
    { del_status: "Live" },
    {
      siteName: "Yaclam",
      siteNameArabic: "يعلم",
      logo: {
        isVisible: true,
        text: {
          mark: "ي",
          name: "Yaclam",
          highlight: ".",
          isVisible: true,
        },
      },
      socials: {
        facebook: "https://facebook.com/yaclam",
        twitter: "https://twitter.com/yaclam",
        linkedin: "https://linkedin.com/company/yaclam",
        youtube: "https://youtube.com/yaclam",
        instagram: "https://instagram.com/yaclam",
      },
      footer: {
        description:
          "Empowering Somali learners worldwide through accessible, high-quality education in the language they understand best. Learn without limits.",
        copyright: "© 2026 Yaclam (يعلم). All rights reserved.",
        tagline: "Made for the Somali ummah · Learn Without Limits.",
        columns: [
          {
            title: "Learn",
            links: [
              { label: "All Courses", url: "/courses", isVisible: true },
              { label: "Career Roadmaps", url: "/roadmaps", isVisible: true },
              { label: "Scholarships", url: "/scholarships", isVisible: true },
              { label: "Blog", url: "/blog", isVisible: true },
            ],
            isVisible: true,
          },
          {
            title: "Company",
            links: [
              { label: "About", url: "/about", isVisible: true },
              { label: "Contact", url: "/contact", isVisible: true },
              { label: "Become Instructor", url: "/register", isVisible: true },
              { label: "Dashboard", url: "/dashboard", isVisible: true },
            ],
            isVisible: true,
          },
          {
            title: "Support",
            links: [
              { label: "Help Center", url: "/contact", isVisible: true },
              { label: "FAQ", url: "/about", isVisible: true },
              { label: "Privacy Policy", url: "/about", isVisible: true },
              { label: "Terms of Service", url: "/about", isVisible: true },
            ],
            isVisible: true,
          },
        ],
      },
      isVisible: true,
      del_status: "Live",
    },
    { upsert: true, new: true }
  );

  const homeSections = [
    {
      type: "hero",
      data: {
        quoteArabic: "قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ",
        quoteReference: "Are those who know equal to those who do not know?",
        title: "Learn Skills. Build Careers. Create Opportunities.",
        description:
          "Master practical skills, earn certificates, discover scholarships, and advance your career through expert-led Somali-language education.",
        primaryButton: { label: "Start Learning", url: "/register", isVisible: true },
        secondaryButton: { label: "Explore Courses", url: "/courses", isVisible: true },
        stats: [
          { value: "10K+", label: "Learners", isVisible: true },
          { value: "50+", label: "Courses", isVisible: true },
          { value: "200+", label: "Scholarships", isVisible: true },
          { value: "50+", label: "Career Paths", isVisible: true },
        ],
      },
    },
    {
      type: "categories",
      data: {
        eyebrow: "Browse",
        title: "Find your field",
        subtitle: "Explore practical, job-ready skills across the disciplines that matter most.",
      },
    },
    {
      type: "featuredCourses",
      data: {
        title: "Featured Courses",
        subtitle: "Hand-picked, top-rated programmes loved by thousands of learners.",
        courseSlugs: [
          "power-bi-data-analytics-mastery",
          "full-stack-web-development-with-next-js",
          "python-for-data-analysis",
        ],
      },
    },
    {
      type: "whyYaclam",
      data: {
        eyebrow: "Why Yaclam",
        title: "Education built for you",
        subtitle: "Everything you need to learn, get certified and move your career forward.",
        items: [
          {
            title: "Learn in Somali",
            description:
              "Complex skills explained in your mother tongue, with English technical terms — the way you actually understand best.",
          },
          {
            title: "Verified Certificates",
            description: "Earn shareable certificates with QR verification to prove your skills to employers.",
          },
          {
            title: "Career Roadmaps",
            description: "Clear, step-by-step paths from beginner to hired — no more guessing what to learn next.",
          },
          {
            title: "Scholarship Access",
            description: "A live database of funded opportunities plus masterclasses on how to win them.",
          },
        ],
      },
    },
    {
      type: "featuredScholarships",
      data: {
        title: "Scholarships database",
        subtitle: "Fully and partially funded opportunities, updated and explained — apply with confidence.",
        scholarshipSlugs: ["chevening-scholarship", "turkiye-burslari-turkiye-scholarships", "daad-scholarships"],
      },
    },
    {
      type: "featuredBlogs",
      data: {
        title: "Career Articles",
        subtitle: "Guides and insights for Somali learners.",
        blogSlugs: [
          "how-to-become-a-data-analyst-in-2026-complete-roadmap",
          "10-fully-funded-scholarships-for-somali-students",
        ],
      },
    },
    {
      type: "testimonials",
      data: {
        eyebrow: "Learners",
        title: "Real outcomes",
        subtitle: "From first lesson to first job offer — here is what learners say.",
        items: [
          {
            name: "Hodan A.",
            role: "Data Analyst, Dublin",
            text: "I learned Power BI in Somali first, then practised in English. Within five months I landed my first analyst role.",
            initials: "HA",
          },
          {
            name: "Yusuf M.",
            role: "CS Student, Mogadishu",
            text: "The career roadmaps gave me a clear path. No more guessing what to learn next.",
            initials: "YM",
          },
        ],
      },
    },
    {
      type: "cta",
      data: {
        title: "Your future is one decision away",
        description: "Join thousands of Somali learners building skills, earning certificates and changing their lives.",
        primaryButton: { label: "Create free account", url: "/register", isVisible: true },
        secondaryButton: { label: "Browse courses", url: "/courses", isVisible: true },
      },
    },
  ];

  await Page.findOneAndUpdate(
    { pageKey: "home" },
    {
      pageKey: "home",
      slug: "/",
      title: "Home",
      status: "published",
      sections: homeSections,
      isVisible: true,
      del_status: "Live",
    },
    { upsert: true, new: true }
  );

  await Page.findOneAndUpdate(
    { pageKey: "about" },
    {
      pageKey: "about",
      slug: "/about",
      title: "About Yaclam",
      status: "published",
      sections: [
        {
          type: "pageHeader",
          data: {
            title: "About Yaclam",
            subtitle:
              "The largest Somali-language learning ecosystem — built to make world-class education accessible in the language learners understand best.",
          },
        },
        {
          type: "story",
          data: {
            eyebrow: "Our Story",
            title: "Knowledge, in your language.",
            paragraphs: [
              "Yaclam (يعلم) exists because talent is everywhere, but access is not. Millions of Somali learners are held back not by ability, but by a lack of high-quality education in a language they fully understand.",
              "We teach practical, job-ready skills — data, technology, finance, design — alongside the scholarship and career guidance learners need to turn knowledge into opportunity.",
            ],
            ctaButton: { label: "Join Yaclam", url: "/register", isVisible: true },
          },
        },
        {
          type: "values",
          data: {
            items: [
              { title: "Mission", description: "Empower Somali learners worldwide through accessible, high-quality education." },
              { title: "Vision", description: "Become the largest Somali-language learning platform globally." },
              { title: "Values", description: "Quality without compromise, dignity in access, and lasting impact." },
              { title: "Ecosystem", description: "Courses, scholarships, roadmaps and certificates in one trusted place." },
            ],
          },
        },
      ],
      isVisible: true,
      del_status: "Live",
    },
    { upsert: true, new: true }
  );

  await Page.findOneAndUpdate(
    { pageKey: "contact" },
    {
      pageKey: "contact",
      slug: "/contact",
      title: "Contact",
      status: "published",
      sections: [
        {
          type: "pageHeader",
          data: {
            title: "Get in touch",
            subtitle: "Questions about courses, scholarships or partnerships? We'd love to hear from you.",
          },
        },
        {
          type: "contactForm",
          data: {
            fields: ["firstName", "lastName", "email", "subject", "message"],
            submitButton: { label: "Send message", isVisible: true },
          },
        },
      ],
      isVisible: true,
      del_status: "Live",
    },
    { upsert: true, new: true }
  );

  const courses = [
    {
      title: "Power BI & Data Analytics Mastery",
      slug: "power-bi-data-analytics-mastery",
      description: "A practical, project-based course taught in Somali with English technical terms.",
      category: "data",
      instructorName: "Abdikarim Mataan",
      level: "Intermediate",
      duration: "32 hours",
      durationHours: 32,
      price: 49,
      isFeatured: true,
      thumbnail: "",
    },
    {
      title: "Full-Stack Web Development with Next.js",
      slug: "full-stack-web-development-with-next-js",
      description: "Build complete web applications from front-end to back-end.",
      category: "dev",
      instructorName: "Eng. Mohamud Ali",
      level: "Advanced",
      duration: "56 hours",
      durationHours: 56,
      price: 79,
      isFeatured: true,
      thumbnail: "",
    },
    {
      title: "Python for Data Analysis",
      slug: "python-for-data-analysis",
      description: "Learn Python for data wrangling, analysis and visualization.",
      category: "data",
      instructorName: "Eng. Mohamud Ali",
      level: "Beginner",
      duration: "24 hours",
      durationHours: 24,
      price: 0,
      isFree: true,
      isFeatured: true,
      thumbnail: "",
    },
  ];

  for (const c of courses) {
    await Course.findOneAndUpdate(
      { slug: c.slug },
      { ...c, isPublished: true, isVisible: true, status: true },
      { upsert: true }
    );
  }

  await Scholarship.findOneAndUpdate(
    { slug: "chevening-scholarship" },
    {
      name: "Chevening Scholarship",
      title: "Chevening Scholarship",
      slug: "chevening-scholarship",
      provider: "UK Government (FCDO)",
      country: "United Kingdom",
      level: "Masters",
      funding: "Full",
      flag: "🇬🇧",
      deadline: "Applications open Aug, close early Oct",
      description: "The UK government's flagship scholarship for emerging leaders.",
      isFeatured: true,
      isPublished: true,
      isVisible: true,
      status: true,
    },
    { upsert: true }
  );

  await Scholarship.findOneAndUpdate(
    { slug: "turkiye-burslari-turkiye-scholarships" },
    {
      name: "Türkiye Bursları (Türkiye Scholarships)",
      title: "Türkiye Bursları",
      slug: "turkiye-burslari-turkiye-scholarships",
      provider: "Government of Türkiye",
      country: "Türkiye",
      level: "Bachelor / Masters / PhD",
      funding: "Full",
      flag: "🇹🇷",
      deadline: "Typically Jan–Feb",
      description: "Fully funded government scholarship covering all study levels.",
      isFeatured: true,
      isPublished: true,
      isVisible: true,
      status: true,
    },
    { upsert: true }
  );

  await Scholarship.findOneAndUpdate(
    { slug: "daad-scholarships" },
    {
      name: "DAAD Scholarships",
      title: "DAAD Scholarships",
      slug: "daad-scholarships",
      provider: "German Academic Exchange Service",
      country: "Germany",
      level: "Masters / PhD",
      funding: "Full",
      flag: "🇩🇪",
      deadline: "Typically Aug–Oct",
      description: "Germany's national funding body for international postgraduate study.",
      isFeatured: true,
      isPublished: true,
      isVisible: true,
      status: true,
    },
    { upsert: true }
  );

  await BlogPost.findOneAndUpdate(
    { slug: "how-to-become-a-data-analyst-in-2026-complete-roadmap" },
    {
      title: "How to Become a Data Analyst in 2026 (Complete Roadmap)",
      slug: "how-to-become-a-data-analyst-in-2026-complete-roadmap",
      excerpt: "Data analysis is the fastest-growing non-coding path into tech.",
      content: "Becoming a data analyst is not about collecting certificates — it is about building skills deeply.",
      category: "Careers",
      authorName: "Abdikarim Mataan",
      readTime: 9,
      publishedDate: "2026-05-20",
      status: "published",
      publishedAt: new Date("2026-05-20"),
      isVisible: true,
    },
    { upsert: true }
  );

  await BlogPost.findOneAndUpdate(
    { slug: "10-fully-funded-scholarships-for-somali-students" },
    {
      title: "10 Fully Funded Scholarships for Somali Students",
      slug: "10-fully-funded-scholarships-for-somali-students",
      excerpt: "From Chevening to Türkiye Bursları — apply with confidence.",
      content: "Funded study abroad is more accessible than most students realise.",
      category: "Scholarships",
      authorName: "Mataan Scholarships",
      readTime: 11,
      publishedDate: "2026-04-28",
      status: "published",
      publishedAt: new Date("2026-04-28"),
      isVisible: true,
    },
    { upsert: true }
  );

  await Roadmap.findOneAndUpdate(
    { slug: "data-analyst" },
    {
      title: "Data Analyst",
      slug: "data-analyst",
      description: "Turn raw data into business decisions.",
      skills: ["Excel", "SQL", "Power BI", "Python", "Statistics"],
      isPublished: true,
      isVisible: true,
      sortOrder: 0,
      status: true,
    },
    { upsert: true }
  );

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
