import { eq } from "drizzle-orm";
import postgreDb from "../config/dbConfig";
import { pets } from "../models/schema";
 

export interface petDocuments{
  veterinaryHealthCard: string;
  vaccinationCard: string;
  passport: string;
  imageWithOwner: string;
  veterinaryHealthCertificate: string;
  sterilizationCard: string;
} 

export default class petServices {
  static createNewPet = async (
    ownerId : string,
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
    medications: string[],
    documents: petDocuments
  ): Promise<any> => {
    try {
      const newPet = await postgreDb
        .insert(pets)
        .values({
          ownerId ,
          ...(registrationNumber ? { registrationNumber } : {}),
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
          documents
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

  static getAllPets = async (userId: number): Promise<any> => {
    try {
      const petsList = await postgreDb
        .select()
        .from(pets)
        .where(eq(pets.ownerId, userId))
        .execute();
      return petsList;
    } catch (error) {
      console.error("Error fetching all pets:", error);
      throw new Error("Database query failed");
    }
  };
}
