/**
 * Generate Yaclam Postman collection (A2P / jigjiga rental format)
 * Run: node scripts/generate-postman.js
 */
const fs = require("fs");
const path = require("path");

const baseUrl = "http://localhost:9000/api";

const variables = [
  { key: "baseUrl", value: baseUrl },
  { key: "accessToken", value: "" },
  { key: "userId", value: "" },
  { key: "settingsId", value: "" },
  { key: "homeId", value: "" },
  { key: "homeSectionsId", value: "" },
  { key: "coursesPageId", value: "" },
  { key: "courseId", value: "" },
  { key: "fieldId", value: "" },
  { key: "whyYaclamId", value: "" },
  { key: "practitionerId", value: "" },
  { key: "testimonialId", value: "" },
  { key: "roadmapId", value: "" },
  { key: "scholarshipId", value: "" },
  { key: "scholarshipCmsId", value: "" },
  { key: "blogCategoryId", value: "" },
  { key: "blogPostId", value: "" },
  { key: "footerId", value: "" },
  { key: "roleId", value: "" },
];

const authHeader = { key: "Authorization", value: "Bearer {{accessToken}}" };
const jsonHeader = { key: "Content-Type", value: "application/json" };

function url(pathSegments, query) {
  const segments = Array.isArray(pathSegments) ? pathSegments : pathSegments.split("/").filter(Boolean);
  const raw = `{{baseUrl}}/${segments.join("/")}`;
  const item = { raw, host: ["{{baseUrl}}"], path: segments };
  if (query) item.query = query.map((q) => ({ key: q.key, value: q.value }));
  return item;
}

function paginationQuery() {
  return [
    { key: "page", value: "1" },
    { key: "pageSize", value: "10" },
  ];
}

function req(method, pathSegments, opts = {}) {
  const headers = [...(opts.headers || [])];
  const request = { method, header: headers };
  if (opts.fullUrl) {
    request.url = { raw: opts.fullUrl };
  } else {
    request.url = url(pathSegments, opts.query);
  }
  if (opts.body) request.body = { mode: "raw", raw: opts.body };
  if (opts.event) request.event = opts.event;
  return { name: opts.name, request };
}

function formReq(method, pathSegments, opts = {}) {
  const headers = [...(opts.headers || [])];
  const request = { method, header: headers, url: url(pathSegments, opts.query) };
  request.body = { mode: "formdata", formdata: opts.formdata || [] };
  if (opts.event) request.event = opts.event;
  return { name: opts.name, request };
}

const courseCreatePayload = {
  title: "Power BI & Data Analytics Mastery",
  fieldId: "{{fieldId}}",
  description:
    "A practical, project-based course taught in Somali with English technical terms. Master Power BI and data analytics with real projects.",
  shortDescription: "Master Power BI and data analytics with real projects.",
  category: "data",
  level: "Intermediate",
  language: "Somali",
  color: "#1F3A93",
  badge: "Bestseller",
  certificate: true,
  access: "1 Year",
  duration: "32 hours",
  durationHours: 32,
  price: 49,
  originalPrice: 89,
  isFeatured: true,
  isPublished: true,
  isVisible: true,
  overview: {
    headline: "Build smarter, not harder",
    description:
      "A practical, project-based course taught in Somali with English technical terms.",
    outcomes: [
      "Build real, portfolio-ready projects from scratch",
      "Understand core concepts deeply, explained in Somali",
      "Earn a verified certificate of completion",
    ],
  },
  curriculum: [
    {
      title: "Getting Started",
      sortOrder: 0,
      lessons: [
        {
          id: "power-bi-data-analytics-mastery-m1-l1",
          title: "Welcome & how to use this course",
          duration: "04:12",
          free: true,
          vimeoId: "76979871",
        },
        {
          id: "power-bi-data-analytics-mastery-m1-l2",
          title: "Setting up your environment",
          duration: "08:24",
          free: true,
          vimeoId: "22439234",
        },
      ],
    },
    {
      title: "Core Concepts",
      sortOrder: 1,
      lessons: [
        {
          id: "power-bi-data-analytics-mastery-m2-l1",
          title: "The fundamentals, explained simply",
          duration: "12:38",
          vimeoId: "57266357",
        },
      ],
    },
  ],
  details: {
    skillLevel: "Intermediate",
    language: "Somali",
    durationHours: 32,
    certificate: true,
    access: "1 Year",
  },
  instructor: {
    name: "Abdikarim Mataan",
    role: "Practitioner-instructor",
    bio: "Practitioner-instructor with years of real-world experience.",
    avatar: "",
  },
};

