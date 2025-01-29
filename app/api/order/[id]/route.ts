import { connectDB } from "@/config/mongo-connect";
import { decodeToken } from "@/middleware/authentication";
import Order from "@/model/order";
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
