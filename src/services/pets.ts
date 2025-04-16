import { eq } from "drizzle-orm";
import postgreDb from "../config/dbConfig";
import { pets } from "../models/schema";

export default class petServices {
  static createNewPet = async (
    registrationNumber: string,
    governmentRegistered: string,
    name: string,
    species: string,
    breed: string,
    Image: string,
    dateOfBirth: string,
    metaData: string,
    personalityTraits: string,
    allergies: string
  ): Promise<any> => {
    try {
      const newPet = await postgreDb
        .insert(pets)
        .values({
          registrationNumber,
          governmentRegistered,
          name,
          species,
          breed,
          Image,
          dateOfBirth,
          metaData,
          personalityTraits,
          allergies,
        })
        .returning();

      return newPet[0];
    } catch (error) {
      console.error("Error creating new pet:", error);
      throw new Error("Database query failed");
    }
  };

  static getPetByRegistrationNumber = async (
    registrationNumber: string
  ): Promise<any> => {
    try {
      const pet = await postgreDb
        .select()
        .from(pets)
        .where(eq(pets.registrationNumber, registrationNumber))
        .limit(1)
        .execute();
      return pet[0];
    } catch (error) {
      console.error("Error fetching pet by registration number:", error);
      throw new Error("Database query failed");
    }
  };
}
