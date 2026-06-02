const mongoose = require("mongoose");

const buttonSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    url: { type: String, default: "" },
    style: { type: String, default: "primary" },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const linkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    url: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const statItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

module.exports = { buttonSchema, linkSchema, statItemSchema };
