import { Request, Response } from "express";
import petServices, { petDocuments } from "../services/pets";
import cloudinary from "../config/cloudinary";
import { generatePetPdf } from "../utils/fillPdf";
import { mergePDFs } from "../utils/pdfMerger";
import { UserService } from "../services";

export default class animalController {
  static VaccinationRecord = (req: Request, res) => {
    const { petId } = req.query;

    if (!petId) {
      return res.status(400).json({ message: "petId is required" });
    }

    // Filter vaccination records based on petId
    // const filteredData = vaccinationRecord.filter(
    //   (record) => record.petId === petId,
    // );

    // If no records are found, return a 404 response
    // if (filteredData.length === 0) {
    //   return res.status(404).json({
    //     message: "No vaccination records found for this petId",
    //     data: [],
    //   });
    // }

    // res.status(200).json({
    //   message: "Vaccination records fetched successfully",
    //   data: filteredData,
    // });
  };

  static VaccinationSchedule = async (req: Request, res) => {
    const { petId } = req.query;

    // if (!petId) {
    //   return res.status(400).json({ message: "petId is required" });
    // }

    // // Filter vaccination records based on petId
    // const filteredData = vaccinationSchedule.filter(
    //   (record) => record.petId === petId,
    // );

    // // If no records are found, return a 404 response
    // if (filteredData.length === 0) {
    //   return res.status(404).json({
    //     message: "No vaccination records found for this petId",
    //     data: [],
    //   });
    // }

    // res.status(200).json({
    //   message: "Vaccination records fetched successfully",
    //   data: filteredData,
    // });
  };

  static getAllPets = async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req["user"]["userId"];

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, error: "User ID is required" });
      }
      const pets = await petServices.getAllPets();
      if (!pets) {
        return res.status(404).json({ success: false, error: "No pets found" });
      }

      const myPets = pets.map((pet: any) => {
        // const documents = Object.values(pet.documents || {}) as string[];
        // const pdfBuffer = await mergePDFs(documents);

        // const base64Pdf = pdfBuffer.toString("base64");
        // const dataUri = `data:application/pdf;base64,${base64Pdf}`;

        // const mergedPdfResult = await cloudinary.uploader.upload(dataUri, {
        //   resource_type: "raw",
        //   folder: "pets/pdfs",
        //   format: "pdf",
        // });

        // const mergedPdf = mergedPdfResult.secure_url;

        // console.log("Merged PDF URL:", mergedPdf);

        return {
          ...pet,
          ...pet.metaData,
          photoUrl: pet.image,
          mergedPdf: pet.documents?.mergedPdf,
        };
      });

      res.status(200).json({ success: true, data: myPets });
    } catch (error) {
      console.error("Error fetching pets:", error);
      res.status(500).json({ success: false, error: "Server Error" });
    }
  };

  static getMyPets = async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req["user"]["userId"];

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, error: "User ID is required" });
      }
      const pets = await petServices.getMyPets(parseInt(userId));
      if (!pets) {
        return res.status(404).json({ success: false, error: "No pets found" });
      }

      const myPets = pets.map((pet: any) => ({
        ...pet,
        ...pet.metaData,
        photoUrl: pet.image,
      }));
      res.status(200).json({ success: true, data: myPets });
    } catch (error) {
      console.error("Error fetching pets:", error);
      res.status(500).json({ success: false, error: "Server Error" });
    }
  };

  // static getAnimalData = async (req: Request, res: Response) => {
  //   res.json(animalData);
  // };

  static createNewPet = async (req: Request, res: Response): Promise<any> => {
    try {
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
      const email = req["user"]["email"];


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

      // Upload main image
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

      // Upload additional images
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

      // Extract and merge metaData
      const parsedMetaData = JSON.parse(metaData);
      const fullMetaData = {
        ...parsedMetaData,
        color: req.body.color || "unknown",
        weight: Number(req.body.weight) || 0,
        size: req.body.size || "small",
        age: Number(req.body.age) || 0,
        applicantName:req.body.applicantName,
        guardianName: req.body.guardianName || "",
        residentialAddress: req.body.residentialAddress || "",
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

      // Generate PDF & upload to Cloudinary
      // Generate PDF & upload to Cloudinary
      const pdfBuffer = await generatePetPdf({
        applicantName: fullMetaData.applicantName,
        guardianName: fullMetaData.guardianName,
        residentialAddress:fullMetaData.residentialAddress,
        contact: email,
        dogName: name,
        dogBreed: breed,
        dogColor: fullMetaData.color,
        dogAge: fullMetaData.age.toString(),
        imageUrl: mainImageUpload.secure_url,
        vaccinationCard: "Yes",
        sterilizaed: sterilized ? "Yes" : "No",

      });

      const base64Pdf = pdfBuffer.toString("base64");
      const dataUri = `data:application/pdf;base64,${base64Pdf}`;

      const pdfUploadResult = await cloudinary.uploader.upload(dataUri, {
        resource_type: "raw",
        folder: "pets/pdfs",
        format: "pdf",
      });

      
      const mergedPdfBuffer = await mergePDFs([
        pdfUploadResult.secure_url,
        ...Object.values(documents),
      ]);
      
      documents["filledForm"] = pdfUploadResult.secure_url;
      // Fix: Properly encode mergedPdfBuffer to base64
      const mergedBase64Pdf = mergedPdfBuffer.toString("base64");
      const mergedDataUri = `data:application/pdf;base64,${mergedBase64Pdf}`;

      const mergedPdfResult = await cloudinary.uploader.upload(mergedDataUri, {
        resource_type: "auto",
        folder: "pets/pdfs",
        format: "pdf",
      });

      const mergedPdf = mergedPdfResult.secure_url;
      documents["mergedPdf"] = mergedPdf;
      // Create new pet entry in DB
      const newPet = await petServices.createNewPet(
        userid,
        registrationNumber || null,
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
        documents as unknown as petDocuments
      );

      // Final response (single JSON response, no duplicate sends)
      return res.status(201).json({
        success: true,
        message: "New pet created successfully",
        pet: newPet,
        pdfUrl: pdfUploadResult.secure_url,
      });
    } catch (error) {
      console.error("Error creating new pet:", error);
      return res
        .status(500)
        .json({ success: false, error: error.message || "Server Error" });
    }
  };
}
