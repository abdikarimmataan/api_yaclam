function parseBody(raw) {
  if (raw === undefined || raw === null) return undefined;
  if (Array.isArray(raw)) {
    return raw.map((p) => String(p).trim()).filter(Boolean);
  }
  const text = String(raw).trim();
  if (!text) return [];
  if (text.includes("\n\n")) {
    return text
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [text];
}

function buildPublicFilter(req = {}) {
  const filter = { del_status: "Live" };
  if (req.query.includeHidden === "true" || req.query.includeDrafts === "true") {
    // Admin
  } else {
    filter.status = "published";
    filter.isVisible = { $ne: false };
  }
  if (req.query.categoryId && String(req.query.categoryId).match(/^[a-f\d]{24}$/i)) {
    filter.categoryId = req.query.categoryId;
  }
  if (req.query.tag) filter.tags = req.query.tag;
  return filter;
}

function buildBlogPostPayload(raw = {}, { userId, category } = {}) {
  const body = { ...raw };

  if (body.body !== undefined) {
    body.body = parseBody(body.body);
    if (!body.content && body.body.length) {
      body.content = body.body.join("\n\n");
    }
  }
  if (body.content !== undefined && body.body === undefined) {
    body.body = parseBody(body.content);
  }
  if (body.date !== undefined && body.publishedDate === undefined) {
    body.publishedDate = body.date;
  }
  if (body.readTime !== undefined) {
    const readTime = Number(body.readTime);
    body.readTime = Number.isFinite(readTime) ? readTime : 0;
  }

  if (category) {
    body.categoryId = category._id;
    body.category = category.name;
    body.color = category.color || body.color || "#1F3A93";
  }

  if (userId) {
    body.authorId = userId;
  }

  delete body.date;
  delete body.author;
  delete body.slug;

  return body;
}

module.exports = {
  parseBody,
  buildPublicFilter,
  buildBlogPostPayload,
};
