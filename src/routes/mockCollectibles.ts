import express from 'express';

const router = express.Router();

router.get('/mockCollectibles', (req, res) => {
    const mockCollectibles = [
        {
          id: 'c1',
          name: 'Bornze Bone',
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
          image: 'https://images.unsplash.com/photo-1576466833668-41d6d75bde33?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZG9nJTIwY29sbGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
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
    res.json(mockCollectibles);
});

export default router;