import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import moment from "moment";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button as CustomButton } from "@/components/custom/button";

interface OrderSummaryItem {
  _id: string;
  product_name: string;
  product_image: string;
  quantity: string;
  price: string;
}
interface Customer {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
}

interface OrderSummaryProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  carts: OrderSummaryItem[];
  totalAmount: number;
  submitOrder?: () => void;
  isWalkin: boolean;
  submitOrderOnline?: (data: Customer) => void;
  isLoading?: boolean;
}

const CustomerDetailsSchema = z.object({
  customer_name: z.string().min(3, "Name must be at least 3 characters long"),
  customer_phone: z
    .string()
    .min(11, "Phone number must be at least 11 characters long"),
  customer_address: z
    .string()
    .min(10, "Address must be at least 10 characters long"),
});

type CustomerDetailsFormValues = z.infer<typeof CustomerDetailsSchema>;

const OrderSummary: React.FC<OrderSummaryProps> = ({
  open,
  setOpen,
  carts,
  totalAmount,
  submitOrder,
  isWalkin,
  submitOrderOnline,
  isLoading,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const dateNow = new Date();
  const form = useForm<CustomerDetailsFormValues>({
    resolver: zodResolver(CustomerDetailsSchema),
    mode: "onChange",
  });

  const handlePrint = async () => {
    if (printRef.current) {
      const canvas = await html2canvas(printRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - 20; // Adjust for margins
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      const xOffset = 10; // Margin from left
      const yOffset = 10; // Margin from top

      pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);
      pdf.save("trackernest_receipt.pdf");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent
        className={cn(
          "md:h-[80vh]",
          isWalkin ? "" : "h-[80vh] min-w-[80vw] overflow-y-auto"
        )}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitOrderOnline ?? (() => {}))}>
            <AlertDialogHeader>
              <AlertDialogTitle className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-bold">Order Summary</h1>
                  <p className="text-sm text-gray-500">
                    {moment(dateNow).format("MMMM DD, YYYY")}
                  </p>
                </div>
              </AlertDialogTitle>
              <AlertDialogDescription>
                <div
                  className={cn(
                    "",
                    isWalkin ? "" : "grid md:grid-cols-2 gap-2"
                  )}
                >
                  <div ref={printRef}>
                    <div className="p-4 bg-white h-[50vh] overflow-auto">
                      <h2 className="text-lg font-medium mb-4">
                        Order Details
                      </h2>
                      {carts.map((item: OrderSummaryItem) => (
                        <div key={item._id} className="space-y-4 p-2">
                          <div className="flex justify-between items-center">
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
                                <h3 className="text-base font-medium">
                                  {item.product_name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="text-base font-medium">
                              ₱{item.price}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <div className="text-gray-500">Subtotal</div>
                        <div className="text-base font-medium">
                          ₱{totalAmount}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-gray-500">Discount</div>
                        <div className="text-base font-medium">₱0</div>
                      </div>
                      <div className="flex justify-between items-center font-medium text-lg">
                        <div>Total</div>
                        <div>₱{totalAmount}</div>
                      </div>
                    </div>
                  </div>
                  {!isWalkin && (
                    <div>
                      <h2 className="text-lg font-medium mt-4">Customer Details</h2>
                    <div className="flex flex-col gap-4 p-2">
                      <FormField
                        name="customer_name"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="customer_name">Name</FormLabel>
                            <FormControl>
                              <Input
                                id="customer_name"
                                placeholder="Enter customer name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="customer_phone"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="customer_phone">
                              Phone
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="customer_phone"
                                placeholder="Enter customer phone"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="customer_address"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="customer_address">
                              Address
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                rows={6}
                                id="customer_address"
                                placeholder="Enter customer address"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-5">
              <AlertDialogCancel onClick={() => setOpen(false)}>
                Close
              </AlertDialogCancel>
              <AlertDialogAction onClick={handlePrint}>
                Print as PDF
              </AlertDialogAction>

              {isWalkin ? (
                <CustomButton loading={isLoading} onClick={() => submitOrder && submitOrder()}>
                  Checkout
                </CustomButton>
              ) : (
                <CustomButton
                  type="submit"
                  loading={form.formState.isSubmitting}
                >
                  Checkout
                </CustomButton>
              )}
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OrderSummary;
