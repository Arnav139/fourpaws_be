import postgreDb from "../config/dbConfig";
import { collectibles } from "../models/schema";

interface Collectible {
  name: string;
  description: string;
  image: string;
  price: number;
  rarity: string;
  category: string;
}

export default class CollectibleService {
  static createCollectible = async (payload: Collectible) => {
    try {
      const collectible = (await postgreDb
        .insert(collectibles)
        .values(payload)
        .returning({
          id: collectibles.id,
          name: collectibles.name,
          description: collectibles.description,
          image: collectibles.image,
          price: collectibles.price,
          rarity: collectibles.rarity,
          category: collectibles.category,
        })) as unknown as typeof collectibles.$inferInsert;
      return collectible[0];
    } catch (error) {
      console.error("Error creating collectible:", error);
      throw new Error("Failed to create collectible");
    }
  };

  static getCollectibles = async () => {
    try {
      const collectiblesList = (await postgreDb
        .select()
        .from(collectibles)) as unknown as typeof collectibles.$inferSelect;
      return collectiblesList;
    } catch (error) {
      console.error("Error fetching collectibles:", error);
      throw new Error("Failed to fetch collectibles");
    }
  }

}
