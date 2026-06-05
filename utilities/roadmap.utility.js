const DEMAND_LEVELS = ["Very High", "High", "Medium"];
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

function normalizeTimeToJobReadyDate(value) {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return "";

  const match = trimmed.match(/^(\d{4})[/-]([^/]+)[/-](\d{1,2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = parseMonthToken(match[2]);
  const day = Number(match[3]);
  if (!month) return null;

  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return `${String(year).padStart(4, "0")}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
}

function formatTimeToJobReadyDisplay(value) {
  const normalized = normalizeTimeToJobReadyDate(value);
  if (!normalized) return value ? String(value) : "";
  if (normalized === "") return "";

  const [year, month, day] = normalized.split("/");
  const monthLabel = MONTH_LABELS[Number(month) - 1];
  return `${year}/${monthLabel}/${Number(day)}`;
}

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
  if (body.months !== undefined && body.timeToJobReady) {
    delete body.months;
  }
  if (body.months !== undefined && !body.timeToJobReady) {
    const months = Number(body.months);
    body.months = Number.isFinite(months) ? months : 0;
  }
  if (body.timeToJobReady !== undefined) {
    const normalizedDate = normalizeTimeToJobReadyDate(body.timeToJobReady);
    if (normalizedDate === null) {
      throw new Error("timeToJobReady must be a valid date in YYYY/MM/DD format");
    }
    body.timeToJobReady = normalizedDate;
  }
  if (body.skillsRequired === undefined && Array.isArray(body.skills)) {
    body.skillsRequired = body.skills.length;
  }

  delete body.marketDemand;
  delete body.salaryRange;
  delete body.timeToJobReadyMonths;
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
  normalizeTimeToJobReadyDate,
  formatTimeToJobReadyDisplay,
};
