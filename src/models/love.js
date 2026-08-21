import mongoose from "mongoose";
const { Schema, model } = mongoose;

const Love_Catalog_Schema = Schema({
  name: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  description: {
      type: String,
      required: false
  },
  code: {
      type: String,
      required: false
  },
  conversion_rate: {
      type: Number,
      required: false
  },
  can_buy: {
      type: Boolean,
      required: false
  },
  accessible: {
      type: Boolean,
      required: false
  }
}, {
    timestamps: true
});

Love_Catalog_Schema.statics.getFieldsInfo = function () {
    return Object.keys(this.schema.paths)
        .map(field => ({
            name: field,
            properties: this.schema.paths[field]
        }));
};

Love_Catalog_Schema.methods.toJSON = function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
};

const Love_Catalog = model("love_catalog", Love_Catalog_Schema);

export default Love_Catalog;