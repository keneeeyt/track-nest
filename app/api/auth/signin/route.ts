import { connectDB } from "@/config/mongo-connect";
import User from "@/model/user";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/middleware/authentication";
import bcrypt from "bcryptjs";

interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body: LoginRequestBody = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Please provide email and password" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = await createToken(payload);
    
    const cookieStore = cookies();

    cookieStore.set("access-token", token, {
      secure: false,
      maxAge: 60 * 60 * 24, // 1 day
    });

    cookieStore.set("profile_image", user.profile_image, {
      secure: false,
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ message: "Login Successfully.", role: payload.role }, { status: 200 });
  } catch (err) {
    console.error("Error during login:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}