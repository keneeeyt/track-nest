import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "lucide-react";

interface Product {
  _id: string;
  product_name: string;
  price: number;
  product_image: string;
  quantity: number;
}

const MenuItems = ({
  products,
  addCart,
}: {
  products: Product[];
  addCart: (product: Product) => void;
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(products.length === 0);
  }, [products]);

  let content;

  if (isLoading) {
    content = (
      <div className="flex items-center justify-center gap-3 mt-32 mb-32">
        <LoaderIcon className="h-5 w-5 animate-spin" />{" "}
        <span className="text-muted-foreground">Loading data</span>
      </div>
    );
  } else if (products.length > 0) {
    content = (
      <div className="grid gap-4 p-2 md:grid-cols-2 xl:grid-cols-3 dark:border-gray-800 max-h-[60vh] overflow-y-auto">
        {products.map((item) => (
          <div
            key={item._id}
            className="border rounded-lg flex flex-col items-center p-2"
          >
            <Image
              src={item.product_image}
              width="200"
              height="150"
              alt={item.product_name}
              className="w-[200px] h-[200px] rounded-lg object-cover object-top"
            />

            <div className="flex items-center justify-between gap-4 mt-4">
              <h1 className="text-xs">{item.product_name}</h1>
              <div className="font-semibold text-md">₱{item.price}</div>
            </div>
            {item.quantity === 0 ? (
              <Button className="mt-2 w-full" variant={"destructive"} disabled>
                SOLD OUT
              </Button>
            ) : (
              <Button className="mt-2 w-full" onClick={() => addCart(item)}>
                Add to Cart
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  } else {
    content = (
      <div className="flex justify-center items-center h-96">
        No products found
      </div>
    );
  }

  return <>{content}</>;
};

export default MenuItems;
