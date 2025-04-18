import { Request, Response } from "express";
import petServices, { petDocuments } from "../services/pets";
import cloudinary from "../config/cloudinary";

const vaccinationRecord = [
  {
    id: "vr1",
    petId: "pet-1",
    vaccineName: "Rabies Vaccine",
    vaccineType: "Anti-Rabies",
    dateAdministered: "2023-05-10",
    nextDueDate: "2024-05-10",
    vetName: "Dr. Sharma",
    clinic: "human Care Clinic",
    notes: "Annual vaccine administered without complications.",
  },
  {
    id: "vr2",
    petId: "pet-1",
    vaccineName: "DHPP",
    vaccineType: "DHPP",
    dateAdministered: "2023-03-15",
    nextDueDate: "2024-03-15",
    vetName: "Dr. Patel",
    clinic: "Pet Care Clinic",
    batchNumber: "DHPP789",
    notes:
      "Combination vaccine for distemper, hepatitis, parainfluenza, and parvovirus.",
  },
  {
    id: "vr3",
    petId: "pet-2",
    vaccineName: "FVRCP",
    vaccineType: "FVRCP",
    dateAdministered: "2023-07-22",
    nextDueDate: "2024-07-22",
    vetName: "Dr. Gupta",
    clinic: "Feline Health Center",
    notes: "Core vaccine for cats.",
  },
];

const vaccinationSchedule = [
  {
    id: "vs1",
    petId: "pet-1",
    vaccineName: "Rabies Vaccine",
    vaccineType: "Anti-Rabies",
    dateAdministered: "2023-05-10",
    nextDueDate: "2024-05-10",
    vetName: "Dr. Sharma",
    clinic: "Pet Care Clinic",
    notes: "Annual vaccine administered without complications.",
  },
  {
    id: "vs2",
    petId: "pet-2",
    vaccineName: "FVRCP",
    vaccineType: "FVRCP",
    dateAdministered: "2023-07-22",
    nextDueDate: "2024-07-22",
    vetName: "Dr. Gupta",
    clinic: "Feline Health Center",
    notes: "Core vaccine for cats.",
  },
];

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

export default class animalController {
  static VaccinationRecord = (req: Request, res) => {
    const { petId } = req.query;

    if (!petId) {
      return res.status(400).json({ message: "petId is required" });
    }

    // Filter vaccination records based on petId
    const filteredData = vaccinationRecord.filter(
      (record) => record.petId === petId
    );

    // If no records are found, return a 404 response
    if (filteredData.length === 0) {
      return res.status(404).json({
        message: "No vaccination records found for this petId",
        data: [],
      });
    }

    res.status(200).json({
      message: "Vaccination records fetched successfully",
      data: filteredData,
    });
  };

  static VaccinationSchedule = async (req: Request, res) => {
    const { petId } = req.query;

    if (!petId) {
      return res.status(400).json({ message: "petId is required" });
    }

    // Filter vaccination records based on petId
    const filteredData = vaccinationSchedule.filter(
      (record) => record.petId === petId
    );

    // If no records are found, return a 404 response
    if (filteredData.length === 0) {
      return res.status(404).json({
        message: "No vaccination records found for this petId",
        data: [],
      });
    }

    res.status(200).json({
      message: "Vaccination records fetched successfully",
      data: filteredData,
    });
  };

  // static getAllPets = async (req: Request, res: Response) => {
  //   // try {
  //   //   // High-quality pet images from Unsplash
  //   //   const DOG_IMAGES = [
  //   //     "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
  //   //     "https://images.unsplash.com/photo-1587300003388-59208cc962cb",
  //   //     "https://images.unsplash.com/photo-1517849845537-4d257902454a",
  //   //     "https://images.unsplash.com/photo-1583511655826-05700d52f4d9",
  //   //     "https://images.unsplash.com/photo-1558788353-f76d92427f16",
  //   //     "https://images.unsplash.com/photo-1561037404-61cd46aa615b",
  //   //   ];

  //   //   const CAT_IMAGES = [
  //   //     "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
  //   //     "https://images.unsplash.com/photo-1573865526739-10659fec78a5",
  //   //     "https://images.unsplash.com/photo-1495360010541-f48722b34f7d",
  //   //     "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
  //   //     "https://images.unsplash.com/photo-1574158622682-e40e69881006",
  //   //     "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec",
  //   //   ];

  //   //   const BIRD_IMAGES = [
  //   //     "https://images.unsplash.com/photo-1444464666168-49d633b86797",
  //   //     "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f",
  //   //     "https://images.unsplash.com/photo-1552728089-57bdde30beb3",
  //   //     "https://images.unsplash.com/photo-1544923408-75c5cef46f14",
  //   //     "https://images.unsplash.com/photo-1562090175-14e30223a7c5",
  //   //     "https://images.unsplash.com/photo-1591198936750-16d8e15edb9e",
  //   //   ];

