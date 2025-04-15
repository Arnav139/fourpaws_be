import postgreDb from "../config/dbConfig";
import { users } from "../models/schema";
import { eq } from "drizzle-orm";

export default class UserService {

  static insertUser = async (user: any): Promise<any> => {
    try {
      console.log(user ,"userrr")
      return await postgreDb.transaction(async(tx)=>{
        const newUser:any = await tx.insert(users).values({...user}).returning();
        if(!newUser.length) throw new Error('cannot create user');
        return newUser[0];
      });
    } catch (error) {
      throw new Error(error);
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
