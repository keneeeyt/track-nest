"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button as CustomButton } from "@/components/custom/button";
import { DateTimePicker } from "@/components/custom/date-picker";

interface ErrorResponse {
  response: {
    data: string;
  };
}

const ExpenseSchema = z.object({
  expenses_title: z
    .string()
    .min(3, "Expense title must be at least 3 characters long")
    .max(100, "Expense title must be at most 100 characters long"),
  expenses_description: z
    .string()
    .min(20, "Expense description must be at least 55 characters long")
    .max(150, "Expense description must be at most 150 characters long"),
  expenses_price: z.number().int().positive("Price must be a positive number"),
  expenses_date: z.date(),
});

type ExpenseFormValues = z.infer<typeof ExpenseSchema>;

const ExpenseCreatePage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(ExpenseSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ExpenseFormValues) => {
    setIsLoading(true);
    try {
      const resp = await axios.post("/api/expense", data);
      toast.success(resp.data);
      form.reset();
      router.push("/store/expenses");
    } catch (err) {
      const error = err as ErrorResponse;
      toast.error(error.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Button asChild size={"icon"} variant={"outline"}>
          <Link href={"/store/expenses"}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">New Expense</h1>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>
            Use this form to create a new expense.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col space-y-4">
                <FormField
                  name="expenses_title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Expense Title <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter expense title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="expenses_description"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Expense Description{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter your expense description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="expenses_price"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Expense Price <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter your expense price"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="expenses_date"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel>
                        Expense Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                      <DateTimePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <CardFooter>
                <CustomButton
                  type="submit"
                  loading={isLoading}
                  className="mt-4"
                >
                  Create Expense
                </CustomButton>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default ExpenseCreatePage;
