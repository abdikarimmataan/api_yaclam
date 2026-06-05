const DEMAND_LEVELS = ["Very High", "High", "Medium"];

function normalizeSteps(steps) {
  if (!Array.isArray(steps)) return undefined;
  return steps.map((step, index) => ({
    title: step?.title || "",
    detail: step?.detail || step?.description || "",
    order: Number.isFinite(step?.order) ? step.order : index,
    isVisible: step?.isVisible !== false,
  }));
}

function parseSkills(raw) {
  if (raw === undefined || raw === null) return undefined;
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeDemand(value) {
  if (!value) return undefined;
  const trimmed = String(value).trim();
  const match = DEMAND_LEVELS.find((d) => d.toLowerCase() === trimmed.toLowerCase());
  return match || trimmed;
}

function buildRoadmapPayload(raw = {}) {
  const body = { ...raw };

  if (body.marketDemand !== undefined && body.demand === undefined) {
    body.demand = body.marketDemand;
  }
  if (body.salaryRange !== undefined && body.salary === undefined) {
    body.salary = body.salaryRange;
  }
  if (body.timeToJobReadyMonths !== undefined && body.months === undefined) {
    body.months = body.timeToJobReadyMonths;
  }
  if (body.timeToJobReady !== undefined && body.months === undefined) {
    body.months = body.timeToJobReady;
  }
  if (body.skillsYoullMaster !== undefined && body.skills === undefined) {
    body.skills = body.skillsYoullMaster;
  }
  if (body.skillsRequiredCount !== undefined && body.skillsRequired === undefined) {
    body.skillsRequired = body.skillsRequiredCount;
  }
  if (body.learningPath !== undefined && body.steps === undefined) {
    body.steps = body.learningPath;
  }

  if (body.skills !== undefined) {
    body.skills = parseSkills(body.skills);
  }
  if (body.demand !== undefined) {
    body.demand = normalizeDemand(body.demand);
  }
  if (body.steps !== undefined) {
    body.steps = normalizeSteps(body.steps);
  }
  if (body.months !== undefined) {
    const months = Number(body.months);
    body.months = Number.isFinite(months) ? months : 0;
  }
  if (body.skillsRequired === undefined && Array.isArray(body.skills)) {
    body.skillsRequired = body.skills.length;
  }

  delete body.marketDemand;
  delete body.salaryRange;
  delete body.timeToJobReadyMonths;
  delete body.timeToJobReady;
  delete body.skillsYoullMaster;
  delete body.skillsRequiredCount;
  delete body.learningPath;
  delete body.slug;

  return body;
}

module.exports = {
  DEMAND_LEVELS,
  buildRoadmapPayload,
  normalizeSteps,
  parseSkills,
};
