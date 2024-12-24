import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  store_name: {
    type: String,
    required: true
  },
  address: {
    type: String,
  },
  store_logo: {
    type: String,
    default: "https://res.cloudinary.com/de6w2afj5/image/upload/v1735005475/11749787_bouvxl.png"
  },
  phone_number: {
    type: String,
    required: true
  },
  isDelete: {
    type: Boolean,
    default: false
  }
},{timestamps: true})

const Store = mongoose.models.Store || mongoose.model("Store", StoreSchema);

export default Store;