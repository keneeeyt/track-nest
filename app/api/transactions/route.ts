import { connectDB } from "@/config/mongo-connect";
import { decodeToken } from "@/middleware/authentication";
import Store from "@/model/store";
import Transaction from "@/model/transaction";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
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
    const { role, id } = user;

    if (role !== "owner") {
      return NextResponse.json(
        {
          error:
            "Forbidden: You do not have permission to perform this action.",
        },
        { status: 403 }
      );
    }

    const store = await Store.findOne({ owner_id: id });
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const transactions = await Transaction.find({
      store_id: store._id,
      ...dateFilter,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return new NextResponse("Something went wrong. Please try again later.", {
      status: 500,
    });
  }
};
