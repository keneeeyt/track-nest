import { connectDB } from "@/config/mongo-connect";
import { decodeToken } from "@/middleware/authentication";
import Order from "@/model/order";
import Transaction from "@/model/transaction";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
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
    const { role } = isOwner;

    if (role !== "owner") {
      return new NextResponse("Unauthorized: You are not an owner.", {
        status: 401,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return new NextResponse("Invalid product ID", { status: 400 });
    }

    const order = await Order.findById(params.id);

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    return new NextResponse(JSON.stringify(order), { status: 200 });
  } catch (err) {
    console.error("Error getting order:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest, // eslint-disable-line
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const accessToken = cookies().get("access-token")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized: Token is missing or invalid." },
        { status: 401 }
      );
    }

    const user = decodeToken(accessToken);
    if (user.role !== "owner") {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to perform this action." },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const transaction = await Transaction.findOne({ order_id: params.id });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Delete both the order and transaction concurrently
    await Promise.all([order.deleteOne(), transaction.deleteOne()]);

    return NextResponse.json(
      { message: "Order and transaction deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting order:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: (err as Error).message },
      { status: 500 }
    );
  }
};
