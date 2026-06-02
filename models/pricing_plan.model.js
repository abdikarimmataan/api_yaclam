const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const pricingPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    billingPeriod: { type: String, default: "one-time" },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    ctaButton: {
      label: { type: String, default: "Get started" },
      url: { type: String, default: "" },
      isVisible: { type: Boolean, default: true },
    },
    isVisible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

pricingPlanSchema.plugin(toJSON);
module.exports = mongoose.model("PricingPlan", pricingPlanSchema);
