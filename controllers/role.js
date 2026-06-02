const Role = require("../models/role.model");
const response = require("../utilities/reponse.utility");
const message = require("../utilities/message.utility");
const PaginationUtility = require("../utilities/pagination_utility");

module.exports = {
  getAll: async (req, res) => {
    try {
      const filter = { del_status: "Live" };
      const total = await Role.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);
      pagination.data = await Role.find(filter).sort({ name: 1 }).skip(skip).limit(pagination.pageSize);
      return response.paginationResponse(res, 200, pagination);
    } catch (err) {
      return response.errorResponse(res, 500, err);
    }
  },

  create: async (req, res) => {
    try {
      const role = await Role.create(req.body);
      return response.successResponse(res, 201, role);
    } catch (err) {
      if (err.code === 11000) return response.customResponse(res, 409, message.DATA_EXISTS);
      return response.errorResponse(res, 500, err);
    }
  },

  update: async (req, res) => {
    try {
      const role = await Role.findOneAndUpdate(
        { _id: req.params.id, del_status: "Live" },
        req.body,
        { new: true }
      );
      if (!role) return response.customResponse(res, 404, message.NOT_FOUND);
      return response.successResponse(res, 200, role);
    } catch (err) {
      return response.errorResponse(res, 500, err);
    }
  },

  delete: async (req, res) => {
    try {
      const role = await Role.findOneAndUpdate(
        { _id: req.params.id, del_status: "Live" },
        { del_status: "Deleted" },
        { new: true }
      );
      if (!role) return response.customResponse(res, 404, message.NOT_FOUND);
      return response.customResponse(res, 200, "Role deleted");
    } catch (err) {
      return response.errorResponse(res, 500, err);
    }
  },
};
