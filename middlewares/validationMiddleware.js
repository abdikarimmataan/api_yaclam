module.exports = {
  validate: (schema, source = "body") => (req, res, next) => {
    const target =
      source === "params" ? req.params : source === "query" ? req.query : req.body;

    const { error, value } = schema.validate(target, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(422).json({ errors });
    }

    if (source === "params") req.params = value;
    else if (source === "query") req.query = value;
    else req.body = value;

    next();
  },
};
