import { MongoClient } from "mongodb";

if(!process.env.MongoDB_URI){
    throw new Error("Invalid/Missing env: MongoDB_URI");
}

const uri = process.env.MongoDB_URI;
let clientPromise;

if(process.env.NODE_ENV === "development"){
    // check if we already dialed DB to avoid mutiple connection req for every save
    if(!global._mongoClientPromise){
        const client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    else{
        const client = new MongoClient(uri);
        clientPromise = client.connect();
    }
}

export default clientPromise;