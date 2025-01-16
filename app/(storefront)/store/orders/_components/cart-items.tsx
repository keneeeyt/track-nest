import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { useEffect } from "react";

interface Cart {
  _id: string;
  product_name: string;
  price: number;
  product_image: string;
  quantity: number;
}

const CartItems = ({
  carts,
  removeCart,
  addQuantity,
  removeQuantity,
  totalAmount,
  setTotalAmount,
  submitOrder,
}: {
  carts: Cart[];
  removeCart: (id: string) => void;
  addQuantity: (id: string) => void;
  removeQuantity: (id: string) => void;
  totalAmount: number;
  setTotalAmount: (amount: number) => void;
  submitOrder: () => void;
}) => {

  useEffect(() => {
    let total = 0;
    carts.forEach((item) => {
      total += item.price * item.quantity;
    });
    setTotalAmount(total as number); //eslint-disable-line
  }, [carts, setTotalAmount]);

  return (
    <div className="flex flex-col h-full">
      {carts.length > 0 ? (
        <div className="flex-grow max-h-[55vh] overflow-y-auto">
          {carts.map((item) => (
            <div
              key={item._id}
              className="relative border-b border-gray-200 flex flex-col items-center p-2"
            >
              <h1 className="text-sm p-2">{item.product_name}</h1>

              <div
                className="absolute top-0 right-0 cursor-pointer text-red-500"
                onClick={() => removeCart(item._id)}
              >
                <XIcon className="h-5 w-5" />
              </div>
              <div className="grid grid-cols-2 items-center gap-4 mt-2">
                <div className="w-full flex flex-col items-start gap-2">
                  <label className="text-sm font-medium">Price</label>
                  <label className="text-sm font-medium">Quantity</label>
                </div>
                <div className="flex flex-col gap-3 items-end">
                  <div className="font-semibold text-sm p-2">₱{item.price}</div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => removeQuantity(item._id)}
                      variant={"outline"}
                      size={"sm"}
                    >
                      -
                    </Button>
                    {item.quantity}
                    <Button
                      onClick={() => addQuantity(item._id)}
                      variant={"outline"}
                      size={"sm"}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          No items in cart
        </div>
      )}
      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
        <div className="flex justify-between">
          <h1 className="text-sm">Total Amount</h1>
          <div className="font-semibold text-md">₱{totalAmount}</div>
        </div>
        <Button disabled={carts?.length=== 0} onClick={()=> submitOrder()} className="mt-2 w-full">Proceed to Checkout</Button>
      </div>
    </div>
  );
};

export default CartItems;