function courseFolder() {
  const createBody = JSON.stringify(courseCreatePayload, null, 2);
  const updateBody = JSON.stringify(
    {
      price: 55,
      overview: { headline: "Build smarter, not harder — updated" },
      details: { access: "Lifetime" },
    },
    null,
    2
  );
  const multipartData = JSON.stringify(courseCreatePayload, null, 2);

  return {
    name: "Course",
    description:
      "Course entity — overview, curriculum, details, instructor. Supports JSON and multipart (thumbnail + data). Public: getAll, getById. Auth: create, update, uploads, delete.",
    item: [
      req("POST", "course/create", {
        name: "Create (JSON)",
        headers: [jsonHeader, authHeader],
        body: createBody,
        event: saveIdTest("courseId"),
      }),
      formReq("POST", "course/create", {
        name: "Create (Multipart)",
        headers: [authHeader],
        formdata: [
          { key: "thumbnail", type: "file", src: [], description: "Course thumbnail image" },
          { key: "data", type: "text", value: multipartData, description: "JSON string — same fields as Create (JSON)" },
        ],
        event: saveIdTest("courseId"),
      }),
      req("GET", "course/getAll", {
        name: "GetAll",
        query: paginationQuery(),
        headers: [],
      }),
      req("GET", "course/getAll", {
        name: "GetAll (featured)",
        query: [
          ...paginationQuery(),
          { key: "isFeatured", value: "true" },
        ],
        headers: [],
      }),
      req("GET", "course/getAll", {
        name: "GetAll (free)",
        query: [
          ...paginationQuery(),
          { key: "isFree", value: "true" },
        ],
        headers: [],
      }),
      req("GET", "course/getById/{{courseId}}", {
        name: "GetById",
        headers: [authHeader],
      }),
      req("PATCH", "course/update/{{courseId}}", {
        name: "Update (JSON)",
        headers: [jsonHeader, authHeader],
        body: updateBody,
      }),
      formReq("PATCH", "course/update/{{courseId}}", {
        name: "Update (Multipart)",
        headers: [authHeader],
        formdata: [
          { key: "thumbnail", type: "file", src: [], description: "Optional new thumbnail" },
          {
            key: "data",
            type: "text",
            value: updateBody,
            description: "Partial update JSON (overview, curriculum, details, instructor, etc.)",
          },
        ],
      }),
      formReq("POST", "course/upload/thumbnail", {
        name: "Upload Thumbnail",
        headers: [authHeader],
        formdata: [{ key: "thumbnail", type: "file", src: [], description: "Returns { thumbnail: '/uploads/courses/thumbnails/...' }" }],
      }),
      formReq("POST", "course/upload/video", {
        name: "Upload Video",
        headers: [authHeader],
        formdata: [{ key: "video", type: "file", src: [], description: "Returns { videoUrl: '/uploads/courses/videos/...' }" }],
      }),
      formReq("POST", "course/{{courseId}}/curriculum/lesson-video", {
        name: "Upload Lesson Video",
        headers: [authHeader],
        formdata: [
          { key: "video", type: "file", src: [], description: "Lesson video file" },
          { key: "moduleIndex", type: "text", value: "0", description: "Zero-based module index in curriculum[]" },
          { key: "lessonIndex", type: "text", value: "0", description: "Zero-based lesson index in module.lessons[]" },
        ],
      }),
      req("PATCH", "course/status/{{courseId}}", {
        name: "UpdateStatus",
        headers: [jsonHeader, authHeader],
        body: JSON.stringify({ status: true }, null, 2),
      }),
      req("DELETE", "course/delete/{{courseId}}", {
        name: "Delete",
        headers: [authHeader],
      }),
    ],
  };
}

