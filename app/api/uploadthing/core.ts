import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { cookies } from "next/headers";
import { decodeToken } from "@/middleware/authentication";
const f = createUploadthing();

 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  ProductUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => { //eslint-disable-line
     const cookieStore = cookies();
     const accessToken = cookieStore.get('access-token')?.value;
     if (!accessToken) throw new UploadThingError("Unauthorized");

     const user = decodeToken(accessToken);
 
      // If you throw, the user will not be able to upload
      if (!user || (user.email !== `${process.env.VALID_EMAIL_ADMIN}` && user.email !== 'cervantes.klc@gmail.com')) throw new UploadThingError("Unauthorized");
 
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
 
      console.log("file url", file.url);
 
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
    ProfileImageRoute: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => { //eslint-disable-line
      // const cookieStore = cookies();
      // const accessToken = cookieStore.get('access-token')?.value;
      // if (!accessToken) throw new UploadThingError("Unauthorized");
 
      // const user = decodeToken(accessToken);
 
      // // If you throw, the user will not be able to upload
      // if (!user || (user.email !== `${process.env.VALID_EMAIL_ADMIN}` && user.email !== 'cervantes.klc@gmail.com')) throw new UploadThingError("Unauthorized");
 
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: 123 };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
 
      console.log("file url", file.url);
 
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;