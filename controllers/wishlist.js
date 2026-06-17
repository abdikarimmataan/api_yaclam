const mongoose = require("mongoose");
const Wishlist = require("../models/wishlist.model");
const Course = require("../models/course.model");
const Response = require("../utilities/reponse.utility");
const message = require("../utilities/message.utility");

async function getOrCreateWishlist(userId) {
  let wishlist = await Wishlist.findOne({ userId, del_status: "Live" });
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, items: [] });
  }
  return wishlist;
}

module.exports = {
  getWishlist: async (req, res) => {
    try {
      const wishlist = await getOrCreateWishlist(req.user.userId);
      const populated = await Wishlist.findById(wishlist._id).populate(
        "items.courseId",
        "title thumbnail price isFree instructorName level duration category originalPrice isFeatured badge color"
      );
      return Response.successResponse(res, 200, populated);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  addItem: async (req, res) => {
    try {
      const { courseId } = req.body;
      if (!mongoose.isValidObjectId(courseId)) {
        return Response.customResponse(res, 400, message.INVALID_ID);
      }

      const course = await Course.findOne({
        _id: courseId,
        del_status: "Live",
        isVisible: { $ne: false },
      });
      if (!course) return Response.customResponse(res, 404, "Course not found");

      const wishlist = await getOrCreateWishlist(req.user.userId);
      const exists = wishlist.items.find((i) => String(i.courseId) === String(courseId));
      if (exists) return Response.customResponse(res, 409, "Course already in wishlist");

      wishlist.items.push({ courseId });
      await wishlist.save();

      const populated = await Wishlist.findById(wishlist._id).populate(
        "items.courseId",
        "title thumbnail price isFree instructorName level duration category originalPrice isFeatured badge color"
      );
      return Response.successResponse(res, 200, populated);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  removeItem: async (req, res) => {
    try {
      const { courseId } = req.params;
      const wishlist = await getOrCreateWishlist(req.user.userId);
      wishlist.items = wishlist.items.filter((i) => String(i.courseId) !== String(courseId));
      await wishlist.save();

      const populated = await Wishlist.findById(wishlist._id).populate(
        "items.courseId",
        "title thumbnail price isFree instructorName level duration category originalPrice isFeatured badge color"
      );
      return Response.successResponse(res, 200, populated);
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },

  checkItem: async (req, res) => {
    try {
      const { courseId } = req.params;
      const wishlist = await Wishlist.findOne({ userId: req.user.userId, del_status: "Live" });
      const saved = wishlist
        ? wishlist.items.some((i) => String(i.courseId) === String(courseId))
        : false;
      return Response.successResponse(res, 200, { saved });
    } catch (err) {
      return Response.errorResponse(res, 500, err);
    }
  },
};
