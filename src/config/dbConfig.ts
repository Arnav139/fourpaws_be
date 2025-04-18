import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../models/schema";
import { envConfigs } from "./envconfig";



export const client = new Client(envConfigs.db_url)

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