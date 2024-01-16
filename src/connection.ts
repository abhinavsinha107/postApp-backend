import mongoose from "mongoose";

export async function connectToDatabase(databaseUrl: string) {
    try {
        await mongoose.connect(databaseUrl);
        console.log("Connected to MongoDB database");
    } catch(err) {
        console.log("Error connecting to MongoDB database", err);
    }
}