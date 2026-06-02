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
  { key: "blogPostId", value: "" },
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
  const request = { method, header: headers, url: url(pathSegments, opts.query) };
  if (opts.body) request.body = { mode: "raw", raw: opts.body };
  if (opts.event) request.event = opts.event;
  return { name: opts.name, request };
}

function entityFolder(modulePath, idVar, opts = {}) {
  const items = [
    req("POST", `${modulePath}/create`, {
      name: "Create",
      headers: [jsonHeader, authHeader],
      body: opts.createBody || "{}",
      event: opts.createEvent,
    }),
    req("GET", `${modulePath}/getAll`, {
      name: "GetAll",
      query: paginationQuery(),
      headers: [],
    }),
    req("GET", `${modulePath}/getById/{{${idVar}}}`, {
      name: "GetById",
      headers: [authHeader],
    }),
    req("PATCH", `${modulePath}/update/{{${idVar}}}`, {
      name: "Update",
      headers: [jsonHeader, authHeader],
      body: opts.updateBody || "{}",
    }),
  ];

  if (opts.includeSlug !== false) {
    items.splice(
      2,
      0,
      req("GET", `${modulePath}/${opts.slugExample || "example-slug"}`, {
        name: "GetBySlug",
        headers: [],
      })
    );
  }

  if (opts.statusBody) {
    items.push(
      req("PATCH", `${modulePath}/status/{{${idVar}}}`, {
        name: "UpdateStatus",
        headers: [jsonHeader, authHeader],
        body: opts.statusBody,
      })
    );
  }

  items.push(
    req("DELETE", `${modulePath}/delete/{{${idVar}}}`, {
      name: "Delete",
      headers: [authHeader],
    })
  );

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
          courseSlugs: ["power-bi-data-analytics-mastery", "python-for-data-analysis"],
        },
      },
      {
        type: "featuredScholarships",
        data: {
          title: "Latest Scholarships",
          scholarshipSlugs: ["chevening-scholarship", "daad-scholarships"],
        },
      },
      {
        type: "featuredBlogs",
        data: {
          title: "Career Articles",
          blogSlugs: ["how-to-become-a-data-analyst-in-2026-complete-roadmap"],
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
      "Yaclam CMS API — Auth, Settings, Pages, Home CMS blocks, Entities (fields, course, roadmaps, scholarships, practitioners, testimonials, why_yaclam, blog_post), cart, newsletter, role.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: variables,
  item: [
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
    entityFolder("fields", "fieldId", {
      folderName: "Fields",
      includeSlug: false,
      createBody: JSON.stringify(
        {
          name: "Data Science",
          slug: "data-science",
          description: "Data analysis and machine learning tracks.",
          icon: "chart-bar",
          sortOrder: 1,
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ description: "Updated field description" }, null, 2),
      createEvent: saveIdTest("fieldId"),
      statusBody: null,
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
    entityFolder("practitioners", "practitionerId", {
      folderName: "Practitioners",
      includeSlug: false,
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
      statusBody: null,
    }),
    entityFolder("testimonials", "testimonialId", {
      folderName: "Testimonials",
      includeSlug: false,
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
      statusBody: null,
    }),
    entityFolder("course", "courseId", {
      folderName: "Course",
      slugExample: "power-bi-data-analytics-mastery",
      createBody: JSON.stringify(
        {
          title: "New Course",
          slug: "new-course",
          description: "Course description",
          level: "Beginner",
          duration: "8 weeks",
          thumbnail: "",
          fieldId: "{{fieldId}}",
          price: 25,
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ price: 30, level: "Intermediate", fieldId: "{{fieldId}}" }, null, 2),
      statusBody: JSON.stringify({ status: true }, null, 2),
      createEvent: saveIdTest("courseId"),
    }),
    entityFolder("scholarship", "scholarshipId", {
      folderName: "Scholarship",
      slugExample: "chevening-scholarship",
      createBody: JSON.stringify(
        {
          name: "New Scholarship",
          slug: "new-scholarship",
          provider: "Provider",
          country: "Global",
          level: "Masters",
          funding: "Full",
          flag: "🌍",
          deadline: "Jan 2027",
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ funding: "Partial" }, null, 2),
      statusBody: JSON.stringify({ status: true }, null, 2),
      createEvent: saveIdTest("scholarshipId"),
    }),
    entityFolder("blog_post", "blogPostId", {
      folderName: "BlogPost",
      slugExample: "how-to-become-a-data-analyst-in-2026-complete-roadmap",
      createBody: JSON.stringify(
        {
          title: "New Blog Post",
          slug: "new-blog-post",
          excerpt: "Short excerpt",
          content: "Full content",
          category: "Careers",
          authorName: "Yaclam Team",
          readTime: 5,
          publishedDate: "2026-06-01",
          status: "published",
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ title: "Updated Post" }, null, 2),
      statusBody: JSON.stringify({ status: "published" }, null, 2),
      createEvent: saveIdTest("blogPostId"),
    }),
    entityFolder("roadmap", "roadmapId", {
      folderName: "Roadmap",
      slugExample: "data-analyst",
      createBody: JSON.stringify(
        {
          title: "Data Analyst",
          slug: "data-analyst",
          description: "Path to becoming a data analyst",
          skills: ["Excel", "SQL", "Power BI"],
        },
        null,
        2
      ),
      updateBody: JSON.stringify({ description: "Updated roadmap" }, null, 2),
      statusBody: JSON.stringify({ status: true }, null, 2),
      createEvent: saveIdTest("roadmapId"),
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
  "Home CMS",
  "Home Sections CMS",
  "Why Yaclam",
  "Fields",
  "Course Page CMS",
  "Course",
  "Roadmap",
  "Scholarship",
  "Practitioners",
  "Testimonials",
  "BlogPost",
  "Pages",
  "Settings",
  "Auth",
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
