import { MongoClient } from "mongodb";
import dns from "dns";

try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    if (dns.promises && typeof dns.promises.setServers === "function") {
        dns.promises.setServers(["8.8.8.8", "8.8.4.4"]);
    }
} catch (e) {
    // Ignore if environment restricts setting custom DNS servers
}

if (!process.env.MongoDB_URI) {
    throw new Error("Invalid/Missing env: MongoDB_URI");
}

const uri = process.env.MongoDB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }

    clientPromise = global._mongoClientPromise;
}
else {

    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;