import { connectDB } from "@/config/mongo-connect";
import { decodeToken } from "@/middleware/authentication";
import Store from "@/model/store";
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
    if (!accessToken)
      return new NextResponse("Unauthorized: Token is missing or invalid.", {
        status: 401,
      });

    const isAdmin = decodeToken(accessToken);

    if (
      !isAdmin ||
      (isAdmin.email !== `${process.env.VALID_EMAIL_ADMIN}` &&
        isAdmin.email !== "cervantes.klc@gmail.com")
    )
      return new NextResponse("Unauthorized", { status: 40 });

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse("Invalid Store ID", { status: 400 });
    }

    const store = await Store.findById(id);

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    return new NextResponse(JSON.stringify(store), { status: 200 });
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const cookieStore = cookies();
    const accessToken = cookieStore.get("access-token")?.value;
    if (!accessToken)
      return new NextResponse("Unauthorized: Token is missing or invalid.", {
        status: 401,
      });

    const isAdmin = decodeToken(accessToken);

    if (
      !isAdmin ||
      (isAdmin.email !== `${process.env.VALID_EMAIL_ADMIN}` &&
        isAdmin.email !== "cervantes.klc@gmail.com")
    )
      return new NextResponse("Unauthorized", { status: 40 });

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse("Invalid Store ID", { status: 400 });
    }

    const body = await req.json();

    if (body.store_logo.length > 0) {
      body.store_logo = body.store_logo[0];
    }

    await Store.findByIdAndUpdate(id, body);

    return new NextResponse("Store updated successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest, //eslint-disable-line
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const cookieStore = cookies();
    const accessToken = cookieStore.get("access-token")?.value;
    if (!accessToken)
      return new NextResponse("Unauthorized: Token is missing or invalid.", {
        status: 401,
      });

    const isAdmin = decodeToken(accessToken);

    if (
      !isAdmin ||
      (isAdmin.email !== `${process.env.VALID_EMAIL_ADMIN}` &&
        isAdmin.email !== "cervantes.klc@gmail.com")
    )
      return new NextResponse("Unauthorized", { status: 40 });

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse("Invalid Store ID", { status: 400 });
    }

    const store = await Store.findById(id);

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    await Store.findByIdAndDelete(id);

    return new NextResponse("Store deleted successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
