const auth = require("../auth/token");
const response = require("../utilities/reponse.utility");
const messages = require("../utilities/message.utility");

module.exports = {
  authorize: () => (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return response.customResponse(res, 401, messages.TOKEN_REQUIRED);

    const payload = auth.validateToken(token);
    if (!payload) return response.customResponse(res, 401, messages.CHECK_TOKEN);

    req.user = payload;
    next();
  },
};
