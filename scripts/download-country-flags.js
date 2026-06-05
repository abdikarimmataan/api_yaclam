const fs = require("fs");
const path = require("path");
const https = require("https");

const { COUNTRY_CODES } = require("./seed-countries.data");
const { buildFlagCdnUrl, getFlagFileName } = require("../utilities/country.utility");

const OUT_DIR = path.join(__dirname, "../uploads/flags");

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const next = res.headers.location;
          if (!next) {
            reject(new Error(`Redirect without location for ${url}`));
            return;
          }
          downloadFile(next, dest).then(resolve).catch(reject);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download ${url} (${res.statusCode})`));
          return;
        }

        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve(dest)));
        file.on("error", reject);
      })
      .on("error", reject);
  });
}

async function downloadCountryFlags() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let downloaded = 0;
  let skipped = 0;

  for (const country of COUNTRY_CODES) {
    const code = country.code ? country.code.toUpperCase() : "";
    const fileName = getFlagFileName(code);
    const dest = path.join(OUT_DIR, fileName);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      skipped += 1;
      continue;
    }

    const sourceUrl = buildFlagCdnUrl(code);
    await downloadFile(sourceUrl, dest);
    downloaded += 1;
    console.log(`Downloaded ${fileName}`);
  }

  console.log(
    `Flag download complete: ${downloaded} downloaded, ${skipped} skipped, ${COUNTRY_CODES.length} total.`
  );
}

downloadCountryFlags().catch((err) => {
  console.error("Flag download failed:", err.message);
  process.exit(1);
});
