"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MenuItem from "../../_components/menu-items";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, LoaderIcon, MenuIcon } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import CartItems from "../../_components/cart-items";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import OrderSummary from "../../_components/order-summary";

interface ErrorResponse {
  response: {
    data: string;
  };
}

interface Customer {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
}

const Online = () => {
  const [products, setProducts] = useState([]);
  const [carts, setCarts] = useState<any[]>([]); //eslint-disable-line
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isWalkin = false;

  const addCart = (item: any) => { //eslint-disable-line
    const cartItem = {
      _id: item._id,
      product_quantity: item.quantity,
      product_name: item.product_name,
      price: item.price,
      product_image: item.product_image,
      quantity: 1,
    };

    const existingCartItem = carts.find((cart) => cart._id === item._id);

    if (existingCartItem) {
      if (existingCartItem.product_quantity === 1) {
        toast.error("Item already in cart with quantity 1");
        return;
      }
      const updatedCarts = carts.map((cart) =>
        cart._id === item._id ? { ...cart, quantity: cart.quantity + 1 } : cart
      );
      setCarts(updatedCarts);
    } else {
      setCarts([...carts, cartItem]);
      toast.success("Item added to cart");
    }
  };

  const removeCart = (item: string) => {
    const existingCartItem = carts.find((cart) => cart._id === item);
    if (existingCartItem) {
      if (existingCartItem.quantity === 1) {
        const updatedCarts = carts.filter((cart) => cart._id !== item);
        setCarts(updatedCarts);
        toast.success("Item removed from cart");
        return;
      }
      const updatedCarts = carts.map((cart) =>
        cart._id === item ? { ...cart, quantity: cart.quantity - 1 } : cart
      );
      setCarts(updatedCarts);
    } else {
      toast.error("Item not in cart");
    }
  };

  const addQuantity = (item: string) => {
    const existingCartItem = carts.find((cart) => cart._id === item);
    if (existingCartItem) {
      if (existingCartItem.quantity >= existingCartItem.product_quantity) {
        toast.error("Cannot add more than available quantity");
        return;
      }
      const updatedCarts = carts.map((cart) =>
        cart._id === item ? { ...cart, quantity: cart.quantity + 1 } : cart
      );
      setCarts(updatedCarts);
    } else {
      toast.error("Item not in cart");
    }
  };

  const removeQuantity = (item: string) => {
    const existingCartItem = carts.find((cart) => cart._id === item);
    if (existingCartItem) {
      if (existingCartItem.quantity === 1) {
        const updatedCarts = carts.filter((cart) => cart._id !== item);
        setCarts(updatedCarts);
        toast.success("Item removed from cart");
        return;
      }
      const updatedCarts = carts.map((cart) =>
        cart._id === item ? { ...cart, quantity: cart.quantity - 1 } : cart
      );
      setCarts(updatedCarts);
    } else {
      toast.error("Item not in cart");
    }
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await axios.get("/api/product");
        const data = response.data;
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };
    getProducts();
  }, []);

  const submitOrderOnline = async (data: Customer) => {
    setIsLoading(true);
    try {
      const formData = {
        order_type: "online",
        order_items: carts,
        order_total: totalAmount,
        order_online_details: data,
      };
      await axios.post("/api/order", formData);
      toast.success("Order created successfully");
      setCarts([]);
      setTotalAmount(0);
      console.log("Customer", data)
      router.push("/store/orders");
    } catch (err) {
      console.error("Error submitting order", err);
      const error = err as ErrorResponse;
      toast.error(error.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
       <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <Button asChild size={"icon"} variant={"outline"}>
            <Link href={"/store/orders/create"}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">
            Online Order
          </h1>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant={"outline"}
              className="shrink-0 lg:hidden"
              size={"icon"}
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={"right"}>
            <div className="h-[90vh]">
              <CartItems
                carts={carts}
                removeCart={removeCart}
                addQuantity={addQuantity}
                removeQuantity={removeQuantity}
                totalAmount={totalAmount}
                setTotalAmount={setTotalAmount}
                submitOrder={()=> setIsDialogOpen(true)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="mt-5 max-h-[80vh]">
        <CardHeader>
          <CardTitle>Menu Options</CardTitle>
          <CardDescription>
            This is the food menu. Please select your desired items from the
            options below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>
              <div className="flex items-center justify-center gap-3 mt-32 mb-32">
                <LoaderIcon className="h-5 w-5 animate-spin" />{" "}
                <span className="text-muted-foreground">Creating Order...</span>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 p-2 lg:grid-cols-4 dark:border-gray-800">
              <div className="col-span-3">
                <MenuItem products={products} addCart={addCart} />
              </div>
              <div className="hidden lg:block">
                <CartItems
                  carts={carts}
                  removeCart={removeCart}
                  addQuantity={addQuantity}
                  removeQuantity={removeQuantity}
                  totalAmount={totalAmount}
                  setTotalAmount={setTotalAmount}
                  submitOrder={()=> setIsDialogOpen(true)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <OrderSummary
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
        carts={carts}
        totalAmount={totalAmount}
        submitOrderOnline={submitOrderOnline}
        isWalkin={isWalkin}
        isLoading={isLoading}
      />
    </>
  );
};

export default Online;
