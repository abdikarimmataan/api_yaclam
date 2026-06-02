module.exports = {
  toJSON: (schema) => {
    schema.virtual("id").get(function () {
      const _id = this._id;
      if (_id && typeof _id.toHexString === "function") return _id.toHexString();
      if (_id != null) return String(_id);
      return undefined;
    });

    const transform = (_doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    };

    schema.set("toJSON", { virtuals: true, versionKey: false, transform });
    schema.set("toObject", { virtuals: true, versionKey: false, transform });
  },
};
