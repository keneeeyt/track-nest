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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzone } from "@/lib/uploadthing";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ChevronLeft, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button as CustomButton } from "@/components/custom/button";

interface ErrorResponse {
  response: {
    data: string;
  };
}

interface Owners {
  _id: string;
  first_name: string;
  last_name: string;
}

const StoreSchema = z.object({
  store_name: z
    .string()
    .min(3, "Store name must be at least 3 characters long")
    .max(100, "Store name must be at most 100 characters long"),
  owner_id: z.string(),
  address: z.string().nonempty("Address is required"),
  store_logo: z.string().optional(),
  phone_number: z
    .string()
    .regex(/^09\d{9}$/, "Phone number must be 11 digits and start with '09'"),
});

type StoreFormValues = z.infer<typeof StoreSchema>;

const StoreCreatePage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [owners, setOwners] = useState<Owners[]>([]);
  const router = useRouter();

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(StoreSchema),
    mode: "onChange",
  });

  useEffect(() => {
    const getOwners = async () => {
      try {
        const owners = await axios.get("/api/users");
        setOwners(owners.data);
      } catch (err) {
        console.error("Error fetching owners:", err);
        toast.error("Something went wrong. Please try again later.");
      }
    };
    getOwners();
  }, []);

  const onSubmit = async (data: StoreFormValues) => {
    setIsLoading(true);
    try {
      const formData = {
        ...data,
        store_logo: images,
      };

      const resp = await axios.post("/api/store", formData);
      toast.success(resp.data);
      form.reset();
      router.push("/admin/stores");
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
          <Link href={"/admin/stores"}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">New Store</h1>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
          <CardDescription>
            Use this form to create a new store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="md:grid md:grid-cols-2 gap-3">
                <FormField
                  name="store_name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Store Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter First name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="phone_number"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your phone number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="owner_id"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Select Owner <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            {owners.length > 0 &&
                              owners.map((owner) => (
                                <SelectItem key={owner._id} value={owner._id}>
                                  {owner.first_name} {owner.last_name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="address"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter your address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label>Store Logo / Store Image</Label>
                {images.length > 0 ? (
                  <div className="flex gap-5">
                    {images.map((image, index) => (
                      <div key={index} className="relative w-[200px] h-[200px]">
                        <Image
                          width={200}
                          height={200}
                          src={image}
                          alt="store_image"
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
                  Create Store
                </CustomButton>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default StoreCreatePage;
