import { eq } from "drizzle-orm";
import postgreDb from "../config/dbConfig";
import { pets } from "../models/schema";

export default class petServices {
  static createNewPet = async (
    registrationNumber: string,
    governmentRegistered: boolean,
    name: string,
    species: string,
    breed: string,
    gender: string,
    sterilized: boolean,
    bio: string | null,
    image: string,
    additionalImages: string[],
    dateOfBirth: string,
    metaData: object,
    personalityTraits: string[],
    allergies: string[],
    medications: string[]
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
          gender,
          sterilized,
          bio,
          image,
          additionalImages,
          dateOfBirth,
          metaData,
          personalityTraits,
          allergies,
          medications,
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
