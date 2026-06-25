function buildPublicFilter(req = {}) {
  const filter = { del_status: "Live" };
  if (req.query.isVisible === "true" || req.query.visible === "true") {
    filter.isVisible = true;
  } else if (req.query.includeHidden === "true") {
    // Admin listing
  } else {
    filter.isVisible = { $ne: false };
  }
  return filter;
}

module.exports = { buildPublicFilter };
