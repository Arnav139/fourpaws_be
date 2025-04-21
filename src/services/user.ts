import postgreDb from "../config/dbConfig";
import { users } from "../models/schema";
import { eq, or } from "drizzle-orm";

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

  static getUser = async (email: string,userId: string = "") => {
    const user = await postgreDb
      .select()
      .from(users)
      .where(or(eq(users.email, email) , eq(users.id, userId)))
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

  static updateUser = async (user:string ,name?: string, bio?: string, profileImageUrl?: string) => {
    try {
      const updateData: any = {
        updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;

    const updatedUser = await postgreDb
        .update(users)
        .set(updateData)
        .where(eq(users.id, user))
        .returning();

    return updatedUser[0];
    }
     catch (error : any) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");  
    }
  }
}
