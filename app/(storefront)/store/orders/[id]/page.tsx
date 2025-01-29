"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import moment from "moment";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, LoaderIcon } from "lucide-react";

interface OrderDetails {
  _id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
}

interface Customer {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
}

interface OrderData {
  order_items: OrderDetails[];
  order_total: number;
  order_date: string;
  order_online_details?: Customer[];
  order_type: string;
}

const OrderViewPage = () => {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`/api/order/${id}`);
        setOrderData(response.data);
      } catch (err) {
        console.error("Error getting order:", err);
      }
    };

    getData();
  }, [id]);

  if (!orderData) {
    return (
      <div className="flex items-center justify-center gap-3 mt-32 mb-32">
        <LoaderIcon className="h-5 w-5 animate-spin" />{" "}
        <span className="text-muted-foreground">Loading data</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <Button asChild size={"icon"} variant={"outline"}>
          <Link href={"/store/orders"}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-bold">Order Summary</h1>
          <p className="text-sm text-gray-500 mb-4">
            {moment(orderData.order_date).format("MMMM DD, YYYY")}
          </p>
        </div>
      </div>

      <div className="border p-4 rounded-md">
        <h2 className="text-lg font-medium mb-4">Order Details</h2>
        {orderData.order_items.map((item) => (
          <div
            key={item._id}
            className="flex justify-between items-center mb-4"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-md overflow-hidden">
                <Image
                  width={400}
                  height={400}
                  src={item.product_image}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-medium">{item.product_name}</h3>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>
            </div>
            <div className="text-base font-medium">₱{item.price}</div>
          </div>
        ))}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-base font-medium">
              ₱{orderData.order_total}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Discount</span>
            <span className="text-base font-medium">₱0</span>
          </div>
          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>₱{orderData.order_total}</span>
          </div>
        </div>
      </div>
      {orderData.order_type === "online" && orderData.order_online_details && (
        <div className="mt-6 border p-4 rounded-md">
          <h2 className="text-lg font-medium">Customer Details</h2>
          <div className="mt-2">
            <p>
              <strong>Name:</strong>{" "}
              {orderData.order_online_details[0].customer_name}
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              {orderData.order_online_details[0].customer_phone}
            </p>
            <p>
              <strong>Address:</strong>{" "}
              {orderData.order_online_details[0].customer_address}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderViewPage;
