const mongoose = require("mongoose");
const Cart = require("../models/cart.model");
const Course = require("../models/course.model");
const response = require("../utilities/reponse.utility");
const message = require("../utilities/message.utility");

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
}

module.exports = {
  getCart: async (req, res) => {
    try {
      const cart = await getOrCreateCart(req.user.userId);
      const populated = await Cart.findById(cart._id).populate("items.courseId");
      return response.successResponse(res, 200, populated);
    } catch (err) {
      return response.errorResponse(res, 500, err);
    }
  },

  addItem: async (req, res) => {
    try {
      const { courseId } = req.body;
      if (!mongoose.isValidObjectId(courseId)) {
        return response.customResponse(res, 400, message.INVALID_ID);
      }

      const course = await Course.findOne({
        _id: courseId,
        del_status: "Live",
        isVisible: { $ne: false },
      });
      if (!course) return response.customResponse(res, 404, "Course not found");

      const cart = await getOrCreateCart(req.user.userId);
      const exists = cart.items.find((i) => String(i.courseId) === String(courseId));
      if (exists) return response.customResponse(res, 409, "Course already in cart");

      cart.items.push({ courseId, priceAtAdd: course.price });
      await cart.save();

      const populated = await Cart.findById(cart._id).populate("items.courseId");
      return response.successResponse(res, 200, populated);
    } catch (err) {
      return response.errorResponse(res, 500, err);
    }
  },

  removeItem: async (req, res) => {
    try {
      const { courseId } = req.params;
      const cart = await getOrCreateCart(req.user.userId);
      cart.items = cart.items.filter((i) => String(i.courseId) !== String(courseId));
      await cart.save();
      const populated = await Cart.findById(cart._id).populate("items.courseId");
      return response.successResponse(res, 200, populated);
    } catch (err) {
      return response.errorResponse(res, 500, err);
    }
  },

  clearCart: async (req, res) => {
    try {
      const cart = await getOrCreateCart(req.user.userId);
      cart.items = [];
      await cart.save();
      return response.successResponse(res, 200, cart);
    } catch (err) {
      return response.errorResponse(res, 500, err);
    }
  },
};
