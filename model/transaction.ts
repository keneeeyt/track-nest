import mongoose, { Schema } from "mongoose";

const OrderOnlineDetailSchema = new mongoose.Schema({
  order_number: {
    type: String,
    required: false, // Explicitly stated
  },
  customer_name: {
    type: String,
    required: false,
    trim: true, // Removes leading/trailing spaces
  },
  customer_phone: {
    type: String,
    required: false,
    match: [/^(\+639|09)\d{9}$/, "Invalid phone number format"],
  },
  customer_address: {
    type: String,
    required: false,
    trim: true,
  },
});

const TransactionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User", // Assuming this references a User model
    },
    store_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Store", // Assuming this references a Store model
    },
    order_id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    transaction_items: [{ type: Schema.Types.Mixed }], // Flexible array of objects
    transaction_total: {
      type: Number,
      required: true,
    },
    transaction_date: {
      type: Date,
      required: true,
    },
    transaction_type: {
      type: String,
    },
    transaction_online_details: [OrderOnlineDetailSchema],
  },
  { timestamps: true }
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);

export default Transaction;
