import mongoose from "mongoose";

const OrderOnlineDetailSchema = new mongoose.Schema({
  customer_name: {
    type: String,
    required: false,
    trim: true // Removes leading/trailing spaces
  },
  customer_phone: {
    type: String,
    required: false,
    match: [/^(\+639|09)\d{9}$/, "Invalid phone number format"]
  },
  customer_address: {
    type: String,
    required: false,
    trim: true
  }
});

const OrderItemsSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    ref: "Product" // Assuming this references a Product model
  },
  quantity: {
    type: Number,
  },
  price: {
    type: Number,
  },
  product_name: {
    type: String,
  },
  product_image: {
    type: String,
  }
})

const OrderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User" // Assuming this references a User model
  },
  store_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Store" // Assuming this references a Store model
  },
  order_items: [OrderItemsSchema],
  order_total: {
    type: Number,
    required: true
  },
  order_date: {
    type: Date,
    required: true
  },
  order_type: {
    type: String,
    required: true,
    enum: ["online", "walk-in"] // Example of restricted types
  },
  order_online_details: [OrderOnlineDetailSchema],
  isDelete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