function entityFolder(modulePath, idVar, opts = {}) {
  const getByIdHeaders = opts.publicGetById ? [] : [authHeader];

  if (opts.aliasOnly) {
    return {
      name: opts.folderName || `${modulePath} (alias)`,
      item: [
        req("GET", `${modulePath}/getAll`, {
          name: "GetAll",
          query: paginationQuery(),
          headers: [],
        }),
        req("GET", `${modulePath}/getById/{{${idVar}}}`, {
          name: "GetById",
          headers: getByIdHeaders,
        }),
      ],
    };
  }

  const items = [
    req("POST", `${modulePath}/create`, {
      name: "Create",
      headers: [jsonHeader, authHeader],
      body: opts.createBody || "{}",
      event: opts.createEvent,
    }),
    req("GET", `${modulePath}/getAll`, {
      name: "GetAll (public)",
      query: paginationQuery(),
      headers: [],
    }),
    ...(opts.extraGetAll || []),
    req("GET", `${modulePath}/getById/{{${idVar}}}`, {
      name: opts.publicGetById ? "GetById (public)" : "GetById",
      headers: getByIdHeaders,
    }),
    req("PATCH", `${modulePath}/update/{{${idVar}}}`, {
      name: "Update",
      headers: [jsonHeader, authHeader],
      body: opts.updateBody || "{}",
    }),
  ];

  if (opts.statusBody) {
    const statusPath = opts.statusPath || "status";
    items.push(
      req("PATCH", `${modulePath}/${statusPath}/{{${idVar}}}`, {
        name: "UpdateStatus",
        headers: [jsonHeader, authHeader],
        body: opts.statusBody,
      })
    );
  }

  if (!opts.skipDelete) {
    items.push(
      req("DELETE", `${modulePath}/delete/{{${idVar}}}`, {
        name: "Delete",
        headers: [authHeader],
      })
    );
  }

  return { name: opts.folderName || modulePath, item: items };
}

const saveIdTest = (varName) => [
  {
    listen: "test",
    script: {
      type: "text/javascript",
      exec: [
        "try {",
        "  const res = pm.response.json();",
        "  const id = res.id || res._id || (res.data && res.data[0] && (res.data[0].id || res.data[0]._id));",
        "  if (id) pm.collectionVariables.set('" + varName + "', id);",
        "} catch (e) {}",
      ],
    },
  },
];

const tokenTest = [
  {
    listen: "test",
    script: {
      type: "text/javascript",
      exec: [
        "try {",
        "  const res = pm.response.json();",
        "  if (res.accessToken) {",
        "    pm.collectionVariables.set('accessToken', res.accessToken);",
        "    pm.collectionVariables.set('userId', res.user?.id || res.user?._id || '');",
        "  }",
        "} catch (e) {}",
      ],
    },
  },
];

const homeSectionsSample = JSON.stringify(
  {
    sections: [
      {
        type: "hero",
        data: {
          title: "Learn Skills. Build Careers. Create Opportunities.",
          description: "Master practical skills through expert-led Somali-language education.",
        },
      },
      {
        type: "featuredCourses",
        data: {
          title: "Featured Courses",
          courseIds: [],
        },
      },
      {
        type: "featuredScholarships",
        data: {
          title: "Latest Scholarships",
          scholarshipIds: [],
        },
      },
      {
        type: "featuredBlogs",
        data: {
          title: "Career Articles",
          blogPostIds: [],
        },
      },
    ],
  },
  null,
  2
);

