const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const wishlistItemSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [wishlistItemSchema], default: [] },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

wishlistSchema.plugin(toJSON);
module.exports = mongoose.model("Wishlist", wishlistSchema, "wishlists");
