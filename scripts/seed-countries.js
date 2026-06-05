require("dotenv").config();

const db = require("../config/db");
const Country = require("../models/country.model");
const { buildFlagIconUrl } = require("../utilities/country.utility");
const { COUNTRY_CODES } = require("./seed-countries.data");

async function seedCountries() {
  await db.connectDB();

  const ops = COUNTRY_CODES.map((country) => {
    const code = country.code ? country.code.toUpperCase() : "";
    const flag = buildFlagIconUrl(code);

    return {
      updateOne: {
        filter: { name: country.name },
        update: {
          $set: {
            name: country.name,
            code,
            flag,
            isVisible: true,
            del_status: "Live",
          },
        },
        upsert: true,
      },
    };
  });

  const result = await Country.bulkWrite(ops);
  const upserted = result.upsertedCount ?? 0;
  const modified = result.modifiedCount ?? 0;

  console.log(`Countries seeded: ${COUNTRY_CODES.length} total (${upserted} inserted, ${modified} updated).`);
  process.exit(0);
}

seedCountries().catch((err) => {
  console.error("Country seed failed:", err.message);
  process.exit(1);
});
