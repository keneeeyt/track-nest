import { connectDB } from "@/config/mongo-connect";
import { decodeToken } from "@/middleware/authentication";
import Expense from "@/model/expenses";
import Store from "@/model/store";
import Transaction from "@/model/transaction";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    const cookieStore = cookies();
    const accessToken = cookieStore.get("access-token")?.value;
    if (!accessToken) {
      return new NextResponse("Unauthorized: Token is missing or invalid.", {
        status: 401,
      });
    }

    const isOwner = decodeToken(accessToken);
    const { role, id } = isOwner;

    if (role !== "owner") {
      return new NextResponse("Unauthorized: You are not an owner.", {
        status: 401,
      });
    }

    const store = await Store.findOne({ owner_id: id });
    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    const body = await req.json();

    const expense = new Expense({
      store_id: store._id,
      expenses_title: body.expenses_title,
      expenses_description: body.expenses_description,
      expenses_price: body.expenses_price,
      expenses_date: body.expenses_date,
      user_id: id
    });

    const transaction = new Transaction({
      user_id: id,
      store_id: store._id,
      order_id: expense._id,
      order_items: [{
        _id: expense._id,
        quantity: 1,
        price: body.expenses_price,
        product_name: body.expenses_title,
        product_image: "",
      }],
      order_total: body.expenses_price,
      order_date: body.expenses_date,
      order_type: "expenses"
    })

    await expense.save();
    await transaction.save();

    return new NextResponse("Expense created", { status: 201 });
  } catch (err) {
    console.log("Error creating expenses", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const GET = async () => {
  try {
    await connectDB();

    const cookieStore = cookies();
    const accessToken = cookieStore.get("access-token")?.value;
    if (!accessToken) {
      return new NextResponse("Unauthorized: Token is missing or invalid.", {
        status: 401,
      });
    }

    const isOwner = decodeToken(accessToken);
    const { role, id } = isOwner;

    if (role !== "owner") {
      return new NextResponse("Unauthorized: You are not an owner.", {
        status: 401,
      });
    }

    const store = await Store.findOne({ owner_id: id });
    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    const totalExpenses = await Expense.aggregate([
      { $match: { store_id: store._id, isDelete: false } },
      { $group: { _id: null, total: { $sum: "$expenses_price" } } },
    ]);

    const totalExpensesPrice = totalExpenses.length > 0 ? totalExpenses[0].total : 0;

    const expenses = await Expense.find({ store_id: store._id, isDelete: false });

    return new NextResponse(JSON.stringify({ expenses, totalExpensesPrice }), { status: 200 });
  } catch (err) {
    console.log("Error getting expenses", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
