import { connectDB } from "@/config/mongo-connect";
import { decodeToken } from "@/middleware/authentication";
import Product from "@/model/product";
import Store from "@/model/store";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

interface ProductRequestBody {
  price: number;
  quantity: number;
  product_name: string;
  product_description: string;
  product_image: string;
}

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

    const product = await Product.findById(params.id);

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    return new NextResponse(JSON.stringify(product), { status: 200 });
  } catch (err) {
    console.error("Error getting product:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

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

    const body: ProductRequestBody = await req.json();

    const product = await Product.findById(params.id);

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    if (product.store_id.toString() !== store._id.toString()) {
      return new NextResponse(
        "Unauthorized: You are not the owner of this product",
        { status: 401 }
      );
    }

    if (body.product_image.length > 0) {
      body.product_image = body.product_image[0];
    }

    await Product.findByIdAndUpdate(
      params.id,
      { store_id: store._id, ...body },
      { new: true }
    );

    return new NextResponse("Product updated successfuly", { status: 200 });
  } catch (err) {
    console.error("Error updating product:", err);
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

    const product = await Product.findById(params.id);

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    await Product.findByIdAndDelete(params.id);

    return new NextResponse("Product deleted successfuly", { status: 200 });
  } catch (err) {
    console.error("Error deleting product:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
