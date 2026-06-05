function deriveInitials(name) {
  if (!name) return "";
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

function buildPractitionerPayload(raw = {}) {
  const body = { ...raw };

  if (body.courses !== undefined && body.coursesCount === undefined) {
    body.coursesCount = Number(body.courses);
  }
  if (body.students !== undefined && body.studentsCount === undefined) {
    body.studentsCount = String(body.students);
  }
  if (body.coursesCount !== undefined) {
    const count = Number(body.coursesCount);
    body.coursesCount = Number.isFinite(count) ? count : 0;
  }
  if (!body.initials && body.name) {
    body.initials = deriveInitials(body.name);
  }

  delete body.courses;
  delete body.students;

  return body;
}

function buildPublicFilter(req = {}) {
  const filter = { del_status: "Live" };
  if (req.query.isVisible === "true" || req.query.visible === "true") {
    filter.isVisible = true;
  } else if (req.query.includeHidden === "true") {
    // Admin-style listing: all live records
  } else {
    filter.isVisible = { $ne: false };
  }
  return filter;
}

module.exports = {
  deriveInitials,
  buildPractitionerPayload,
  buildPublicFilter,
};
