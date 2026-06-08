function buildInstructorPayload(raw = {}) {
  const body = { ...raw };
  if (body.email) body.email = body.email.toLowerCase();
  delete body.password;
  return body;
}

module.exports = { buildInstructorPayload };
