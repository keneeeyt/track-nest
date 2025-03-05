import { connectDB } from "@/config/mongo-connect";
import { decodeToken } from "@/middleware/authentication";
import Store from "@/model/store";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Product from "@/model/product";
import Order from "@/model/order";

export const GET = async () => { 
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

    const products = await Product.find({ store_id: store._id });
    const orders = await Order.find({ store_id: store._id, isDelete: false }); // Exclude deleted orders

    const inventories = products.map((product) => {
      // Filter orders that contain the current product
      const productOrders = orders.filter((order) =>
        order.order_items.some((item: any) => item._id.equals(product._id)) //eslint-disable-line
      );

      // Calculate total quantity sold for the product
      const quantity_sold = productOrders.reduce((total, order) => {
        const item = order.order_items.find((item: any) => // eslint-disable-line
          item._id.equals(product._id)
        );
        return total + (item ? item.quantity : 0);
      }, 0);

      // Calculate quantity on hand
      const available_stock = product.quantity;
      const quantity_onhand = available_stock + quantity_sold;

      // Calculate inventory value and sales value
      const inventory_value = quantity_onhand * product.price;
      const sales_value = quantity_sold * product.price;

      // Determine product status
      let status;
      if (available_stock === 0) {
        status = "Out of Stock";
      } else if (available_stock < 10) {
        status = "Low Stock";
      } else {
        status = "In Stock";
      }

      return {
        product: product.product_name, // Use product_name from your Product model
        price: product.price,
        quantity_onhand,
        quantity_sold,
        inventory_value,
        sales_value,
        available_stock,
        status,
      };
    });

    return NextResponse.json(inventories);

  } catch (err) {
    console.error("Error fetching inventories:", err);
    return new NextResponse("Something went wrong. Please try again later.", {
      status: 500,
    });
  }
};