  //   //   // Pet data
  //   //   const PET_TYPES = ["dog", "cat", "bird"];
  //   //   const SIZES = ["small", "medium", "large"];
  //   //   const COLORS = ["Black", "White", "Brown", "Grey", "Golden", "Mixed"];
  //   //   const LOCATIONS = [
  //   //     "New York, NY",
  //   //     "Los Angeles, CA",
  //   //     "Chicago, IL",
  //   //     "Houston, TX",
  //   //     "Phoenix, AZ",
  //   //     "Philadelphia, PA",
  //   //   ];

  //   //   const DOG_BREEDS = [
  //   //     {
  //   //       breed: "Labrador Retriever",
  //   //       traits: ["Friendly", "Active", "Outgoing"],
  //   //     },
  //   //     {
  //   //       breed: "German Shepherd",
  //   //       traits: ["Loyal", "Confident", "Intelligent"],
  //   //     },
  //   //     { breed: "Golden Retriever", traits: ["Gentle", "Smart", "Friendly"] },
  //   //     {
  //   //       breed: "French Bulldog",
  //   //       traits: ["Playful", "Adaptable", "Charming"],
  //   //     },
  //   //     {
  //   //       breed: "Siberian Husky",
  //   //       traits: ["Energetic", "Independent", "Friendly"],
  //   //     },
  //   //     { breed: "Poodle", traits: ["Intelligent", "Active", "Elegant"] },
  //   //   ];

  //   //   const CAT_BREEDS = [
  //   //     { breed: "Siamese", traits: ["Vocal", "Social", "Intelligent"] },
  //   //     { breed: "Persian", traits: ["Gentle", "Quiet", "Sweet"] },
  //   //     { breed: "Maine Coon", traits: ["Large", "Gentle", "Friendly"] },
  //   //     {
  //   //       breed: "British Shorthair",
  //   //       traits: ["Calm", "Patient", "Easy-going"],
  //   //     },
  //   //     { breed: "Bengal", traits: ["Active", "Playful", "Intelligent"] },
  //   //     { breed: "Ragdoll", traits: ["Relaxed", "Affectionate", "Gentle"] },
  //   //   ];

  //   //   const BIRD_SPECIES = [
  //   //     { breed: "Budgerigar", traits: ["Social", "Playful", "Intelligent"] },
  //   //     { breed: "Cockatiel", traits: ["Friendly", "Musical", "Affectionate"] },
  //   //     { breed: "Lovebird", traits: ["Social", "Active", "Affectionate"] },
  //   //     { breed: "Canary", traits: ["Musical", "Active", "Gentle"] },
  //   //     {
  //   //       breed: "African Grey",
  //   //       traits: ["Intelligent", "Talkative", "Social"],
  //   //     },
  //   //     { breed: "Finch", traits: ["Social", "Active", "Musical"] },
  //   //   ];

  //   //   // Function to get random values
  //   //   const getRandomElement = <T>(arr: T[]): T =>
  //   //     arr[Math.floor(Math.random() * arr.length)];
  //   //   const getRandomAge = () => (Math.random() * (10 - 1) + 1).toFixed(1);
  //   //   const getRandomWeight = (
  //   //     species: string,
  //   //     size: "small" | "medium" | "large"
  //   //   ) => {
  //   //     const weightRanges = {
  //   //       dog: { small: [3, 8], medium: [8, 20], large: [20, 40] },
  //   //       cat: { small: [2, 4], medium: [4, 6], large: [6, 9] },
  //   //       bird: { small: [0.1, 0.3], medium: [0.3, 1], large: [1, 3] },
  //   //     };

  //   //     const range = weightRanges[species]?.[size] || weightRanges.dog.medium;
  //   //     return (Math.random() * (range[1] - range[0]) + range[0]).toFixed(1);
  //   //   };

  //   //   // Generate pets
  //   //   const generateMockPets = (count: number = 20) => {
  //   //     const pets = [];

  //   //     for (let i = 0; i < count; i++) {
  //   //       const species = getRandomElement(PET_TYPES);
  //   //       const size = getRandomElement(SIZES);
  //   //       let breedInfo, imageArray;

  //   //       switch (species) {
  //   //         case "dog":
  //   //           breedInfo = getRandomElement(DOG_BREEDS);
  //   //           imageArray = DOG_IMAGES;
  //   //           break;
  //   //         case "cat":
  //   //           breedInfo = getRandomElement(CAT_BREEDS);
  //   //           imageArray = CAT_IMAGES;
  //   //           break;
  //   //         case "bird":
  //   //           breedInfo = getRandomElement(BIRD_SPECIES);
  //   //           imageArray = BIRD_IMAGES;
  //   //           break;
  //   //       }

  //   //       const pet = {
  //   //         id: `pet-${i + 1}`,
  //   //         name: breedInfo.breed.split(" ")[0],
  //   //         species,
  //   //         breed: breedInfo.breed,
  //   //         age: getRandomAge(),
  //   //         gender: Math.random() > 0.5 ? "Male" : "Female",
  //   //         color: getRandomElement(COLORS),
  //   //         weight: Number(getRandomWeight(species, size as any)),
  //   //         sterilized: Math.random() > 0.3,
  //   //         registrationNumber:
  //   //           Math.random() > 0.5
  //   //             ? `REG${Math.floor(Math.random() * 10000)}`
  //   //             : undefined,
  //   //         bio: `A lovely ${breedInfo.breed} who is ${breedInfo.traits
  //   //           .join(", ")
  //   //           .toLowerCase()}. Looking for a loving home!`,
  //   //         location: getRandomElement(LOCATIONS),
  //   //         photoUrl: `${getRandomElement(imageArray)}?w=500&q=80`,
  //   //         ownerID: `user-${Math.floor(Math.random() * 10) + 1}`,
  //   //         dateOfBirth: new Date(
  //   //           Date.now() - Math.random() * 31536000000 * 10
  //   //         ).toISOString(),
  //   //       };

