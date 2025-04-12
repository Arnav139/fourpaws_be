import express from "express";
import {
  getAnimalData,
  getAllPets,
  VaccinationRecord,
  VaccinationSchedule,
  createNewPet,
} from "../controllers/animalController";

const router = express.Router();

router.get("/animalData", getAnimalData);

router.get("/allPets", getAllPets);

router.get("/records", VaccinationRecord);
router.get("/schedules", VaccinationSchedule);

router.post("/pet", createNewPet)

export default router;
