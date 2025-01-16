import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const OrderCreatePage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Order Type</CardTitle>
        <CardDescription>
          Please select the type of order you would like to create. You can choose between a walk-in order or an online order.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center gap-4 m-10">
        <Link href="/store/orders/create/walk-in">
          <Button variant={"outline"} className="p-10">
            Walk-in Order
          </Button>
        </Link>
        <Link href="/store/orders/create/online">
          <Button variant={"outline"} className="p-10">
            Online Order
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default OrderCreatePage;