const settingsUpdateSample = JSON.stringify(
  {
    siteName: "Yaclam",
    logo: {
      isVisible: true,
      text: { mark: "ي", name: "Yaclam", highlight: ".", isVisible: true },
      picture: {
        light: "/uploads/logo-light.svg",
        dark: "/uploads/logo-dark.svg",
        alt: "Yaclam",
        isVisible: true,
      },
    },
  },
  null,
  2
);

const collection = {
  info: {
    name: "Yaclam_API",
    _postman_id: "yaclam-cms-2026-0602",
    description:
      "Yaclam CMS API (baseUrl {{baseUrl}}). Auth → CMS → entities. All lookups use getById (MongoDB id). Plural paths (e.g. /blog_posts) are aliases. Run Admin Login first to set accessToken.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: variables,
  item: [
    {
      name: "Health",
      item: [
        req("GET", [], {
          name: "Health check",
          headers: [],
          fullUrl: "http://localhost:9000/health",
        }),
      ],
    },
    {
      name: "Auth",
      item: [
        req("POST", "users/admin/bootstrap", {
          name: "Admin Bootstrap (first admin — no token)",
          headers: [jsonHeader],
          body: JSON.stringify(
            {
              email: "sadam@yaclam.com",
              password: "crT@89",
              profile: { full_name: "Sadam Ali" },
            },
            null,
            2
          ),
          event: tokenTest,
        }),
        req("POST", "users/admin/login", {
          name: "Admin Login",
          headers: [jsonHeader],
          body: JSON.stringify({ email: "sadam@yaclam.com", password: "crT@89" }, null, 2),
          event: tokenTest,
        }),
        req("POST", "users/register", {
          name: "Register (student)",
          headers: [jsonHeader],
          body: JSON.stringify(
            {
              email: "student@yaclam.com",
              password: "Student@123",
              profile: { full_name: "Test Student" },
            },
            null,
            2
          ),
        }),
        req("POST", "users/login", {
          name: "Login (student)",
          headers: [jsonHeader],
          body: JSON.stringify({ email: "student@yaclam.com", password: "Student@123" }, null, 2),
          event: tokenTest,
        }),
        req("POST", "users/admin/create", {
          name: "Admin Create",
          headers: [jsonHeader, authHeader],
          body: JSON.stringify(
            {
              email: "another@yaclam.com",
              password: "Admin@123",
              profile: { full_name: "Another Admin" },
              roleId: "{{roleId}}",
            },
            null,
            2
          ),
        }),
        req("GET", "users/profile", { name: "Profile", headers: [authHeader] }),
        req("GET", "users/getall/adminUsers", {
          name: "GetAll Admin Users",
          headers: [authHeader],
          query: paginationQuery(),
        }),
        req("GET", "users/getall/students", {
          name: "GetAll Students",
          headers: [authHeader],
          query: paginationQuery(),
        }),
        req("GET", "users/getById/{{userId}}", {
          name: "Get User ById",
          headers: [authHeader],
        }),
        req("PATCH", "users/admin/update/{{userId}}", {
          name: "Update Admin",
          headers: [jsonHeader, authHeader],
          body: JSON.stringify(
            { profile: { full_name: "Updated Admin Name" }, phone: "+252000000000" },
            null,
            2
          ),
        }),
        req("PATCH", "users/status/{{userId}}", {
          name: "Update User Status",
          headers: [jsonHeader, authHeader],
          body: JSON.stringify({ status: true }, null, 2),
        }),
        req("DELETE", "users/soft-delete/{{userId}}", {
          name: "Soft Delete User",
          headers: [authHeader],
        }),
      ],
    },
    {
      name: "Settings",
      item: [
        req("GET", "settings", {
          name: "Get (public)",
          headers: [],
          event: saveIdTest("settingsId"),
        }),
        req("PATCH", "settings/update/{{settingsId}}", {
          name: "Update",
          headers: [jsonHeader, authHeader],
          body: settingsUpdateSample,
        }),
      ],
    },
    {
      name: "Pages",
      item: [
        req("GET", "pages/home", { name: "Get Home (public)", headers: [] }),
        req("GET", "pages/about", { name: "Get About (public)", headers: [] }),
        req("GET", "pages/contact", { name: "Get Contact (public)", headers: [] }),
        req("PATCH", "pages/home", {
          name: "Update Home",
          headers: [jsonHeader, authHeader],
          body: homeSectionsSample,
        }),
        req("PATCH", "pages/about", {
          name: "Update About",
          headers: [jsonHeader, authHeader],
          body: JSON.stringify(
            {
              title: "About Yaclam",
              sections: [
                {
                  type: "pageHeader",
                  data: { title: "About Yaclam", subtitle: "Somalia's premier e-learning platform." },
                },
              ],
            },
            null,
            2
          ),
        }),
        req("PATCH", "pages/contact", {
          name: "Update Contact",
          headers: [jsonHeader, authHeader],
          body: JSON.stringify(
            {
              title: "Contact",
              sections: [
                {
                  type: "pageHeader",
                  data: { title: "Get in touch", subtitle: "We'd love to hear from you." },
                },
              ],
            },
            null,
            2
          ),
        }),
      ],
    },
    {
      name: "Home CMS",
      item: [
        req("GET", "home/getAll", {
          name: "GetAll (public)",
          headers: [],
          event: saveIdTest("homeId"),
        }),
        req("GET", "home/getById/{{homeId}}", {
          name: "GetById",
          headers: [authHeader],
        }),
        req("POST", "home/create", {
          name: "Create",
          headers: [jsonHeader, authHeader],
          body: JSON.stringify(
            {
              heroVerseArabic: "قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ",
              heroVerseTranslation: "Are those who know equal to those who do not know?",
              heroTitle: "Learn Skills. Build Careers. Create Opportunities.",
              heroSubtitle:
                "Master practical skills, earn certificates, discover scholarships, and advance your career through expert-led Somali-language education.",
              heroPrimaryButton: { label: "Start Learning", url: "/register", isVisible: true },
              heroSecondaryButton: { label: "Explore Courses", url: "/courses", isVisible: true },
            },
            null,
            2
          ),
        }),
        req("PATCH", "home/update/{{homeId}}", {
          name: "Update",
          headers: [jsonHeader, authHeader],
          body: JSON.stringify(
            {
              featuredCoursesBadgeText: "Popular",
              featuredCoursesTitle: "Featured courses",
              featuredCoursesSubtitle: "Hand-picked, top-rated programmes loved by thousands of learners.",
            },
            null,
            2
          ),
        }),
        req("DELETE", "home/delete/{{homeId}}", { name: "Delete", headers: [authHeader] }),
      ],
    },
    entityFolder("courses", "coursesPageId", {
      folderName: "Course Page CMS",
      includeSlug: false,
      createBody: JSON.stringify(
        {
          headerText: "Explore Courses",
          title: "Explore Courses",
          subtitle: "Practical, job-ready skills taught in Somali. Filter by topic, price and level to find your next course.",
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ title: "Explore Courses" }, null, 2),
      createEvent: saveIdTest("coursesPageId"),
      statusBody: null,
    }),
    entityFolder("home_sections", "homeSectionsId", {
      folderName: "Home Sections CMS",
      includeSlug: false,
      createBody: JSON.stringify(
        {
          fieldSection: {
            eyebrow: "Browse",
            title: "Find your field",
            subtitle: "Explore practical, job-ready skills across the disciplines that matter most.",
          },
          featuredCoursesSection: {
            eyebrow: "Popular",
            title: "Featured courses",
            subtitle: "Hand-picked, top-rated programmes loved by thousands of learners.",
          },
          whyYaclamSection: {
            eyebrow: "Why Yaclam",
            title: "Education built for you",
            subtitle: "Everything you need to learn, get certified and move your career forward.",
          },
          ctaSection: {
            title: "Your future is one decision away",
            subtitle:
              "Join thousands of Somali learners building skills, earning certificates and changing their lives. Start free today.",
            primaryButtonText: "Create free account",
            primaryButtonUrl: "/register",
            secondaryButtonText: "Browse courses",
            secondaryButtonUrl: "/courses",
          },
        },
        null,
        2
      ),
      updateBody: JSON.stringify(
        {
          practitionersSection: {
            eyebrow: "Expert-led",
            title: "Learn from practitioners",
            subtitle: "Our instructors teach what they actually do — no theory without practice.",
          },
          testimonialsSection: {
            eyebrow: "Learners",
            title: "Real outcomes",
            subtitle: "From first lesson to first job offer — here is what learners say.",
          },
        },
        null,
        2
      ),
      createEvent: saveIdTest("homeSectionsId"),
      statusBody: null,
    }),
    entityFolder("field", "fieldId", {
      folderName: "Fields",
      publicGetById: true,
      extraGetAll: [
        req("GET", "field/getAllFieldByCourse", {
          name: "GetAllFieldByCourse (public)",
          headers: [],
        }),
      ],
      createBody: JSON.stringify(
        {
          name: "Data Science",
          description: "Data analysis and machine learning tracks.",
          icon: "chart-bar",
          sortOrder: 1,
          isVisible: true,
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ description: "Updated field description" }, null, 2),
      createEvent: saveIdTest("fieldId"),
      statusPath: "updateStatus",
      statusBody: JSON.stringify({ isVisible: false }, null, 2),
    }),
    entityFolder("why_yaclam", "whyYaclamId", {
      folderName: "Why Yaclam",
      includeSlug: false,
      createBody: JSON.stringify(
        {
          icon: "Globe",
          title: "Learn in Somali",
          description:
            "Complex skills explained in your mother tongue, with English technical terms — the way you actually understand best.",
          sortOrder: 1,
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ title: "Verified Certificates" }, null, 2),
      createEvent: saveIdTest("whyYaclamId"),
      statusBody: null,
    }),
    entityFolder("practitioner", "practitionerId", {
      folderName: "Practitioners",
      publicGetById: true,
      extraGetAll: [
        req("GET", "practitioner/getAll", {
          name: "GetAll (visible only)",
          query: [...paginationQuery(), { key: "isVisible", value: "true" }],
          headers: [],
        }),
      ],
      createBody: JSON.stringify(
        {
          initials: "MA",
          name: "Eng. Mohamud Ali",
          role: "Software Engineering",
          coursesCount: 6,
          studentsCount: "4.6k",
          color: "#1D4ED8",
          sortOrder: 1,
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ coursesCount: 7 }, null, 2),
      createEvent: saveIdTest("practitionerId"),
      statusBody: JSON.stringify({ isVisible: true }, null, 2),
    }),
    entityFolder("practitioners", "practitionerId", {
      folderName: "Practitioners (alias /practitioners)",
      aliasOnly: true,
      publicGetById: true,
    }),
    entityFolder("testimonial", "testimonialId", {
      folderName: "Testimonials",
      publicGetById: true,
      createBody: JSON.stringify(
        {
          description:
            "I learned Power BI in Somali first, then practised in English. Within five months I landed my first analyst role. Yaclam made it feel possible.",
          initials: "HA",
          name: "Hodan A.",
          role: "Data Analyst",
          location: "Dublin",
          sortOrder: 1,
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ location: "Dublin, Ireland" }, null, 2),
      createEvent: saveIdTest("testimonialId"),
      statusBody: JSON.stringify({ isVisible: true }, null, 2),
    }),
    entityFolder("testimonials", "testimonialId", {
      folderName: "Testimonials (alias /testimonials)",
      aliasOnly: true,
      publicGetById: true,
    }),
    courseFolder(),
    entityFolder("scholarship", "scholarshipId", {
      folderName: "Scholarship",
      publicGetById: true,
      createBody: JSON.stringify(
        {
          name: "New Scholarship",
          provider: "Provider",
          country: "Global",
          level: "Masters",
          funding: "Full",
          flag: "🌍",
          deadline: "Jan 2027",
          overview: "Scholarship overview text.",
          benefits: ["Full tuition", "Living stipend"],
          eligibility: ["Open to all nationalities"],
          documents: ["CV", "Motivation letter"],
          website: "https://example.com",
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ funding: "Partial" }, null, 2),
      statusBody: JSON.stringify({ status: true }, null, 2),
      createEvent: saveIdTest("scholarshipId"),
    }),
    entityFolder("fields", "fieldId", {
      folderName: "Fields (alias /fields)",
      aliasOnly: true,
      publicGetById: true,
    }),
    entityFolder("scholarships", "scholarshipId", {
      folderName: "Scholarships (alias /scholarships)",
      aliasOnly: true,
      publicGetById: true,
    }),
    entityFolder("scholarship_cms", "scholarshipCmsId", {
      folderName: "Scholarship CMS",
      createBody: JSON.stringify(
        {
          headerText: "Scholarship Portal",
          title: "Scholarship Portal",
          subtitle:
            "Funded study opportunities worldwide — eligibility, benefits and deadlines, explained for Somali applicants.",
          emptyStateText: "No scholarships found.",
        },
        null,
        2
      ),
      updateBody: JSON.stringify(
        { subtitle: "Updated scholarship portal subtitle." },
        null,
        2
      ),
      createEvent: saveIdTest("scholarshipCmsId"),
      statusBody: null,
    }),
    entityFolder("blog_category", "blogCategoryId", {
      folderName: "Blog Category",
      publicGetById: true,
      createBody: JSON.stringify(
        {
          name: "Careers",
          description: "Career guides and roadmaps",
          color: "#C9A84C",
          sortOrder: 0,
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ description: "Updated category" }, null, 2),
      createEvent: saveIdTest("blogCategoryId"),
      statusBody: JSON.stringify({ isVisible: true }, null, 2),
    }),
    entityFolder("blog_categories", "blogCategoryId", {
      folderName: "Blog Categories (alias /blog_categories)",
      aliasOnly: true,
      publicGetById: true,
    }),
    entityFolder("blog_post", "blogPostId", {
      folderName: "Blog Post",
      publicGetById: true,
      extraGetAll: [
        req("GET", "blog_post/getAll", {
          name: "GetAll by categoryId",
          query: [
            ...paginationQuery(),
            { key: "categoryId", value: "{{blogCategoryId}}" },
          ],
          headers: [],
        }),
        req("GET", "blog_post/getAll", {
          name: "GetAll (admin drafts)",
          query: [
            ...paginationQuery(),
            { key: "includeDrafts", value: "true" },
          ],
          headers: [authHeader],
        }),
      ],
      createBody: JSON.stringify(
        {
          title: "How AI Is Changing the Job Market (And What to Do)",
          categoryId: "{{blogCategoryId}}",
          excerpt: "AI will not replace you, but someone using AI well might.",
          body: [
            "The fear that AI will eliminate all jobs is overblown, but the disruption is real.",
            "The winners learn to direct AI while focusing on judgement and relationships.",
          ],
          readTime: 9,
          publishedDate: "2026-02-25",
          status: "published",
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ title: "Updated Post" }, null, 2),
      statusBody: JSON.stringify({ status: "published" }, null, 2),
      createEvent: saveIdTest("blogPostId"),
    }),
    entityFolder("blog_posts", "blogPostId", {
      folderName: "Blog Posts (alias /blog_posts)",
      aliasOnly: true,
      publicGetById: true,
    }),
    entityFolder("roadmap", "roadmapId", {
      folderName: "Roadmap",
      publicGetById: true,
      createBody: JSON.stringify(
        {
          title: "Data Analyst",
          description: "Turn raw data into business decisions.",
          icon: "BarChart3",
          demand: "Very High",
          salary: "€38k–€58k",
          months: 8,
          skills: ["Excel", "SQL", "Power BI", "Python", "Statistics"],
          steps: [
            { title: "Foundations", detail: "Spreadsheets and statistics.", order: 0 },
            { title: "Core skills", detail: "SQL and clean workflows.", order: 1 },
          ],
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ description: "Updated roadmap" }, null, 2),
      statusBody: JSON.stringify({ status: true }, null, 2),
      createEvent: saveIdTest("roadmapId"),
    }),
    entityFolder("roadmaps", "roadmapId", {
      folderName: "Roadmaps (alias /roadmaps)",
      aliasOnly: true,
      publicGetById: true,
    }),
    entityFolder("footer", "footerId", {
      folderName: "Footer",
      skipDelete: true,
      createBody: JSON.stringify(
        {
          tagline: "Made for the Somali ummah",
          columns: [
            {
              title: "Learn",
              links: [{ label: "Courses", url: "/courses", isVisible: true }],
              isVisible: true,
            },
          ],
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ tagline: "Updated tagline" }, null, 2),
      createEvent: saveIdTest("footerId"),
      statusBody: null,
    }),
    {
      name: "Cart",
      item: [
        req("GET", "cart", { name: "Get Cart", headers: [authHeader] }),
        req("POST", "cart/items", {
          name: "Add Item",
          headers: [jsonHeader, authHeader],
          body: JSON.stringify({ courseId: "{{courseId}}" }, null, 2),
        }),
        req("DELETE", "cart/items/{{courseId}}", { name: "Remove Item", headers: [authHeader] }),
        req("DELETE", "cart/clear", { name: "Clear Cart", headers: [authHeader] }),
      ],
    },
    {
      name: "Newsletter",
      item: [
        req("POST", "newsletter/subscribe", {
          name: "Subscribe (public)",
          headers: [jsonHeader],
          body: JSON.stringify({ email: "subscriber@example.com" }, null, 2),
        }),
        req("GET", "newsletter/getAll", {
          name: "GetAll",
          headers: [authHeader],
          query: paginationQuery(),
        }),
      ],
    },
    {
      name: "Role",
      item: [
        req("POST", "role/create", {
          name: "Create",
          headers: [jsonHeader, authHeader],
          body: JSON.stringify(
            { name: "Editor", description: "Content editor", permissions: ["content:write"] },
            null,
            2
          ),
          event: saveIdTest("roleId"),
        }),
        req("GET", "role/getAll", {
          name: "GetAll",
          headers: [authHeader],
          query: paginationQuery(),
        }),
        req("PATCH", "role/update/{{roleId}}", {
          name: "Update",
          headers: [jsonHeader, authHeader],
          body: JSON.stringify({ name: "Editor", description: "Updated role" }, null, 2),
        }),
        req("DELETE", "role/delete/{{roleId}}", { name: "Delete", headers: [authHeader] }),
      ],
    },
  ],
};

const preferredOrder = [
  "Health",
  "Auth",
  "Settings",
  "Pages",
  "Home CMS",
  "Home Sections CMS",
  "Footer",
  "Why Yaclam",
  "Fields",
  "Course Page CMS",
  "Course",
  "Blog Category",
  "Blog Categories (alias)",
  "Blog Post",
  "Blog Posts (alias /blog_posts)",
  "Roadmap",
  "Roadmaps (alias /roadmaps)",
  "Scholarship",
  "Scholarships (alias /scholarships)",
  "Scholarship CMS",
  "Practitioners",
  "Practitioners (alias /practitioners)",
  "Testimonials",
  "Testimonials (alias /testimonials)",
  "Cart",
  "Newsletter",
  "Role",
];

const orderMap = new Map(preferredOrder.map((name, index) => [name, index]));
collection.item.sort((a, b) => {
  const aIndex = orderMap.has(a.name) ? orderMap.get(a.name) : Number.MAX_SAFE_INTEGER;
  const bIndex = orderMap.has(b.name) ? orderMap.get(b.name) : Number.MAX_SAFE_INTEGER;
  if (aIndex === bIndex) return a.name.localeCompare(b.name);
  return aIndex - bIndex;
});

const outPath = path.join(__dirname, "..", "postman", "Yaclam_API.postman_collection.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(collection, null, 2));
console.log("Written:", outPath);
