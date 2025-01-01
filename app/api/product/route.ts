import { connectDB } from "@/config/mongo-connect";
import { decodeToken } from "@/middleware/authentication";
import Product from "@/model/product";
import Store from "@/model/store";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface ProductRequestBody {
  price: number;
  quantity: number;
  product_name: string;
  product_description: string;
  product_image: string;
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

    const body: ProductRequestBody = await req.json();

    const isProductExists = await Product.findOne({
      product_name: body.product_name,
    });

    if (isProductExists) {
      return new NextResponse("Product already exists", { status: 400 });
    }

    const product = new Product({
      store_id: store._id,
      price: body.price,
      quantity: body.quantity,
      product_name: body.product_name,
      product_description: body.product_description,
      product_image:
        body.product_image.length > 0
          ? body.product_image[0]
          : "https://res.cloudinary.com/de6w2afj5/image/upload/v1735005475/11749787_bouvxl.png",
    });

    await product.save();

    return new NextResponse("Product created", { status: 201 });
  } catch (err) {
    console.error("Error creating product:", err);
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

    const products = await Product.find({ isDelete: false, store_id: store._id });

    return new NextResponse(JSON.stringify(products), { status: 200 });
  } catch (err) {
    console.error("Error fetching products:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
