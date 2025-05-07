import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { CollectibleService } from "../services";

const mockCollectibles = [
  {
    id: "c1",
    name: "Bronze Bone",
    image:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9nJTIwdG95fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
    price: 50,
    description:
      "A rare golden bone collectible that brings good luck to your pet.",
    rarity: "rare",
    category: "Toys",
    isPurchased: false,
  },
  {
    id: "c2",
    name: "Diamond Collar",
    image:
      "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 120,
    description:
      "A luxurious diamond-studded collar for the most pampered pets.",
    rarity: "legendary",
    category: "Accessories",
    isPurchased: false,
  },
  {
    id: "c3",
    name: "Paw Print NFT",
    image:
      "https://images.unsplash.com/photo-1581888227599-779811939961?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGF3JTIwcHJpbnR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
    price: 75,
    description: "A digital collectible featuring a unique paw print design.",
    rarity: "uncommon",
    category: "Digital",
    isPurchased: false,
  },
  {
    id: "c4",
    name: "Pet Bed Deluxe",
    image:
      "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGV0JTIwYmVkfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
    price: 90,
    description: "A comfortable and stylish bed for your virtual pet.",
    rarity: "common",
    category: "Furniture",
    isPurchased: false,
  },
];

const COLLECTIBLES = [
  {
    id: 1,
    name: "Luna",
    collected: true,
    totalCount: 90,
    ownedCount: 12,
    color: "#FF6B6B",
  },
  {
    id: 2,
    name: "Max",
    collected: true,
    rarity: "Rare",
    totalCount: 50,
    ownedCount: 4,
    color: "#FFD166",
  },
  {
    id: 3,
    name: "Bella",
    collected: false,
    rarity: "Epic",
    totalCount: 25,
    ownedCount: 0,
    color: "#4ECDC4",
  },
];

const ITEMS = [
  { id: 1, name: "Dog Collar", price: 500 },
  { id: 2, name: "Chew Toy", price: 350 },
  { id: 3, name: "Dog Bed", price: 1200 },
  { id: 4, name: "Leash", price: 450 },
  { id: 5, name: "Dog Food", price: 800 },
  { id: 6, name: "Brush", price: 200 },
];

const GIFTS = [
  { id: 1, name: "Bone", price: 200, color: "#FF9A8B" },
  { id: 2, name: "Treat Box", price: 450, color: "#FFD866" },
  { id: 3, name: "Birthday Hat", price: 300, color: "#90E0EF" },
  { id: 4, name: "Ribbon", price: 150, color: "#B5EAD7" },
];

const CATEGORIES = [
  { id: 1, name: "Food", icon: "fast-food-outline" },
  { id: 2, name: "Toys", icon: "football-outline" },
  { id: 3, name: "Treats", icon: "ice-cream-outline" },
  { id: 4, name: "Grooming", icon: "cut-outline" },
  { id: 5, name: "Health", icon: "medkit-outline" },
];

export default class marketPlaceController {
  static createCollectible = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    try {
      const { name, price, description, rarity, category } = req.body;

      if (!name && !price && !description && !rarity && !category) {
        return res
          .status(400)
          .json({ success: false, message: "all fields are required" });
      }

      const collectibleImage = (req.files as any).collectibleImage[0];
      const collectibleImageDataUri = `data:${
        collectibleImage.mimetype
      };base64,${collectibleImage.buffer.toString("base64")}`;
      const collectibleImageUpload = await cloudinary.uploader.upload(
        collectibleImageDataUri,
        {
          folder: "collectibles",
        },
      );

      const payload = {
        name,
        price,
        description,
        rarity,
        category,
        image: collectibleImageUpload.secure_url,
      };
      const newCollectible =
        await CollectibleService.createCollectible(payload);
      const data = {
        ...newCollectible,
        isPurchased: false,
      };
      return res.status(200).json({
        success: true,
        message: "Collectible created successfully",
        data,
      });
    } catch (error: any) {
      console.error("Error in getCollectibles:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  static getCollectibles = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    try {
      const collectibles = await CollectibleService.getCollectibles();
      return res.status(200).json({
        success: true,
        message: "Collectibles fetched successfully",
        data: collectibles,
      });
    } catch (error: any) {
      console.error("Error in getCollectibles:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  static getMarketplaceData = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    return res.status(200).json({
      success: true,
      message: "Collectibles fetched successfully",
      data: {
        collectibles: COLLECTIBLES,
        items: ITEMS,
        gifts: GIFTS,
        categories: CATEGORIES,
      },
    });
  };
}
