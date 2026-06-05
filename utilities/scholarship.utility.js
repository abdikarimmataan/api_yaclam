const FUNDING_TYPES = ["Full", "Partial"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseMonthToken(token) {
  const trimmed = String(token ?? "").trim();
  if (!trimmed) return null;

  const asNumber = Number(trimmed);
  if (Number.isFinite(asNumber) && asNumber >= 1 && asNumber <= 12) {
    return asNumber;
  }

  const short = trimmed.toLowerCase().slice(0, 3);
  const index = MONTH_LABELS.findIndex((label) => label.toLowerCase() === short);
  return index >= 0 ? index + 1 : null;
}

function toUtcDate(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day));
}

function parseDeadlineDate(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const trimmed = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}(T|\s|$)/.test(trimmed)) {
    const date = new Date(trimmed);
    if (!Number.isNaN(date.getTime())) return date;
  }

  const displayMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (displayMatch) {
    const year = Number(displayMatch[3]);
    const month = parseMonthToken(displayMatch[1]);
    const day = Number(displayMatch[2]);
    if (!month) return null;

    const date = toUtcDate(year, month, day);
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return null;
    }
    return date;
  }

  const slashMatch = trimmed.match(/^(\d{4})[/-]([^/]+)[/-](\d{1,2})$/);
  if (slashMatch) {
    const year = Number(slashMatch[1]);
    const month = parseMonthToken(slashMatch[2]);
    const day = Number(slashMatch[3]);
    if (!month) return null;

    const date = toUtcDate(year, month, day);
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return null;
    }
    return date;
  }

  return null;
}

function parseStringList(raw) {
  if (raw === undefined || raw === null) return undefined;
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  const text = String(raw).trim();
  if (!text) return [];
  if (text.includes("\n")) {
    return text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeFunding(value) {
  if (!value) return undefined;
  const trimmed = String(value).trim();
  const match = FUNDING_TYPES.find((f) => f.toLowerCase() === trimmed.toLowerCase());
  return match || trimmed;
}

function buildScholarshipPayload(raw = {}) {
  const body = { ...raw };

  if (body.title && !body.name) body.name = body.title;
  if (body.name && !body.title) body.title = body.name;
  if (body.overview === undefined && body.description !== undefined) {
    body.overview = body.description;
  }
  if (body.website === undefined && body.applicationUrl !== undefined) {
    body.website = body.applicationUrl;
  }

  if (body.benefits !== undefined) body.benefits = parseStringList(body.benefits);
  if (body.eligibility !== undefined) body.eligibility = parseStringList(body.eligibility);
  if (body.documents !== undefined) body.documents = parseStringList(body.documents);
  if (body.documentsRequired !== undefined && body.documents === undefined) {
    body.documents = parseStringList(body.documentsRequired);
  }
  if (body.funding !== undefined) body.funding = normalizeFunding(body.funding);
  if (body.deadline !== undefined) {
    const parsedDeadline = parseDeadlineDate(body.deadline);
    if (body.deadline && parsedDeadline === null) {
      throw new Error("deadline must be a valid date");
    }
    body.deadline = parsedDeadline;
  }

  delete body.documentsRequired;
  delete body.slug;

  return body;
}

module.exports = {
  FUNDING_TYPES,
  buildScholarshipPayload,
  parseStringList,
  parseDeadlineDate,
};
