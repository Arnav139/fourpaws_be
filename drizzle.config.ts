import dotenv from "dotenv";
dotenv.config();


export default ({
  dialect: "postgresql", 
  schema: "./src/models/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // host: envConfigs.db.host,
    // user: envConfigs.db.user,
    // password: envConfigs.db.password,
    // database: envConfigs.db.database,
    // port: envConfigs.db.port,
    // ssl: envConfigs.db.ssl ,
    url:process.env.DB_URL
  }
});