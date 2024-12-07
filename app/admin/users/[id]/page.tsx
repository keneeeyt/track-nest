"use client"
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
import { ChevronLeft, LoaderIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button as CustomButton } from "@/components/custom/button";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface ErrorResponse {
  response: {
    data: string;
  };
}

const UserShema = z
  .object({
    first_name: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(55, "Last name must be at least 55 characters"),
    last_name: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(55, "Last name must be at least 55 characters"),
    role: z.enum(["admin", "owner"]),
    email: z.string().email(),
    profile_image: z.string().url().optional(),
    phone_number: z
      .string()
      .regex(/^09\d{9}$/, "Phone number must be 11 digits and start with '09'"),
    address: z
      .string()
      .max(55, "Address must be at most 55 characters")
      .nonempty("Address is required"),
  })

type UserFormValues = z.infer<typeof UserShema>;

const EditUserPage = ({ params }: { params: { id: string } }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(UserShema),
    mode: "onChange",
  });

  useEffect(()=> {
    const getUserData = async () => {
      setInitialLoading(true);
      try{
        const resp = await axios.get(`/api/users/${params.id}`);
        const data = resp.data;
        const profile = data.profile_image === "" ? [] : [data.profile_image];

        form.reset({
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
          email: data.email,
          phone_number: data.phone_number,
          address: data.address,
        })
        setImages(profile);
        
      }catch(err){
        const error = err as ErrorResponse;
        toast.error(error.response.data);
      }finally{
        setInitialLoading(false);
      }
    }
    getUserData();
  },[form, params])

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    try {
      const formData = {
        ...data,
        profile_image: images,
      };

      const resp = await axios.put(`/api/users/${params.id}`, formData);
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
          <Link href={"/admin/users"}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Update User</h1>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Please use this form to update the user account details.
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
                className="space-y-5"
              >
                <div className="md:grid md:grid-cols-2 gap-3">
                  <FormField
                    name="first_name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          First Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter First name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="last_name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Last Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter Last name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your email" />
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
                </div>
                  <FormField
                    name="address"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter your address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <div className="flex flex-col gap-3">
                  <Label>Profile Picture</Label>
                  {images.length > 0 ? (
                    <div className="flex gap-5">
                      {images.map((image, index) => (
                        <div
                          key={index}
                          className="relative w-[200px] h-[200px]"
                        >
                          <Image
                            width={200}
                            height={200}
                            src={image}
                            alt="Product_image"
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
                    Update User
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

export default EditUserPage;
