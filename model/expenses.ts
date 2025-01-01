import mongoose from "mongoose";


const ExpenseSchema = new mongoose.Schema({
  store_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  expenses_title: {
    type: String,
    required: true
  },
  expenses_description: {
    type: String,
    required: true
  },
  expenses_price: {
    type: Number,
    required: true
  },
  user_id: {
    type: mongoose.Types.ObjectId,
    default: null,
  },
  expenses_date:{
    type: Date,
    required: true
  },
  isDelete: {
    type: Boolean,
    default: false
  }
}, {timestamps: true});

const Expense = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

export default Expense;