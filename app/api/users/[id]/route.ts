import { connectDB } from "@/config/mongo-connect";
import { decodeToken } from "@/middleware/authentication";
import User from "@/model/user";
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

    const isAuthorize = decodeToken(accessToken);

    if(isAuthorize.role !== "admin" && isAuthorize.role !== "owner") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse("Invalid User ID", { status: 400 });
    }

    const user = await User.findById(id);

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return new NextResponse(JSON.stringify(user), { status: 200 });
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

    const isAuthorize = decodeToken(accessToken);

    if(isAuthorize.role !== "admin" && isAuthorize.role !== "owner") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse("Invalid User ID", { status: 400 });
    }

    const user = await User.findById(id);

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const body = await req.json();

    if(body.profile_image.length > 0) {
      body.profile_image = body.profile_image[0];
    } else {
      body.profile_image = "";
    }

    await User.findByIdAndUpdate(id, body);

    return new NextResponse("User updated successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};



export const DELETE = async (req: NextRequest, {params}: {params: {id: string}}) => { //eslint-disable-line
  try{

    await connectDB();

    const cookieStore = cookies();
    const accessToken = cookieStore.get("access-token")?.value;
    if (!accessToken)
      return new NextResponse("Unauthorized: Token is missing or invalid.", {
        status: 401,
      });

    const isAuthorize = decodeToken(accessToken);

    if(isAuthorize.role !== "admin" && isAuthorize.role !== "owner") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse("Invalid User ID", { status: 400 });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) return new NextResponse("User not found", {status: 404});

    return new NextResponse("User deleted successfully", {status: 200});

  }catch(err){
    console.error(err);
    return new NextResponse("Internal Server Error", {status: 500});
  }
}