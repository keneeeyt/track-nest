import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  store_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  product_name: {
    type: String,
    required: true
  },
  product_description: {
    type: String,
    required: true
  },
  isDelete: {
    type: Boolean,
    default: false
  },
  product_image: {
    type: String,
    default: "https://res.cloudinary.com/de6w2afj5/image/upload/v1735005475/11749787_bouvxl.png"
  }
},{timestamps: true})

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;