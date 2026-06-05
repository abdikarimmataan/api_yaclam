const { parseCourseBody } = require("../utilities/course.utility");

module.exports = (req, _res, next) => {
  req.body = parseCourseBody(req.body);
  next();
};
