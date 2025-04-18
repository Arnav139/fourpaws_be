import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Constants for validation (adjust as needed)
const Constants = {
  perPageMaxDataLength: 100, // Example max limit for pagination
  maxFileSize: 5 * 1024 * 1024, // 5MB
};

// Define interface for req.files to ensure type safety
interface MulterRequest extends Request {
  files: {
    image?: Express.Multer.File[];
    additionalImages?: Express.Multer.File[];
  };
}

export default class PetValidators {
  // VaccinationRecord validator
  static validateVaccinationRecord = z.object({
    body: z.object({}).strict(),
    params: z.object({}).strict(),
    query: z.object({
      petId: z
        .string({ required_error: "petId is required" })
        .min(1, "petId must be a non-empty string"),
    }).strict(),
  });

  // VaccinationSchedule validator
  static validateVaccinationSchedule = z.object({
    body: z.object({}).strict(),
    params: z.object({}).strict(),
    query: z.object({
      petId: z
        .string({ required_error: "petId is required" })
        .min(1, "petId must be a non-empty string"),
    }).strict(),
  });

  // getAllPets validator
  static validateGetAllPets = z.object({
    body: z.object({}).strict(),
    params: z.object({}).strict(),
    query: z.object({}).strict(),
  });

  // getAnimalData validator
  static validateGetAnimalData = z.object({
    body: z.object({}).strict(),
    params: z.object({}).strict(),
    query: z.object({}).strict(),
  });

  // createNewPet validator
  static validateCreateNewPet = z.object({
    body: z.object({
      registrationNumber: z.string({ required_error: 'registrationNumber is required' }),
      governmentRegistered: z
        .string({required_error: 'governmentRegistered is required'}),
      name: z.string({ required_error: "name is required" }).min(1, "Name must be a non-empty string"),
      species: z.string({ required_error: "species is required" }).min(1, "Species must be a non-empty string"),
      breed: z.string({ required_error: "breed is required" }).min(1, "Breed must be a non-empty string"),
      gender: z.string().optional(),
      sterilized: z.string({required_error: 'sterilized is required'}),
      bio: z.string().nullable().optional(),
      dateOfBirth: z.string().optional(), // Could add regex for date format
      metaData: z
        .string({ required_error: "metaData is required" })
        .refine(
          (val) => {
            try {
              JSON.parse(val);
              return true;
            } catch {
              return false;
            }
          },
          { message: "metaData must be valid JSON" }
        ),
      personalityTraits: z
        .string({ required_error: "personalityTraits is required" })
        .refine(
          (val) => {
            try {
              const parsed = JSON.parse(val);
              console.log("Parsed personalityTraits", parsed);
              return Array.isArray(parsed);
            } catch {
                console.log("Error parsing personalityTraits", val);
              return false;
            }
          },
          { message: "personalityTraits must be a valid JSON array" }
        ),
      allergies: z
        .string()
        .refine(
          (val) => {
            try {
              const parsed = JSON.parse(val);
              return Array.isArray(parsed);
            } catch {
              return false;
            }
          },
          { message: "allergies must be a valid JSON array" }
        )
        .optional(),
      medications: z
        .string()
        .refine(
          (val) => {
            try {
              const parsed = JSON.parse(val);
              return Array.isArray(parsed);
            } catch {
              return false;
            }
          },
          { message: "medications must be a valid JSON array" }
        )
        .optional(),
        additionalImages:z.object({}).optional(),
        documents:z.object({
          "veterinaryHealthCard" : z.string(),
          "vaccinationCard" : z.string(),
          "passport" : z.string(),
          "imageWithOwner" : z.string(),
          "ownerIdProof" : z.string(),
          "sterilizationCard" : z.string()
        }).optional()
    }),
    params: z.object({}).strict(),
    query: z.object({}).strict(),
  });

  // Middleware to apply validators
  static applyValidator(validator: z.ZodSchema) {
    return (req: Request | MulterRequest, res: Response, next: NextFunction) => {
      try {
        validator.parse({
          body: req.body,
          params: req.params,
          query: req.query,
        });

        // Additional file validation for createNewPet
        if (validator === PetValidators.validateCreateNewPet) {
          const multerReq = req as MulterRequest;
          if (!multerReq.files || !multerReq.files.image || multerReq.files.image.length === 0) {
            return res.status(400).json({
              success: false,
              error: "Main image is required",
            });
          }

          if (multerReq.files.additionalImages && multerReq.files.additionalImages.length > 5) {
            return res.status(400).json({
              success: false,
              error: "Maximum 5 additional images allowed",
            });
          }

          const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
          const maxSize = Constants.maxFileSize;

          const imageFile = multerReq.files.image[0];
          if (!allowedTypes.includes(imageFile.mimetype)) {
            return res.status(400).json({
              success: false,
              error: "Main image must be JPEG, PNG, or JPG",
            });
          }
          if (imageFile.size > maxSize) {
            return res.status(400).json({
              success: false,
              error: "Main image exceeds 5MB limit",
            });
          }

          if (multerReq.files.additionalImages) {
            for (const file of multerReq.files.additionalImages) {
              if (!allowedTypes.includes(file.mimetype)) {
                return res.status(400).json({
                  success: false,
                  error: "Additional images must be JPEG, PNG, or JPG",
                });
              }
              if (file.size > maxSize) {
                return res.status(400).json({
                  success: false,
                  error: "Additional images exceed 5MB limit",
                });
              }
            }
          }
        }

        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            success: false,
            error: "Invalid request data",
            details: error.errors,
          });
        }
        return res.status(500).json({
          success: false,
          error: "Internal Server Error",
        });
      }
    };
  }
}