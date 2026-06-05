const { deriveInitials } = require("./practitioner.utility");

function buildTestimonialPayload(raw = {}) {
  const body = { ...raw };

  if (body.text !== undefined && body.description === undefined) {
    body.description = body.text;
  }
  if (body.description !== undefined && body.text === undefined) {
    body.text = body.description;
  }
  if (body.quote !== undefined && body.text === undefined) {
    body.text = body.quote;
    body.description = body.quote;
  }
  if (!body.initials && body.name) {
    body.initials = deriveInitials(body.name);
  }

  delete body.quote;

  return body;
}

function buildPublicFilter(req = {}) {
  const filter = { del_status: "Live" };
  if (req.query.isVisible === "true" || req.query.visible === "true") {
    filter.isVisible = true;
  } else if (req.query.includeHidden === "true") {
    // Admin listing: all live records
  } else {
    filter.isVisible = { $ne: false };
  }
  return filter;
}

module.exports = {
  buildTestimonialPayload,
  buildPublicFilter,
};
