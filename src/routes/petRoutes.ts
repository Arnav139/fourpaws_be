import express from "express";
import { animalController } from "../controllers";
import { authenticateUser, validateRequest } from "../middlewares";
import upload from "../middlewares/multer";
import { PetValidators } from "../validators/index";

const router = express.Router();

// router.get("/animalData",validateRequest(PetValidators.validateGetAnimalData),animalController.getAnimalData);

router.get("/allPets",authenticateUser,animalController.getAllPets);

router.get("/records",validateRequest(PetValidators.validateVaccinationRecord), animalController.VaccinationRecord);
router.get("/schedules",validateRequest(PetValidators.validateVaccinationSchedule), animalController.VaccinationSchedule);

router.post(
  "/new",
  authenticateUser,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "additionalImages", maxCount: 6 },
    { name: "veterinaryHealthCard", maxCount: 1 },
    { name: "vaccinationCard", maxCount: 1 },
    { name: "passport", maxCount: 1 },
    { name: "imageWithOwner", maxCount: 1 },
    {name: "ownerIdProof", maxCount: 1},
    { name: "sterilizationCard", maxCount: 1 },
  ]),
  validateRequest(PetValidators.validateCreateNewPet),
  animalController.createNewPet
);

  

export default router;
