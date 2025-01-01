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
import { ChevronLeft, LoaderIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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

const ExpenseEditPage = ({ params }: { params: { id: string } }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(ExpenseSchema),
    mode: "onChange",
  });

  const getData = useCallback(async () => {
    setInitialLoading(true);
    try {
      const resp = await axios.get(`/api/expense/${params.id}`);
      const data = resp.data;
      form.reset({
        expenses_title: data.expenses_title,
        expenses_description: data.expenses_description,
        expenses_price: data.expenses_price,
        expenses_date: new Date(data.expenses_date)
      });
    } catch (err) {
      console.error("Error fetching expense:", err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setInitialLoading(false);
    }
  }, [params.id, form]);

  useEffect(() => {
    getData();
  }, [getData]);

  const onSubmit = async (data: ExpenseFormValues) => {
    setIsLoading(true);
    try {
      const resp = await axios.put(`/api/expense/${params.id}`, data);
      toast.success(resp.data);
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
        <h1 className="text-xl font-semibold tracking-tight">Update Expense</h1>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>
            Use this form to update expense details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initialLoading ? (
            <div className="flex items-center justify-center gap-3 mt-32 mb-32">
              <LoaderIcon className="h-5 w-5 animate-spin" />{" "}
              <span className="text-muted-foreground">Loading data</span>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                          <DateTimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
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
                    Update Expense
                  </CustomButton>
                </CardFooter>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ExpenseEditPage;
