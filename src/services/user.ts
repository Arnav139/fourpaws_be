import postgreDb from "../config/dbConfig";
import { users } from "../models/schema";
import { eq } from "drizzle-orm";

export default class UserService {

  static insertUser = async (email: string): Promise<any> => {
     try {
      const newUser = await postgreDb.insert(users).values({ email }).returning();
      return newUser[0];
     } catch (error) {
      console.error("Error inserting user:", error);
      throw new Error("Failed to insert user");
     }
  };

  static getUser = async (email: string) => {
    const user = await postgreDb
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .execute();

    return user.length > 0 ? user[0] : null;
  };

 


  static getWalletAddressByEmail = async (email: string) => {
    const result = await postgreDb
      .select({ walletAddress: users.walletAddress })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .execute();

    return result.length > 0 ? result[0].walletAddress : null;
  };

  static updateWalletAddress = async (email: string, walletAddress: string) => {
    const [updatedUser] = await postgreDb
      .update(users)
      .set({ walletAddress, updatedAt: new Date() })
      .where(eq(users.email, email))
      .returning();
    return updatedUser;
  };
}
