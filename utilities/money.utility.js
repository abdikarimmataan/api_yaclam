/** Parse money amounts with up to 2 decimal places (WaafiPay-compatible). */
function parseMoney(value) {
  if (value === null || value === undefined || value === "") return 0;
  const n = parseFloat(String(value).replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

module.exports = { parseMoney };
