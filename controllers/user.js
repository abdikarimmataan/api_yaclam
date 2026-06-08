const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const User = require("../models/user.model");
const Role = require("../models/role.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");
const EmailUtility = require("../utilities/email.utility.js");
const tokens = require("../auth/token");

function stripPassword(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
}

async function listByAccountType(req, res, accountType) {
  try {
    const filter = { del_status: "Live", accountType };
    const total = await User.countDocuments(filter);
    const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

    if (total === 0) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
    if (pagination.page > pagination.pages) {
      return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
    }

    pagination.data = await User.find(filter)
      .select("-password -session")
      .populate("roleId", "name")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(pagination.pageSize);

    if (!pagination.data.length) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);

    return Response.paginationResponse(res, 200, pagination);
  } catch (err) {
    return Response.errorResponse(res, 500, err.message || err);
  }
}

module.exports = {
  register: async (req, res) => {
    try {
      const { fullname, email, password, status = true } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase(), del_status: "Live" });
      if (existing) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      await User.create({
        email: email.toLowerCase(),
        password: hashed,
        accountType: "student",
        profile: { full_name: fullname },
        status,
        approve: true,
      });

      return Response.customResponse(res, 201, "Registration successful");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({
        email: email.toLowerCase(),
        del_status: "Live",
        accountType: "student",
      }).select("+password");

      if (!user) return Response.customResponse(res, 400, ResponseMessage.INVALID_CREDENTIALS);

      if (!user.status) {
        return Response.customResponse(res, 400, "Account is not active");
      }

      if (!user.approve) {
        return Response.customResponse(res, 400, "Account pending approval");
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        user.failed_logins += 1;
        await user.save();
        return Response.customResponse(res, 400, "Invalid email or password");
      }

      const { accessToken, refreshToken } = tokens.generateToken(user._id, user.accountType);
      user.session = { refresh_token: refreshToken, last_access_token: accessToken };
      user.last_login = new Date();
      user.failed_logins = 0;
      await user.save();

      return Response.successResponse(res, 200, {
        user: stripPassword(user),
        accessToken,
        refreshToken,
      });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({
        email: email.toLowerCase(),
        del_status: "Live",
        accountType: "student",
      });

      if (user) {
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.password_reset_token = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.password_reset_expires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        await EmailUtility.sendPasswordResetEmail(user.email, resetToken);
      }

      return Response.customResponse(
        res,
        200,
        "If an account with that email exists, a password reset link has been sent"
      );
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const user = await User.findOne({
        password_reset_token: hashedToken,
        password_reset_expires: { $gt: new Date() },
        del_status: "Live",
        accountType: "student",
      }).select("+password_reset_token +password_reset_expires");

      if (!user) {
        return Response.customResponse(res, 400, "Invalid or expired reset token");
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.password_reset_token = null;
      user.password_reset_expires = null;
      user.failed_logins = 0;
      await user.save();

      return Response.customResponse(res, 200, "Password reset successful");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  changePassword: async (req, res) => {
    try {
      if (req.user?.accountType !== "student") {
        return Response.customResponse(res, 403, ResponseMessage.ACCESS_DENIED);
      }

      const { currentPassword, newPassword } = req.body;
      const user = await User.findOne({
        _id: req.user.userId,
        del_status: "Live",
        accountType: "student",
      }).select("+password");

      if (!user) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return Response.customResponse(res, 400, "Current password is incorrect");

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      return Response.customResponse(res, 200, "Password changed successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  loginAdmin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({
        email: email.toLowerCase(),
        del_status: "Live",
        accountType: "admin",
      }).select("+password");

      if (!user) return Response.customResponse(res, 400, "Invalid email or password");
      if (!user.status) return Response.customResponse(res, 400, "Account is not active");

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return Response.customResponse(res, 400, "Invalid email or password");

      const { accessToken, refreshToken } = tokens.generateToken(user._id, user.accountType);
      user.session = { refresh_token: refreshToken, last_access_token: accessToken };
      user.last_login = new Date();
      await user.save();

      return Response.successResponse(res, 200, {
        user: stripPassword(user),
        accessToken,
        refreshToken,
      });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAdminUsers: (req, res) => listByAccountType(req, res, "admin"),
  getStudents: (req, res) => listByAccountType(req, res, "student"),

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const user = await User.findOne({ _id: id, del_status: "Live" })
        .select("-password -session")
        .populate("roleId", "name");
      if (!user) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, user);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  bootstrapAdmin: async (req, res) => {
    try {
      const adminCount = await User.countDocuments({
        del_status: "Live",
        accountType: "admin",
      });
      if (adminCount > 0) {
        return Response.customResponse(res, 409, "Admin already exists. Use admin login and POST /users/admin/create");
      }

      const { email, password, phone, profile } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase(), del_status: "Live" });
      if (existing) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);

      let role = await Role.findOne({ name: "Super Admin", del_status: "Live" });
      if (!role) {
        role = await Role.create({
          name: "Super Admin",
          description: "Full access",
          permissions: ["*"],
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      const user = await User.create({
        email: email.toLowerCase(),
        password: hashed,
        phone: phone || "",
        profile,
        accountType: "admin",
        roleId: role._id,
        createdBy: null,
        approve: true,
      });

      const populated = await User.findById(user._id)
        .select("-password -session")
        .populate("roleId", "name description permissions");

      return Response.successResponse(res, 201, populated);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  createAdmin: async (req, res) => {
    try {
      if (req.user?.accountType !== "admin") {
        return Response.customResponse(res, 403, ResponseMessage.ACCESS_DENIED);
      }

      const { email, password, phone, profile, roleId } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase(), del_status: "Live" });
      if (existing) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);

      let assignedRoleId = null;
      if (roleId && isValidObjectId(roleId)) {
        const role = await Role.findOne({ _id: roleId, del_status: "Live" });
        if (!role) return Response.customResponse(res, 404, "Role not found");
        assignedRoleId = role._id;
      } else if (roleId) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      const user = await User.create({
        email: email.toLowerCase(),
        password: hashed,
        phone: phone || "",
        profile,
        accountType: "admin",
        roleId: assignedRoleId,
        createdBy: req.user.userId,
        approve: true,
      });

      const populated = await User.findById(user._id)
        .select("-password -session")
        .populate("roleId", "name description permissions");

      return Response.successResponse(res, 201, populated);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  updateAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });

      const user = await User.findOne({ _id: id, del_status: "Live" });
      if (!user) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      const { email, phone, profile, roleId, status, approve } = req.body;
      if (email) user.email = email.toLowerCase();
      if (phone !== undefined) user.phone = phone;
      if (profile) user.profile = { ...user.profile.toObject(), ...profile };
      if (roleId !== undefined) user.roleId = roleId || null;
      if (status !== undefined) user.status = status;
      if (approve !== undefined) user.approve = approve;

      await user.save();
      return Response.successResponse(res, 200, stripPassword(user));
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });

      const user = await User.findOneAndUpdate(
        { _id: id, del_status: "Live" },
        { status },
        { new: true }
      ).select("-password");
      if (!user) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, user);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  softDelete: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });

      const user = await User.findOneAndUpdate(
        { _id: id, del_status: "Live" },
        { del_status: "Deleted", deleted_at: new Date() },
        { new: true }
      );
      if (!user) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.customResponse(res, 200, "User deleted");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.user.userId, del_status: "Live" }).select("-password");
      if (!user) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, user);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
