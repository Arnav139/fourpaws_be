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
  };
}
