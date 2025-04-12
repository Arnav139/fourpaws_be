import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../models/schema";
import dotenv from "dotenv";
dotenv.config();


export const client = new Client(process.env.DB_URL as string);

client
.connect()
.then(() => {
    console.log("Connected to PostgreSQL database successfully!");
})
.catch((err) => {
    console.error(`Error connecting to database: ${err}`);
})

const postgreDb = drizzle(client,{ schema: { ...schema } });

export default postgreDb;