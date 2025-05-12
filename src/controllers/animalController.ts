import { Request, Response } from "express";
import petServices, { petDocuments } from "../services/pets";
import cloudinary from "../config/cloudinary";
import { generatePetPdf } from "../utils/fillPdf";
import { mergePDFsWithBuffers, PdfSource } from "../utils/pdfMerger";
import {
  uploadBufferToCloudinary,
  uploadToCloudinary,
} from "../utils/uploader";

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

  static createNewPet = async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        registrationNumber,
        governmentRegistered = false,
        name,
        species,
        breed,
        gender = "unknown",
        sterilized,
        bio = null,
        dateOfBirth,
        metaData,
        personalityTraits,
        allergies = "[]",
        medications = "[]",
        color = "unknown",
        weight = 0,
        size = "small",
        age = 0,
        applicantName = "",
        guardianName = "",
        residentialAddress = "",
        contact = "",
      } = req.body;

      const userid = req["user"]?.["userId"];
      if (!userid) {
        return res
          .status(401)
          .json({ success: false, error: "User not authenticated" });
      }

      const files = req.files as unknown as {
        [fieldname: string]: Express.Multer.File | Express.Multer.File[];
      };

      // --- 1. Validation ---
      if (!name || !species || !breed || !metaData || !files?.image) {
        return res.status(400).json({
          success: false,
          error:
            "Required fields missing (name, species, breed, metaData, image are mandatory)",
        });
      }

      // --- 2. Prepare Concurrent Operations ---
      const promises: Promise<any>[] = [];
      const promiseMap = {
        mainImage: -1,
        additionalImages: [] as number[],
        documents: [] as {
          field: string;
          index: number;
          mimetype: string; // Store mimetype for merging logic
          isPdf: boolean;
          buffer?: Buffer;
        }[],
        generatedPdf: -1,
      };

      // --- 2a. Main Image Upload ---
      const mainImageFile = Array.isArray(files.image)
        ? files.image[0]
        : files.image;
      if (mainImageFile) {
        promiseMap.mainImage =
          promises.push(uploadToCloudinary(mainImageFile, "pets", "image")) - 1;
      } else {
        return res
          .status(400)
          .json({ success: false, error: "Main image ('image') is required." });
      }

      // --- 2b. Additional Images Upload ---
      const additionalImagesFiles = files.additionalImages
        ? Array.isArray(files.additionalImages)
          ? files.additionalImages
          : [files.additionalImages]
        : [];
      additionalImagesFiles.forEach((file) => {
        if (file) {
          promiseMap.additionalImages.push(
            promises.push(
              uploadToCloudinary(file, "pets/additional", "image"),
            ) - 1,
          );
        }
      });

      // --- 2c. Document Uploads ---
      const documentFields = [
        "veterinaryHealthCard",
        "vaccinationCard",
        "passport",
        "imageWithOwner",
        "ownerIdProof",
        "sterilizationCard",
      ];
      // Store document info including mimetype for merging later
      const uploadedDocumentInfo: {
        field: string;
        file: Express.Multer.File;
      }[] = [];

      documentFields.forEach((field) => {
        const fileOrFiles = files[field];
        const file = fileOrFiles
          ? Array.isArray(fileOrFiles)
            ? fileOrFiles[0]
            : fileOrFiles
          : undefined;
        if (file) {
          uploadedDocumentInfo.push({ field, file }); // Store file info temporarily
          const isPDF = file.mimetype === "application/pdf";
          const resourceType = isPDF ? "raw" : "image"; // Or 'auto' if Cloudinary handles it well
          const index =
            promises.push(
              uploadToCloudinary(file, "pets/documents", resourceType),
            ) - 1;

          // Store details needed after Promise.all
          promiseMap.documents.push({
            field,
            index,
            mimetype: file.mimetype, // Store original mimetype
            isPdf: isPDF,
            buffer: file.buffer, // Keep buffer temporarily
          });
        }
      });

      // --- 2d. PDF Generation ---
      promiseMap.generatedPdf =
        promises.push(
          generatePetPdf({
            applicantName,
            guardianName,
            residentialAddress,
            contact,
            dogName: name,
            dogBreed: breed,
            dogColor: color,
            dogAge: String(age),
          }),
        ) - 1;

      // --- 3. Execute All Concurrent Operations ---
      if (promises.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: "No files or data to process." });
      }
      const results = await Promise.all(promises);

      // --- 4. Process Results and Prepare Data ---
      const documentsResult: Record<string, string> = {};
      let mainImageUrl: string | null = null;
      let generatedPdfBuffer: Buffer | null = null;
      const additionalImageUrls: string[] = [];
      const sourcesForMerging: PdfSource[] = []; // <--- Initialize for buffer-based merging

      // --- 4a. Main Image ---
      if (promiseMap.mainImage !== -1) {
        const result = results[promiseMap.mainImage];
        if (result?.secure_url) {
          mainImageUrl = result.secure_url;
        } else {
          console.error("Main image upload failed. Result:", result);
          return res
            .status(500)
            .json({ success: false, error: "Failed to upload main image." });
        }
      }

      // --- 4b. Additional Images ---
      promiseMap.additionalImages.forEach((index) => {
        const result = results[index];
        if (result?.secure_url) {
          additionalImageUrls.push(result.secure_url);
        } else {
          console.warn("An additional image upload failed. Result:", result);
        }
      });

      // --- 4c. Documents ---
      promiseMap.documents.forEach((docInfo) => {
        const result = results[docInfo.index];
        if (result?.secure_url) {
          documentsResult[docInfo.field] = result.secure_url;
          // Add buffer and mimetype to sources list if buffer exists
          if (docInfo.buffer) {
            // Only add PDFs and supported images for merging
            if (
              docInfo.mimetype === "application/pdf" ||
              docInfo.mimetype === "image/jpeg" ||
              docInfo.mimetype === "image/png"
            ) {
              sourcesForMerging.push({
                buffer: docInfo.buffer,
                mimetype: docInfo.mimetype, // Pass correct mimetype
              });
            } else {
              console.log(
                `Document field '${docInfo.field}' has buffer but unsupported mimetype '${docInfo.mimetype}' for merging.`,
              );
            }
          } else {
            console.warn(
              `Buffer missing for document field '${docInfo.field}' after upload, cannot use for merging.`,
            );
          }
        } else {
          console.warn(
            `Upload failed for document: ${docInfo.field}. Result:`,
            result,
          );
        }
      });

      // --- 4d. Generated PDF ---
      if (promiseMap.generatedPdf !== -1) {
        const result = results[promiseMap.generatedPdf];
        if (result instanceof Buffer) {
          generatedPdfBuffer = result;
        } else {
          console.error(
            "PDF generation failed or did not return a Buffer. Result:",
            result,
          );
          return res.status(500).json({
            success: false,
            error: "Failed to generate pet information PDF.",
          });
        }
      }

      // --- 5. Handle Generated PDF Upload, Merging, and Merged PDF Upload ---
      let generatedPdfUrl: string | null = null;
      let mergedPdfUrl: string | null = null;

      if (generatedPdfBuffer) {
        try {
          // Upload the generated PDF
          const generatedPdfUploadResult = await uploadBufferToCloudinary(
            generatedPdfBuffer,
            "pets/pdfs",
            "raw",
            `generated_${userid}_${name.replace(/\s+/g, "_")}_${Date.now()}`,
            "pdf",
          );
          generatedPdfUrl = generatedPdfUploadResult.secure_url;
          documentsResult["filledForm"] = generatedPdfUrl;

          // Add generated PDF to sources for merging
          sourcesForMerging.push({
            buffer: generatedPdfBuffer,
            mimetype: "application/pdf", // It's definitely a PDF
          });

          // Only merge if there are multiple sources now
          if (sourcesForMerging.length > 1) {
            console.log(
              `Merging ${sourcesForMerging.length} sources (from buffers).`,
            );
            // Use the new function with PdfSource objects
            const mergedPdfBuffer =
              await mergePDFsWithBuffers(sourcesForMerging); // <--- Use updated function

            // Upload the merged PDF
            const mergedPdfUploadResult = await uploadBufferToCloudinary(
              mergedPdfBuffer,
              "pets/pdfs",
              "raw",
              `merged_${userid}_${name.replace(/\s+/g, "_")}_${Date.now()}`,
              "pdf",
            );
            mergedPdfUrl = mergedPdfUploadResult.secure_url;
            documentsResult["mergedPdf"] = mergedPdfUrl;
          } else {
            console.log(
              "Single source or no sources eligible for merging found, skipping merge step.",
            );
          }
        } catch (pdfError) {
          console.error("Error during PDF upload/merge stage:", pdfError);
          return res.status(500).json({
            success: false,
            error: "Failed to process or upload generated/merged PDFs.",
          });
        }
      } else {
        console.log(
          "No generated PDF buffer, skipping PDF upload and merge steps.",
        );
      }

      // --- 6. Prepare Final Data ---
      let parsedMetaData = {},
        parsedPersonalityTraits = [],
        parsedAllergies = [],
        parsedMedications = [];
      try {
        parsedMetaData = JSON.parse(metaData || "{}");
      } catch (e) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid metaData JSON" });
      }
      try {
        parsedPersonalityTraits = JSON.parse(personalityTraits || "[]");
      } catch (e) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid personalityTraits JSON" });
      }
      try {
        parsedAllergies = JSON.parse(allergies || "[]");
      } catch (e) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid allergies JSON" });
      }
      try {
        parsedMedications = JSON.parse(medications || "[]");
      } catch (e) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid medications JSON" });
      }

      const fullMetaData = {
        ...parsedMetaData,
        color,
        weight: Number(weight) || 0,
        size,
        age: Number(age) || 0,
      };

      // --- 7. Create Pet in Database ---
      const newPet = await petServices.createNewPet(
        userid,
        registrationNumber || null,
        governmentRegistered,
        name,
        species,
        breed,
        gender,
        sterilized,
        bio,
        mainImageUrl!, // Assert non-null as it's checked critical earlier
        additionalImageUrls,
        dateOfBirth,
        fullMetaData,
        parsedPersonalityTraits,
        parsedAllergies,
        parsedMedications,
        documentsResult as unknown as petDocuments,
      );

      // --- 8. Final Response ---
      return res.status(201).json({
        success: true,
        message: "New pet created successfully",
        pet: newPet,
        pdfUrl: generatedPdfUrl,
        mergedPdfUrl: mergedPdfUrl,
      });
    } catch (error) {
      console.error("Unhandled error in createNewPet:", error);
      return res.status(500).json({
        success: false,
        error: "An unexpected error occurred while creating the pet.",
      });
    }
  };

  // static getAnimalData = async (req: Request, res: Response) => {
  //   res.json(animalData);
  // };
}