  //   //       pets.push(pet);
  //   //     }
  //   //     return pets;
  //   //   };

  //   //   const pets = generateMockPets(20);
  //   //   res.status(200).json({ success: true, data: pets });
  //   // } catch (error) {
  //   //   console.error("Error generating pets:", error);
  //   //   res.status(500).json({
  //   //     success: false,
  //   //     message: "Server Error",
  //   //     error: error.message,
  //   //   });
  //   // }
  // };

  static getAllPets = async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req["user"]["userId"];
      console.log(userId, "User ID");
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, error: "User ID is required" });
      }
      const pets = await petServices.getAllPets(parseInt(userId));
      if (!pets) {
        return res.status(404).json({ success: false, error: "No pets found" });
      }
      console.log(pets, "Pets");

      const myPets = pets.map((pet: any) => ({
        ...pet,
        ...pet.metaData,
        photoUrl: pet.image,
      }));
      console.log(myPets, "My Pets");
      res.status(200).json({ success: true, data: myPets });
    } catch (error) {
      console.error("Error fetching pets:", error);
      res.status(500).json({ success: false, error: "Server Error" });
    }
  };

  static getAnimalData = async (req: Request, res: Response) => {
    res.json(animalData);
  };

  static createNewPet = async (req: Request, res: Response): Promise<any> => {
    try {
      // console.log(req,"request")
      const {
        registrationNumber,
        governmentRegistered,
        name,
        species,
        breed,
        gender,
        sterilized,
        bio,
        dateOfBirth,
        metaData,
        personalityTraits,
        allergies,
        medications,
      } = req.body;
      const userid = req["user"]["userId"];
      console.log("User ID", userid);
      console.log(req.files, "Files");
      if (
        !governmentRegistered ||
        !name ||
        !species ||
        !breed ||
        !metaData ||
        !req.files ||
        !("image" in req.files)
      ) {
        return res
          .status(400)
          .json({ success: false, error: "Required fields missing" });
      }

      const imageFile = (req.files as any).image[0];
      const mainImageDataUri = `data:${
        imageFile.mimetype
      };base64,${imageFile.buffer.toString("base64")}`;
      const mainImageUpload = await cloudinary.uploader.upload(
        mainImageDataUri,
        {
          folder: "pets",
        }
      );

      const additionalImagesFiles = (req.files as any).additionalImages || [];
      const additionalImages: string[] = [];

      for (const file of additionalImagesFiles) {
        const fileDataUri = `data:${
          file.mimetype
        };base64,${file.buffer.toString("base64")}`;
        const upload = await cloudinary.uploader.upload(fileDataUri, {
          folder: "pets/additional",
        });
        additionalImages.push(upload.secure_url);
      }

      // Extract and merge fields into metaData
      const parsedMetaData = JSON.parse(metaData);
      const fullMetaData = {
        ...parsedMetaData,
        color: req.body.color || "unknown",
        weight: Number(req.body.weight) || 0,
        size: req.body.size || "small",
        age: Number(req.body.age) || 0,
      };

      // Upload pet documents
      const documentFields = [
        "veterinaryHealthCard",
        "vaccinationCard",
        "passport",
        "imageWithOwner",
        "ownerIdProof",
        "sterilizationCard",
      ];

      const documents: Record<string, string> = {};

      for (const field of documentFields) {
        const file = (req.files as any)?.[field]?.[0];

        if (file) {
          const isPDF = file.mimetype === "application/pdf";
          const fileDataUri = isPDF
            ? `data:application/pdf;base64,${file.buffer.toString("base64")}`
            : `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

          const upload = await cloudinary.uploader.upload(fileDataUri, {
            folder: "pets/documents",
            resource_type: isPDF ? "raw" : "image",
            format: isPDF ? "pdf" : undefined,
          });

          documents[field] = upload.secure_url;
        }
      }

      const newPet = await petServices.createNewPet(
        userid,
        registrationNumber.trim().length > 0 ? registrationNumber : undefined,
        governmentRegistered || false,
        name,
        species,
        breed,
        gender || "unknown",
        sterilized,
        bio || null,
        mainImageUpload.secure_url,
        additionalImages,
        dateOfBirth,
        fullMetaData,
        JSON.parse(personalityTraits),
        JSON.parse(allergies) || [],
        medications ? JSON.parse(medications) : [],
        documents as unknown as  petDocuments
      );

      return res.status(201).json({
        success: true,
        message: "New pet created successfully",
        pet: newPet,
      });
    } catch (error) {
      console.error("Error creating new pet:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }
  };
}
