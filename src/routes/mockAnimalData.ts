import express from "express";

const router = express.Router();

router.get("/mockAnimalData", (req, res) => {
  const animalData = [
    {
      dog_images: [
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb",
        "https://images.unsplash.com/photo-1517849845537-4d257902454a",
        "https://images.unsplash.com/photo-1583511655826-05700d52f4d9",
        "https://images.unsplash.com/photo-1558788353-f76d92427f16",
        "https://images.unsplash.com/photo-1561037404-61cd46aa615b",
      ],
    },
    {
      CAT_IMAGES: [
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
        "https://images.unsplash.com/photo-1573865526739-10659fec78a5",
        "https://images.unsplash.com/photo-1495360010541-f48722b34f7d",
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
        "https://images.unsplash.com/photo-1574158622682-e40e69881006",
        "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec",
      ],
    },
    {
      BIRD_IMAGES: [
        "https://images.unsplash.com/photo-1444464666168-49d633b86797",
        "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f",
        "https://images.unsplash.com/photo-1552728089-57bdde30beb3",
        "https://images.unsplash.com/photo-1544923408-75c5cef46f14",
        "https://images.unsplash.com/photo-1562090175-14e30223a7c5",
        "https://images.unsplash.com/photo-1591198936750-16d8e15edb9e",
      ],
    },
    {
      DOG_BREEDS: [
        {
          breed: "Labrador Retriever",
          traits: ["Friendly", "Active", "Outgoing"],
        },
        {
          breed: "German Shepherd",
          traits: ["Loyal", "Confident", "Intelligent"],
        },
        { breed: "Golden Retriever", traits: ["Gentle", "Smart", "Friendly"] },
        {
          breed: "French Bulldog",
          traits: ["Playful", "Adaptable", "Charming"],
        },
        {
          breed: "Siberian Husky",
          traits: ["Energetic", "Independent", "Friendly"],
        },
        { breed: "Poodle", traits: ["Intelligent", "Active", "Elegant"] },
      ],
    },
    {
      CAT_BREEDS: [
        { breed: "Siamese", traits: ["Vocal", "Social", "Intelligent"] },
        { breed: "Persian", traits: ["Gentle", "Quiet", "Sweet"] },
        { breed: "Maine Coon", traits: ["Large", "Gentle", "Friendly"] },
        {
          breed: "British Shorthair",
          traits: ["Calm", "Patient", "Easy-going"],
        },
        { breed: "Bengal", traits: ["Active", "Playful", "Intelligent"] },
        { breed: "Ragdoll", traits: ["Relaxed", "Affectionate", "Gentle"] },
      ],
    },
    {
      BIRD_SPECIES: [
        { breed: "Budgerigar", traits: ["Social", "Playful", "Intelligent"] },
        { breed: "Cockatiel", traits: ["Friendly", "Musical", "Affectionate"] },
        { breed: "Lovebird", traits: ["Social", "Active", "Affectionate"] },
        { breed: "Canary", traits: ["Musical", "Active", "Gentle"] },
        {
          breed: "African Grey",
          traits: ["Intelligent", "Talkative", "Social"],
        },
        { breed: "Finch", traits: ["Social", "Active", "Musical"] },
      ],
    },
  ];
  res.json(animalData);
});

export default router;
