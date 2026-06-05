const FLAG_UPLOADS_DIR = "/uploads/flags";
const TWEMOJI_CDN_BASE =
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72";

function flagEmojiCodepoints(code) {
  return code
    .toUpperCase()
    .split("")
    .map((char) => (127397 + char.charCodeAt(0)).toString(16))
    .join("-");
}

function buildFlagCdnUrl(code) {
  if (!code) return `${TWEMOJI_CDN_BASE}/1f30d.png`;
  return `${TWEMOJI_CDN_BASE}/${flagEmojiCodepoints(code)}.png`;
}

function getFlagFileName(code) {
  if (!code) return "global.png";
  return `${code.toLowerCase()}.png`;
}

function buildFlagIconUrl(code) {
  return `${FLAG_UPLOADS_DIR}/${getFlagFileName(code)}`;
}

module.exports = {
  FLAG_UPLOADS_DIR,
  TWEMOJI_CDN_BASE,
  buildFlagCdnUrl,
  buildFlagIconUrl,
  getFlagFileName,
  flagEmojiCodepoints,
};
