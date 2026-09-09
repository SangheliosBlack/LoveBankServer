import mongoose from "mongoose";
const { Schema, model } = mongoose;

const normalizeObjectId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value?._id) return value._id.toString();
  return value.toString();
};

const Transaction_Catalog_Schema = Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  docType: {
    type: Schema.Types.ObjectId,
    ref: "love_catalog",
    required: true
  }
}, {
    timestamps: true
});

Transaction_Catalog_Schema.methods.toJSON = function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
};

Transaction_Catalog_Schema.methods.isSentBy = function (userId) {
  if (!userId) return false;
  return normalizeObjectId(this.sender) === normalizeObjectId(userId);
};

Transaction_Catalog_Schema.methods.isReceivedBy = function (userId) {
  if (!userId) return false;
  return normalizeObjectId(this.receiver) === normalizeObjectId(userId);
};

Transaction_Catalog_Schema.methods.getDirectionForUser = function (userId) {
  if (this.isSentBy(userId)) return "sent";
  if (this.isReceivedBy(userId)) return "received";
  return "none";
};

Transaction_Catalog_Schema.methods.toJSONForUser = function (userId) {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  if (userId) {
    const direction = this.getDirectionForUser(userId);
    object.direction = direction;
    object.isMine = direction === "sent";
    object.wasSentToMe = direction === "received";
  }
  return object;
};

Transaction_Catalog_Schema.statics.toJSONListForUser = function (transactions, userId) {
  if (!Array.isArray(transactions)) return [];
  return transactions.map((transaction) => {
    if (transaction?.toJSONForUser) return transaction.toJSONForUser(userId);
    const { __v, _id, ...object } = transaction || {};
    object.id = _id;
    if (userId) {
      object.direction = "none";
      object.isMine = false;
      object.wasSentToMe = false;
    }
    return object;
  });
};

const Transaction_Catalog = model("transactions", Transaction_Catalog_Schema);

export default Transaction_Catalog;