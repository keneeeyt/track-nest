import { connectDB } from "@/config/mongo-connect";
import User from "@/model/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { decodeToken } from "@/middleware/authentication";

export const POST = async (req: Request) => {
  try {
    await connectDB();

    const cookieStore = cookies();
    const accessToken = cookieStore.get("access-token")?.value;
    if (!accessToken) return new NextResponse("Unauthorized: Token is missing or invalid.", { status: 401 });

    const isAdmin = decodeToken(accessToken);

    if (
      !isAdmin ||
      (isAdmin.email !== `${process.env.VALID_EMAIL_ADMIN}` &&
        isAdmin.email !== "cervantes.klc@gmail.com")
    )
      return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();

    const isEmailExist = await User.findOne({ email: body.email });

    if (isEmailExist) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = new User({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      role: body.role,
      password: hashedPassword,
      phone_number: body.phone_number,
      address: body.address,
      profile_image: body.profile_image,
    });

    await user.save();

    return new NextResponse("User created successfully", { status: 201 });
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const GET = async () => {
  try {
    await connectDB();

    const users = await User.find({ isDelete: false });
    return new NextResponse(JSON.stringify(users), { status: 200 });
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
