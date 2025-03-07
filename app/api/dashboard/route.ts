import { connectDB } from "@/config/mongo-connect";
import { decodeToken } from "@/middleware/authentication";
import Store from "@/model/store";
import Order from "@/model/order";
import Expense from "@/model/expenses";
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
        { error: "Forbidden: You do not have permission to perform this action." },
        { status: 403 }
      );
    }

    const store = await Store.findOne({ owner_id: id });
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const timeframe = url.searchParams.get("timeframe") || "this month"; // Default to this month

    // Define date range based on timeframe
    let startDate = new Date(); // eslint-disable-line
    let endDate = new Date(); // eslint-disable-line

    if (timeframe === "today") {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeframe === "this week") {
      // Set start date to the previous Monday
      startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
      startDate.setHours(0, 0, 0, 0);
      // Set end date to the upcoming Sunday
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeframe === "this month") {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeframe === "this year") {
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setFullYear(startDate.getFullYear() + 1);
      endDate.setMonth(0, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    // Fetch data in parallel using Promise.all
    const [totalIncomeResult, totalExpensesResult, orders] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            store_id: store._id,
            order_date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: "$order_total" },
          },
        },
      ]),
      Expense.aggregate([
        {
          $match: {
            store_id: store._id,
            createdAt: { $gte: startDate, $lte: endDate },
            isDelete: false,
          },
        },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: "$expenses_price" },
          },
        },
      ]),
      Order.find({
        store_id: store._id,
        order_date: { $gte: startDate, $lte: endDate },
      }).lean(),
    ]);

    const totalIncome = totalIncomeResult.length > 0 ? totalIncomeResult[0].totalIncome : 0;
    const totalExpenses = totalExpensesResult.length > 0 ? totalExpensesResult[0].totalExpenses : 0;
    const totalBalance = totalIncome - totalExpenses;

    // Top 5 Best Sellers
    const productSales: Record<string, { name: string; image: string; totalSold: number; totalAmount: number }> = {};

    orders.forEach((order) => {
      order.order_items.forEach((item : any) => { // eslint-disable-line 
        if (!productSales[item._id]) {
          productSales[item._id] = {
            name: item.product_name,
            image: item.product_image,
            totalSold: 0,
            totalAmount: 0,
          };
        }
        productSales[item._id].totalSold += item.quantity;
        productSales[item._id].totalAmount += item.quantity * item.price;
      });
    });

    const sortedProductSales = Object.values(productSales).sort((a, b) => b.totalAmount - a.totalAmount);

    const topBestSeller = sortedProductSales.slice(0, 5);

    // Generate chart data
    let chartData: { name: string; total: number }[] = [];

    if (timeframe === "today") {
      const fourHourlySales: Record<string, number> = {};
      const intervals = ["0:00-4:00", "4:00-8:00", "8:00-12:00", "12:00-16:00", "16:00-20:00", "20:00-24:00"];
    
      // Initialize four-hourly sales
      intervals.forEach(interval => {
        fourHourlySales[interval] = 0;
      });
    
      orders.forEach((order) => {
        const hour = new Date(order.order_date).getHours();
        let interval = "";
    
        if (hour < 4) interval = "0:00-4:00";
        else if (hour < 8) interval = "4:00-8:00";
        else if (hour < 12) interval = "8:00-12:00";
        else if (hour < 16) interval = "12:00-16:00";
        else if (hour < 20) interval = "16:00-20:00";
        else interval = "20:00-24:00";
    
        fourHourlySales[interval] += order.order_total;
      });
    
      chartData = Object.keys(fourHourlySales).map((interval) => ({
        name: interval,
        total: fourHourlySales[interval],
      }));
    } else if (timeframe === "this week") {
      const dailySales: Record<string, number> = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
        Sunday: 0,
      };

      orders.forEach((order) => {
        const day = new Date(order.order_date).toLocaleString("en-US", { weekday: "long" });
        dailySales[day] += order.order_total;
      });

      chartData = Object.keys(dailySales).map((day) => ({
        name: day,
        total: dailySales[day],
      }));
    } else if (timeframe === "this month") {
      const weeklySales: Record<number, number> = {};
      const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    
      // Initialize weekly sales
      for (let i = 1; i <= Math.ceil(daysInMonth / 7); i++) {
        weeklySales[i] = 0;
      }
    
      orders.forEach((order) => {
        const date = new Date(order.order_date);
        const week = Math.ceil(date.getDate() / 7);
        weeklySales[week] += order.order_total;
      });
    
      chartData = Object.keys(weeklySales).map((week) => ({
        name: `Week ${week}`,
        total: weeklySales[parseInt(week)],
      }));
    } else if (timeframe === "this year") {
      const monthlySales: Record<string, number> = {
        Jan: 0,
        Feb: 0,
        Mar: 0,
        Apr: 0,
        May: 0,
        Jun: 0,
        Jul: 0,
        Aug: 0,
        Sep: 0,
        Oct: 0,
        Nov: 0,
        Dec: 0,
      };

      orders.forEach((order) => {
        const month = new Date(order.order_date).toLocaleString("en-US", { month: "short" });
        monthlySales[month] += order.order_total;
      });

      chartData = Object.keys(monthlySales).map((month) => ({
        name: month,
        total: monthlySales[month],
      }));
    }

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      totalBalance,
      chartData,
      topBestSeller,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: (err as Error).message },
      { status: 500 }
    );
  }
};