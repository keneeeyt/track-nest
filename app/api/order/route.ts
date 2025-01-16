import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/mongo-connect";
import { decodeToken } from "@/middleware/authentication";
import Store from "@/model/store";
import Order from "@/model/order";
import { cookies } from "next/headers";
import Product from "@/model/product";
import mongoose from "mongoose";
import Transaction from "@/model/transaction";


const updateProductQuantity = async (orderItems: { _id: mongoose.ObjectId, quantity: number }[]) => {
  for (const item of orderItems) {
    const product = await Product.findById(item._id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.quantity < item.quantity) {
      throw new Error(`Insufficient quantity for product ${product._id}`);
    }

    product.quantity -= item.quantity;

    await product.save();
  }

  return true;
}

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
    const dateNow = new Date();

    if (await updateProductQuantity(body.order_items)) {
      const order = new Order({
        user_id: id,
        store_id: store._id,
        order_items: body.order_items,
        order_date: dateNow,
        order_total: body.order_total,
        order_type: body.order_type,
        order_online_details: body.order_online_details,
      });

      const transaction = new Transaction({
        user_id: id,
        store_id: store._id,
        order_id: order._id,
        order_items: body.order_items,
        order_total: body.order_total,
        order_date: dateNow,
        order_type: body.order_type,
        order_online_details: body.order_online_details,
      });

      await order.save();
      await transaction.save();

      return new NextResponse("Order created successfully", { status: 201 });
    } else {
      return new NextResponse("Failed to update product quantities", { status: 400 });
    }
  } catch (err) {
    console.error("Error creating order:", err);
    let message = "Internal Server Error";
    if (err instanceof Error) {
      message = err.message;
    }
    return new NextResponse(message, { status: 500 });
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

    const totalOrder = await Order.aggregate([
      { $match: { store_id: store._id, isDelete: false } },
      { $group: { _id: null, total: { $sum: "$order_total" } } },
    ]);

    const totalOrderPrice = totalOrder.length > 0 ? totalOrder[0].total : 0;

    const orders = await Order.find({ store_id: store._id }).sort({ createdAt: -1 });

    return new NextResponse(JSON.stringify({orders, totalOrderPrice}), { status: 200 });
  } catch (err) {
    console.error("Error fetching orders:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
