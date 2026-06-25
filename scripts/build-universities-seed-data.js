/**
 * One-time / repeatable builder: reads Desktop universities_full.ts and writes
 * scripts/seed-universities.data.js for the MongoDB seed script.
 */
const fs = require("fs");
const path = require("path");

const SOURCE =
  process.env.UNIVERSITIES_SOURCE ||
  path.join(process.env.USERPROFILE || "", "Desktop", "universities_full.ts");
const OUT = path.join(__dirname, "seed-universities.data.js");

function stripTypeScript(source) {
  let src = source;
  src = src.replace(/^\/\*[\s\S]*?\*\/\s*/m, "");
  src = src.replace(/^import[\s\S]*?;\s*/gm, "");
  src = src.replace(/^export type[\s\S]*?;\s*/gm, "");
  src = src.replace(/^export interface[\s\S]*?\}\s*/gm, "");
  src = src.replace(/^export const LEVEL_TABS[\s\S]*?\];\s*/m, "");
  src = src.replace(/^export function[\s\S]*/m, "");
  src = src.replace(/export const universities/g, "const universities");
  src = src.replace(/:\s*ProgramLevel/g, "");
  src = src.replace(/:\s*Program\b/g, "");
  src = src.replace(/\):\s*Program\s*=>/g, ") =>");
  src = src.replace(/:\s*University\[\]/g, "");
  src = src.replace(/:\s*string/g, "");
  src = src.replace(/:\s*number/g, "");
  src = src.replace(/\?\s*:\s*string/g, "");
  return src;
}

function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Source not found: ${SOURCE}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(SOURCE, "utf8");
  const js = stripTypeScript(raw);
  const universities = new Function(`${js}; return universities;`)();

  const payload = {
    LEVEL_TABS: [
      { id: "Bachelor", label: "Bachelor" },
      { id: "Master", label: "Master" },
      { id: "PhD", label: "PhD" },
      { id: "Research", label: "Research Courses" },
      { id: "Internship", label: "Internships & Apprenticeships" },
    ],
    universities,
  };

  fs.writeFileSync(OUT, `module.exports = ${JSON.stringify(payload, null, 2)};\n`);
  console.log(`Wrote ${universities.length} universities to ${OUT}`);
}

main();
