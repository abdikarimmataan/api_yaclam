function parseDurationToSeconds(value) {
  if (!value || typeof value !== "string") return 0;
  const trimmed = value.trim();
  if (!trimmed) return 0;

  const parts = trimmed.split(":").map((part) => Number(part));
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return 0;

  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 0;
}

function computeCurriculumStats(curriculum) {
  if (!Array.isArray(curriculum)) {
    return { lessonCount: 0, durationHours: 0 };
  }

  let lessonCount = 0;
  let totalSeconds = 0;

  for (const mod of curriculum) {
    const lessons = Array.isArray(mod.lessons) ? mod.lessons : [];
    for (const lesson of lessons) {
      if (lesson.isVisible === false) continue;
      lessonCount += 1;
      totalSeconds += parseDurationToSeconds(lesson.duration);
    }
  }

  const durationHours =
    totalSeconds === 0 ? 0 : Math.round((totalSeconds / 3600) * 100) / 100;
  return { lessonCount, durationHours };
}

module.exports = {
  parseDurationToSeconds,
  computeCurriculumStats,
};
