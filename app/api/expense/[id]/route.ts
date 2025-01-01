import { connectDB } from "@/config/mongo-connect";
import { decodeToken } from "@/middleware/authentication";
import Expense from "@/model/expenses";
import Store from "@/model/store";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (req: NextRequest, {params}: {params: {id: string}}) => {
  try{

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

    const expense = await Expense.findOne({ _id: params.id });

    return new NextResponse(JSON.stringify(expense), { status: 200 });

  }catch(err){
    console.error("Error getting expenses:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const PUT = async (
  req: NextRequest, //eslint-disable-line
  { params }: { params: { id: string } }
) => {
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

    const expense = await Expense.findById(params.id);
    if (!expense) {
      return new NextResponse("Expense not found", { status: 404 });
    }

    if (expense.store_id.toString() !== store._id.toString()) {
      return new NextResponse(
        "Unauthorized: You are not the owner of this expense",
        { status: 401 }
      );
    }

    await Expense.findByIdAndUpdate(
      params.id,
      {
        store_id: store._id,
        expenses_title: body.expenses_title,
        expenses_description: body.expenses_description,
        expenses_price: body.expenses_price,
        expenses_date: body.expenses_date,
      },
      { new: true }
    );

    return new NextResponse("Expense updated successfuly", { status: 200 });

  } catch (err) {
    console.log("Error updating expenses", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};


export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
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

    const expense = await Expense.findById(params.id);
    if (!expense) {
      return new NextResponse("Expense not found", { status: 404 });
    }

    if (expense.store_id.toString() !== store._id.toString()) {
      return new NextResponse(
        "Unauthorized: You are not the owner of this expense",
        { status: 401 }
      );
    }

    await Expense.findByIdAndUpdate(params.id, { isDelete: true });

    return new NextResponse("Expense deleted", { status: 200 });
  } catch (err) {
    console.error("Error deleting expense:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};