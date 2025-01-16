import mongoose from "mongoose";


const OrderOnlineDetailSchema = new mongoose.Schema({
  order_number: {
    type: String,
    required: false // Explicitly stated
  },
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
    required: true,
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

const TransactionSchema = new mongoose.Schema({
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
  order_id:{
    type: mongoose.Types.ObjectId,
    required: true
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
  },
  order_online_details: [OrderOnlineDetailSchema],
},{timestamps: true})

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);

export default Transaction;