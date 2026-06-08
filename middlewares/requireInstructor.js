const response = require("../utilities/reponse.utility");

module.exports = (req, res, next) => {
  if (!req.user || req.user.accountType !== "instructor") {
    return response.customResponse(res, 403, "Instructor access required");
  }
  if (!req.user.userId) {
    return response.customResponse(res, 401, "Invalid instructor token");
  }
  next();
};
