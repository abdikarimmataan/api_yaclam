const crypto = require("crypto");

const WAAFIPAY_RESPONSE_MESSAGES = {
  "2001": "Request processed successfully",
  "5001": "Payment could not be started. Please try again.",
  "5206": "Payment failed",
  "5301": "Invalid API credentials",
  "5302": "Invalid HPP token",
  "5303": "Invalid HPP result token",
  "5304": "Transaction reference mismatch",
  "5305": "Transaction request ID mismatch",
  "5306": "Payment cancelled by user",
  "5307": "Payment token expired",
  "5308": "This payment service is not enabled for your merchant account",
  "5309": "Payment timed out — please try again within 5 minutes",
  "5310": "Payment rejected on your phone",
};

function waafiResponseMessage(data) {
  const code = String(data?.responseCode ?? "");
  const detail = data?.params?.description?.trim();
  if (detail) return detail;
  if (WAAFIPAY_RESPONSE_MESSAGES[code]) return WAAFIPAY_RESPONSE_MESSAGES[code];
  return data?.responseMsg || "Payment request failed";
}

/** WaafiPay accepts up to 2 decimal places; extra digits are truncated server-side. */
function truncateAmount(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.trunc(num * 100) / 100;
}

/**
 * Short unique reference (max 50 chars). Long Mongo IDs get truncated by slice()
 * and break WaafiPay order creation.
 */
function buildReferenceId() {
  return `YC${Date.now()}${crypto.randomBytes(4).toString("hex")}`;
}

function buildInvoiceId() {
  return `INV${Date.now()}${crypto.randomBytes(2).toString("hex")}`;
}

/** WaafiPay expects: YYYY-MM-DD HH:mm:ss.SSS */
function nowTimestamp() {
  const d = new Date();
  const pad = (n, len = 2) => String(n).padStart(len, "0");
  const ms = pad(d.getMilliseconds(), 3);
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`;
}

/**
 * Payer mobile in full international format (e.g. 252611111111).
 * No "+" and no leading zeros after country code.
 * @see https://docs.waafipay.com/purchase-api
 */
function normalizeSomMobile(raw) {
  const digits = String(raw || "").replace(/\D+/g, "");
  if (/^0?([67]\d{7,8})$/.test(digits)) {
    return { ok: true, accountNo: "252" + digits.replace(/^0/, "").slice(-9) };
  }
  if (/^252([67]\d{7,8})$/.test(digits)) {
    return { ok: true, accountNo: "252" + digits.slice(-9) };
  }
  return {
    ok: false,
    error: "Enter a valid EVC/ZAAD number (e.g. 0612345678 or 252612345678).",
  };
}

function buildPurchasePayload({ course, accountNo, amount }) {
  const referenceId = buildReferenceId();
  const invoiceId = buildInvoiceId();

  return {
    payload: {
      schemaVersion: process.env.WAAFIPAY_SCHEMA_VERSION || "1.0",
      requestId: crypto.randomUUID(),
      timestamp: process.env.WAAFIPAY_TIMESTAMP || nowTimestamp(),
      channelName: process.env.WAAFIPAY_CHANNEL_NAME || "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid: process.env.WAAFIPAY_MERCHANT_UID,
        apiUserId: String(process.env.WAAFIPAY_API_USER_ID || ""),
        apiKey: process.env.WAAFIPAY_API_KEY,
        paymentMethod: process.env.WAAFIPAY_PAYMENT_METHOD || "MWALLET_ACCOUNT",
        payerInfo: { accountNo },
        transactionInfo: {
          referenceId,
          invoiceId,
          amount,
          currency: process.env.WAAFIPAY_CURRENCY || "USD",
          description: `Payment for course ${course.title}`.slice(0, 255),
        },
      },
    },
    referenceId,
    invoiceId,
    amount,
  };
}

function parseApprovedPayment(data) {
  if (String(data?.responseCode) !== "2001") {
    return { ok: false, message: waafiResponseMessage(data), data };
  }

  const state = String(data?.params?.state || "").toUpperCase();
  if (state && state !== "APPROVED") {
    return {
      ok: false,
      message: `Payment not approved. Status: ${state}`,
      data,
    };
  }

  const transactionId = data?.params?.transactionId || data?.transactionId;
  if (!transactionId) {
    return { ok: false, message: "Payment approved but no transaction ID returned", data };
  }

  const chargedAmount = truncateAmount(data?.params?.txAmount) ?? undefined;

  return {
    ok: true,
    transactionId,
    chargedAmount,
    state: state || "APPROVED",
    data,
  };
}

function gatewayUrl() {
  if (process.env.WAAFIPAY_GATEWAY_URL) return process.env.WAAFIPAY_GATEWAY_URL;
  if (process.env.WAAFIPAY_ENV === "sandbox") return "https://sandbox.waafipay.com/asm";
  return "https://api.waafipay.net/asm";
}

module.exports = {
  WAAFIPAY_RESPONSE_MESSAGES,
  waafiResponseMessage,
  truncateAmount,
  buildReferenceId,
  buildInvoiceId,
  normalizeSomMobile,
  buildPurchasePayload,
  parseApprovedPayment,
  gatewayUrl,
};
