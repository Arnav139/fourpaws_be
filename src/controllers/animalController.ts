import { Request, Response } from "express";
import petServices, { petDocuments } from "../services/pets";
import cloudinary from "../config/cloudinary";
import { generatePetPdf } from "../utils/fillPdf";
import { mergePDFs } from "../utils/pdfMerger";
import { PetServices, UserService } from "../services";
import { parse } from "path";

export default class animalController {
  static VaccinationRecord = (req: Request, res) => {
    const { petId } = req.query;

    if (!petId) {
      return res.status(400).json({ message: "petId is required" });
    }

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
   
  static getAllPetsWeb = async(req:Request, res: Response) : Promise<any> =>{
      try {
        const pets = await petServices.getAllPets();
        if (!pets) {
          return res.status(404).json({ success: false, error: "No pets found" });
        }
  
        const myPets = pets.map((pet: any) => {
          return {
            ...pet,
            ...pet.metaData,
            photoUrl: pet.image,
            mergedPdf: pet.documents?.mergedPdf,
          };
        });
  
        res.status(200).json({ success: true, data: myPets });
      } catch (error : any) {
          res.status(500).json({ success: false, error: "Server Error" })
      }
    } 
  

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

  // Updated createNewPet method with optimizations
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
        color,
        weight,
        size,
        age,
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

      const parsedMetaData = JSON.parse(metaData);
      const fullMetaData = {
        ...parsedMetaData,
        // color: color || "unknown",
        // weight: Number(weight) || 0,
        // size: size || "small",
        // age: Number(age) || 0,
        // applicantName,
        // guardianName: guardianName || "",
        // residentialAddress: residentialAddress || "",
      };

      // Upload main image
      const imageFile = (req.files as any).image[0];
      const mainImageDataUri = `data:${
        imageFile.mimetype
      };base64,${imageFile.buffer.toString("base64")}`;
      const mainImageUploadPromise = cloudinary.uploader.upload(
        mainImageDataUri,
        { folder: "pets" }
      );

      // Upload additional images in parallel
      const additionalImagesFiles = (req.files as any).additionalImages || [];
      const additionalImageUploadPromises = additionalImagesFiles.map(
        (file: any) => {
          const uri = `data:${file.mimetype};base64,${file.buffer.toString(
            "base64"
          )}`;
          return cloudinary.uploader.upload(uri, { folder: "pets/additional" });
        }
      );

      // Upload documents in parallel
      const documentFields = [
        "veterinaryHealthCard",
        "vaccinationCard",
        "passport",
        "imageWithOwner",
        "ownerIdProof",
        "sterilizationCard",
      ];

      const documentUploadPromises: Promise<any>[] = [];
      const documentKeys: string[] = [];

      for (const field of documentFields) {
        const file = (req.files as any)?.[field]?.[0];
        if (file) {
          const isPDF = file.mimetype === "application/pdf";
          const uri = isPDF
            ? `data:application/pdf;base64,${file.buffer.toString("base64")}`
            : `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
          documentUploadPromises.push(
            cloudinary.uploader.upload(uri, {
              folder: "pets/documents",
              resource_type: isPDF ? "raw" : "image",
              format: isPDF ? "pdf" : undefined,
            })
          );
          documentKeys.push(field);
        }
      }

      // Generate filled form PDF while uploads happen
      const pdfBuffer = await generatePetPdf({
        applicantName : parsedMetaData.applicantName,
        guardianName : parsedMetaData.guardianName,
        residentialAddress : parsedMetaData.residentialAddress,
        contact: email,
        dogName: name,
        dogBreed: breed,
        dogColor: parsedMetaData.color,
        dogAge: parsedMetaData.age.toString(),
        dogGender: gender,
        vaccinationCard: "Yes",
        sterilizaed: sterilized ? "Yes" : "No",
        imageUrl :(await mainImageUploadPromise).secure_url
      });

      // Upload the filled PDF to Cloudinary (optional)
      const dataUri = `data:application/pdf;base64,${pdfBuffer.toString(
        "base64"
      )}`;
      const filledFormUploadPromise = cloudinary.uploader.upload(dataUri, {
        resource_type: "raw",
        folder: "pets/pdfs",
        format: "pdf",
      });

      // Wait for all uploads to complete
      const [
        mainImageUpload,
        additionalImageUploads,
        documentUploads,
        filledFormUpload,
      ] = await Promise.all([
        mainImageUploadPromise,
        Promise.all(additionalImageUploadPromises),
        Promise.all(documentUploadPromises),
        filledFormUploadPromise,
      ]);

      const additionalImages = additionalImageUploads.map(
        (upload) => upload.secure_url
      );
      const documents: Record<string, string> = {};
      documentUploads.forEach((upload, index) => {
        documents[documentKeys[index]] = upload.secure_url;
      });
      documents["filledForm"] = filledFormUpload.secure_url;

      // Save new pet to DB
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
        JSON.parse(allergies || "[]"),
        medications ? JSON.parse(medications) : [],
        documents as unknown as petDocuments
      );

      // Merge all relevant PDFs (filled form first)
      const mergeTargets = [
        filledFormUpload.secure_url,
        ...Object.values(documents).filter(
          (url) => url !== filledFormUpload.secure_url
        ),
      ];
      const mergedPdfBuffer = await mergePDFs(mergeTargets);
      const mergedPdfBase64 = mergedPdfBuffer.toString("base64");

      return res.status(201).json({
        success: true,
        message: "Pet created successfully", 
        newPet,
        mergedPdfBase64, 
      });
    } catch (error: any) {
      console.error("Error creating new pet:", error);
      return res
        .status(500)
        .json({ success: false, error: error.message || "Server Error" });
    }
  };

  static getMergedPdf = async (req: Request, res: Response): Promise<any> => {
    const { petId } = req.params;

    if (!petId) {
      return res
        .status(400)
        .json({ success: false, message: "petId is required" });
    }

    const getAlldocs = await PetServices.getAllDocs(parseInt(petId));
    if (!getAlldocs) {
      return res
        .status(400)
        .json({ success: false, message: "unable to fetch all docs" });
    }

    const documents = getAlldocs.documents;

    const docUrls: string[] = [
    documents.filledForm, 
    documents.passport,
    documents.veterinaryHealthCard,
    documents.vaccinationCard,
    documents.ownerIdProof,
    documents.imageWithOwner,
    documents.sterilizationCard,
  ].filter(Boolean);

  try {
    const mergedPdfBuffer = await mergePDFs(docUrls);
    const mergedPdfBase64 = mergedPdfBuffer.toString("base64");

   return res.status(200).json({success : true, message: "merged pdf fetched successfully", mergedPdfBase64})
  } catch (error) {
    console.error("Error merging PDFs:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to merge documents" });
  }
  };
}
