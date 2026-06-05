const FUNDING_TYPES = ["Full", "Partial"];

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

  delete body.documentsRequired;
  delete body.slug;

  return body;
}

module.exports = {
  FUNDING_TYPES,
  buildScholarshipPayload,
  parseStringList,
};
