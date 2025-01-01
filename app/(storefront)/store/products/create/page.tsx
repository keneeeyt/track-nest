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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzone } from "@/lib/uploadthing";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ChevronLeft, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button as CustomButton } from "@/components/custom/button";

interface ErrorResponse {
  response: {
    data: string;
  };
}

const ProductSchema = z.object({
  product_name: z
    .string()
    .min(3, "Store name must be at least 3 characters long")
    .max(100, "Store name must be at most 100 characters long"),
  product_description: z.string()
  .min(55, "Store description must be at least 55 characters long")
  .max(150, "Store description must be at most 150 characters long"),
  price: z.number().int().positive("Price must be a positive number"),
  quantity: z.number().int().positive("Quantity must be a positive number"),
  product_image: z.string().optional(),
});

type ProductFormValues = z.infer<typeof ProductSchema>;

const ProductCreatePage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const router = useRouter();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    mode: "onChange",
  });


  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    try {
      const formData = {
        ...data,
        product_image: images,
      };

      const resp = await axios.post("/api/product", formData);
      toast.success(resp.data);
      form.reset();
      router.push("/store/products");
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
          <Link href={"/store/products"}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">New Product</h1>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Use this form to create a new product.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="md:grid md:grid-cols-2 gap-3">
                <FormField
                  name="product_name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Product Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter Product name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="price"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Product Price <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter your price"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="quantity"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Product Quantity <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter your quantity"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="product_description"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Product Description <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter your description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label>Product Image</Label>
                {images.length > 0 ? (
                  <div className="flex gap-5">
                    {images.map((image, index) => (
                      <div key={index} className="relative w-[200px] h-[200px]">
                        <Image
                          width={200}
                          height={200}
                          src={image}
                          alt="product_image"
                          className="w-[200px] h-[200px] object-cover rounded-lg border"
                        />
                        <button
                          onClick={() =>
                            setImages((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          type="button"
                          className="absolute -top-3 -right-3 bg-red-500 p-2 rounded-lg text-white"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <UploadDropzone
                    endpoint="ProfileImageRoute"
                    onClientUploadComplete={(res) => {
                      setImages(res.map((r) => r.url));
                      // toast.success("Image uploaded successfully");
                    }}
                    onUploadError={(err) => {
                      console.log(err);
                      toast.error("Image upload failed");
                    }}
                    className="w-full h-55"
                  />
                )}
              </div>
              <CardFooter>
                <CustomButton
                  type="submit"
                  loading={isLoading}
                  className="mt-4"
                >
                  Create Product
                </CustomButton>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default ProductCreatePage;
