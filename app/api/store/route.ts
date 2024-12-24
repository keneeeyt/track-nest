import { connectDB } from "@/config/mongo-connect";
import { decodeToken } from "@/middleware/authentication";
import Store from "@/model/store";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import User from "@/model/user";

export const POST = async (req: NextRequest) => {
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
      return new NextResponse("Unauthorized", { status: 401 });

      const body = await req.json();

      const isStoreExists = await Store.findOne({ store_name: body.store_name });

      if (isStoreExists) {
        return new NextResponse("Store already exists", { status: 400 });
      }

      const store = new Store({
        owner_id: new ObjectId(body.owner_id),
        store_name: body.store_name,
        address: body.address,
        phone_number: body.phone_number,
        store_logo: body.store_logo.length === 0? "" : body.store_logo[0],
      });

      await store.save();

      return new NextResponse("Store created successfully", { status: 201 });

  } catch (err) {
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const GET = async () => {
  try{  

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
      return new NextResponse("Unauthorized", { status: 401 });

    const stores = await Store.find({ isDelete: false });

     // Fetch owner details and add owner_name to each store
     const storesWithOwnerName = await Promise.all(
      stores.map(async (store) => {
        const owner = await User.findById(store.owner_id);
        return {
          ...store.toObject(),
          owner_name: owner ? owner.first_name + " " + owner.last_name : "Unknown",
        };
      })
    );
    
    return new NextResponse(JSON.stringify(storesWithOwnerName), { status: 200 });

  }catch(err){
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
