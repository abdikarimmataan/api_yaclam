const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Instructor = require("../models/instructor.model");
const InstructorRole = require("../models/instructor_role.model");
const { buildInstructorPayload } = require("../utilities/instructor.utility");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");
const tokens = require("../auth/token");
const upload = require("../middlewares/upload.middleware");

function stripPassword(instructor) {
  const obj = instructor.toObject ? instructor.toObject() : { ...instructor };
  delete obj.password;
  return obj;
}

async function validateInstructorRoleId(roleId) {
  if (!roleId) return null;
  if (!isValidObjectId(roleId)) return { error: ResponseMessage.INVALID_ID };
  const role = await InstructorRole.findOne({ _id: roleId, del_status: "Live" });
  if (!role) return { error: "Instructor role not found" };
  return { roleId: role._id };
}

module.exports = {
  create: async (req, res) => {
    try {
      const { email, password, instructorRoleId } = req.body;

      const existing = await Instructor.findOne({ email: email.toLowerCase(), del_status: "Live" });
      if (existing) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);

      const roleCheck = await validateInstructorRoleId(instructorRoleId);
      if (roleCheck?.error) {
        const status = roleCheck.error === ResponseMessage.INVALID_ID ? 400 : 404;
        return Response.customResponse(res, status, roleCheck.error);
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      const payload = buildInstructorPayload(req.body);
      const doc = new Instructor({
        ...payload,
        email: email.toLowerCase(),
        password: hashed,
        instructorRoleId: roleCheck?.roleId ?? null,
      });
      const saved = await doc.save();
      const populated = await Instructor.findById(saved._id)
        .select("-password -session")
        .populate("instructorRoleId", "name description");

      return Response.successResponse(res, 201, populated);
    } catch (err) {
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const instructor = await Instructor.findOne({
        email: email.toLowerCase(),
        del_status: "Live",
        status: "active",
      }).select("+password");

      if (!instructor) return Response.customResponse(res, 400, ResponseMessage.INVALID_CREDENTIALS);

      const valid = await bcrypt.compare(password, instructor.password);
      if (!valid) return Response.customResponse(res, 400, ResponseMessage.INVALID_CREDENTIALS);

      const { accessToken, refreshToken } = tokens.generateToken(instructor._id, "instructor");
      instructor.session = { refresh_token: refreshToken, last_access_token: accessToken };
      instructor.last_login = new Date();
      await instructor.save();

      const populated = await Instructor.findById(instructor._id)
        .select("-password -session")
        .populate("instructorRoleId", "name description");

      return Response.successResponse(res, 200, {
        instructor: stripPassword(populated),
        accessToken,
        refreshToken,
      });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const filter = { del_status: "Live" };
      const total = await Instructor.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      if (pagination.page > pagination.pages) return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);

      pagination.data = await Instructor.find(filter)
        .select("-password -session")
        .populate("instructorRoleId", "name description")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pagination.pageSize);
      if (!pagination.data.length) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);

      return Response.paginationResponse(res, 200, pagination);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      const doc = await Instructor.findOne({ _id: id, del_status: "Live" })
        .select("-password -session")
        .populate("instructorRoleId", "name description");
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, doc);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      const doc = await Instructor.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      const { password, instructorRoleId, email } = req.body;

      if (instructorRoleId !== undefined) {
        const roleCheck = await validateInstructorRoleId(instructorRoleId);
        if (roleCheck?.error) {
          const status = roleCheck.error === ResponseMessage.INVALID_ID ? 400 : 404;
          return Response.customResponse(res, status, roleCheck.error);
        }
        doc.instructorRoleId = roleCheck?.roleId ?? null;
      }

      if (email) {
        const duplicate = await Instructor.findOne({
          email: email.toLowerCase(),
          del_status: "Live",
          _id: { $ne: id },
        });
        if (duplicate) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
        doc.email = email.toLowerCase();
      }

      Object.assign(doc, buildInstructorPayload(req.body));

      if (password) {
        const salt = await bcrypt.genSalt(10);
        doc.password = await bcrypt.hash(password, salt);
      }

      const updated = await doc.save();
      const populated = await Instructor.findById(updated._id)
        .select("-password -session")
        .populate("instructorRoleId", "name description");

      return Response.successResponse(res, 200, populated);
    } catch (err) {
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      const doc = await Instructor.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      doc.del_status = "Deleted";
      await doc.save();
      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  uploadPhoto: async (req, res) => {
    try {
      if (!req.file?.filename) {
        return Response.errorResponse(res, 400, { message: "photo file is required" });
      }
      const photo = upload.toPublicPath(req.file.filename, "instructor");
      return Response.successResponse(res, 200, { photo });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
