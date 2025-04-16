import { Request, Response } from "express";

const mockCollectibles = [
    {
      id: 'c1',
      name: 'Bronze Bone',
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9nJTIwdG95fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      price: 50,
      description: 'A rare golden bone collectible that brings good luck to your pet.',
      rarity: 'rare',
      category: 'Toys',
      isPurchased: false
    },
    {
      id: 'c2',
      name: 'Diamond Collar',
      image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      price: 120,
      description: 'A luxurious diamond-studded collar for the most pampered pets.',
      rarity: 'legendary',
      category: 'Accessories',
      isPurchased: false
    },
    {
      id: 'c3',
      name: 'Paw Print NFT',
      image: 'https://images.unsplash.com/photo-1581888227599-779811939961?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGF3JTIwcHJpbnR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
      price: 75,
      description: 'A digital collectible featuring a unique paw print design.',
      rarity: 'uncommon',
      category: 'Digital',
      isPurchased: false
    },
    {
      id: 'c4',
      name: 'Pet Bed Deluxe',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGV0JTIwYmVkfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      price: 90,
      description: 'A comfortable and stylish bed for your virtual pet.',
      rarity: 'common',
      category: 'Furniture',
      isPurchased: false
    }
];

export default class marketPlaceController{

  static getCollectibles =async (req: Request, res: Response) => {
     res.json(mockCollectibles);
  };
}



