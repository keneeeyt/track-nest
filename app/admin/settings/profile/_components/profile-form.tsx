"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/custom/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { IconLoader } from "@tabler/icons-react";
import axios from "axios";
import Cookies from "js-cookie";
import { decodeToken } from "@/middleware/authentication";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { XIcon } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";

interface ErrorResponse {
  response: {
    data: string;
  };
}

const profileFormSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(55, "Last name must be at least 55 characters"),
  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(55, "Last name must be at least 55 characters"),
  profile_image: z.string().url().optional(),
  phone_number: z
    .string()
    .regex(/^09\d{9}$/, "Phone number must be 11 digits and start with '09'"),
  address: z
    .string()
    .max(55, "Address must be at most 55 characters")
    .nonempty("Address is required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm() {
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
  });

  const getDetails = useCallback(async () => {
    setLoading(true);
    try {
      const user_id = Cookies.get("access-token") || "";
      if (user_id) {
        const decodedId = decodeToken(user_id);
        const id = String(decodedId.id);
        const resp = await axios.get(`/api/users/${id}`);
        const data = resp.data;
        const profile = data.profile_image === "" ? [] : [data.profile_image];

        setId(id);
        form.reset({
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          address: data.address,
        });
        setImages(profile);
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  },[form]);

  useEffect(() => {
    getDetails();
  }, [getDetails]);

  async function onSubmit(data: ProfileFormValues) {
    setLoading(true);
    const formData = {
      ...data,
      profile_image: images,
    };
    try {
      await axios.put(`/api/users/${id}`, formData);
      toast.success("Profile updated successfully");
      getDetails();
      Cookies.set("profile_image", images[0], {expires: 1});
      setTimeout(()=> {
        window.location.reload();
      },2000)
    } catch (err) {
      setLoading(false);
      const error = err as ErrorResponse;
      toast.error(error.response.data);
    } finally {
      setLoading(false);
    }
  }

  return loading ? (
    <div className="p-10 flex items-center justify-center text-gray-400 animate-pulse">
      <IconLoader className="animate-spin" size={32} />
    </div>
  ) : (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Firstname</FormLabel>
              <FormControl>
                <Input placeholder="Enter Firstname" {...field} />
              </FormControl>
              <FormDescription>
                This is your first name as displayed on your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lastname</FormLabel>
              <FormControl>
                <Input placeholder="Enter Lastname" {...field} />
              </FormControl>
              <FormDescription>
                This is your last name as displayed on your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile number</FormLabel>
              <FormControl>
                <Input placeholder="Enter mobile number" {...field} />
              </FormControl>
              <FormDescription>
                This is your mobile number for contact purposes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter your address" {...field} />
              </FormControl>
              <FormDescription>
                This is your address for correspondence.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-3">
          <Label>Profile Picture</Label>
          {images.length > 0 ? (
            <div className="flex gap-5">
              {images.map((image, index) => (
                <div key={index} className="relative w-[200px] h-[200px]">
                  <Image
                    width={200}
                    height={200}
                    src={image}
                    alt="Profile_image"
                    className="w-[200px] h-[200px] object-cover rounded-lg border"
                  />
                  <button
                    onClick={() =>
                      setImages((prev) => prev.filter((_, i) => i !== index))
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
        <Button type="submit" loading={loading}>
          Update profile
        </Button>
      </form>
    </Form>
  );
}
