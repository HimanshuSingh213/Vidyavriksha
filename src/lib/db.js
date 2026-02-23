import mongoose from "mongoose";

if (!process.env.MongoDB_URI) {
    throw new Error("MongoDB URI env not defined.")
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MongoDB_URI, { bufferCommands: false })
            .then((mongoose) => mongoose)
    }
    
    cached.conn = await cached.promise;
    return cached.conn;

}