import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  mongoose.set("strictQuery", true);

  if(isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try{
    const conn = await mongoose.connect(process.env.MONGO_DB_URL || "", {
      dbName: "tracknest"
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isConnected = true;
  }catch(err){
    console.error("Error connecting to MongoDB", err);
  }
}