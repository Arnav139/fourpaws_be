import express from "express";
import { animalController } from "../controllers";

const router = express.Router();

router.get("/animalData", animalController.getAnimalData);

router.get("/allPets", animalController.getAllPets);

router.get("/records", animalController.VaccinationRecord);
router.get("/schedules", animalController.VaccinationSchedule);

router.post("/pet", animalController.createNewPet)

export default router;
