const Stripe = require("stripe");

function getPublicKey() {
  return process.env.STRIPE_PUBLIC_KEY || process.env.STRIPE_PUBLISHABLE_KEY || "";
}

function isConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && getPublicKey());
}

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function truncateAmount(price) {
  const amount = Number(price);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100) / 100;
}

function serializeStripeObject(value) {
  if (value == null) return null;
  if (Array.isArray(value)) return value.map(serializeStripeObject);
  if (typeof value === "object") {
    if (typeof value.toJSON === "function") {
      return serializeStripeObject(value.toJSON());
    }
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = serializeStripeObject(nested);
    }
    return out;
  }
  return value;
}

async function fetchStripePaymentLogData(stripe, { paymentIntentId, sessionId } = {}) {
  const payload = {
    provider: "stripe",
    retrievedAt: new Date().toISOString(),
  };

  if (paymentIntentId) {
    const paymentIntent = await stripe.paymentIntents.retrieve(String(paymentIntentId), {
      expand: [
        "payment_method",
        "latest_charge",
        "latest_charge.balance_transaction",
        "latest_charge.payment_method_details",
        "customer",
      ],
    });
    payload.paymentIntent = serializeStripeObject(paymentIntent);

    const latestCharge = paymentIntent.latest_charge;
    if (latestCharge && typeof latestCharge === "string") {
      const charge = await stripe.charges.retrieve(latestCharge, {
        expand: ["balance_transaction", "payment_method_details"],
      });
      payload.charge = serializeStripeObject(charge);
    }

    return payload;
  }

  if (sessionId) {
    const session = await stripe.checkout.sessions.retrieve(String(sessionId), {
      expand: [
        "payment_intent",
        "payment_intent.payment_method",
        "payment_intent.latest_charge",
        "payment_intent.latest_charge.balance_transaction",
        "line_items",
        "customer",
      ],
    });
    payload.checkoutSession = serializeStripeObject(session);

    const sessionPaymentIntent = session.payment_intent;
    if (sessionPaymentIntent && typeof sessionPaymentIntent === "object") {
      payload.paymentIntent = serializeStripeObject(sessionPaymentIntent);
    } else if (sessionPaymentIntent) {
      const paymentIntent = await stripe.paymentIntents.retrieve(String(sessionPaymentIntent), {
        expand: [
          "payment_method",
          "latest_charge",
          "latest_charge.balance_transaction",
          "customer",
        ],
      });
      payload.paymentIntent = serializeStripeObject(paymentIntent);
    }

    return payload;
  }

  return payload;
}

module.exports = {
  getPublicKey,
  isConfigured,
  getStripe,
  truncateAmount,
  serializeStripeObject,
  fetchStripePaymentLogData,
};
