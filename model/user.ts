import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
  },
  profile_image: {
    type: String,
  },
  password: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
  },
  address: {
    type: String,
  },
  isDelete: {
    type: Boolean,
    default: false
  }
},{timestamps: true})

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;