import express from "express";
import { animalController } from "../controllers";
import { authenticateUser } from "../middlewares";
import upload from "../middlewares/multer";


const router = express.Router();

router.get("/animalData", animalController.getAnimalData);

router.get("/allPets", animalController.getAllPets);

router.get("/records", animalController.VaccinationRecord);
router.get("/schedules", animalController.VaccinationSchedule);

router.post(
    "/new",
    authenticateUser,
    upload.fields([
      { name: "image", maxCount: 1 },
      { name: "additionalImages", maxCount: 5 }, //adjust max count
    ]),
    animalController.createNewPet
  );
  

export default router;
