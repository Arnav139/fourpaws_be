import express from "express";
import {
  getAnimalData,
  getAllPets,
  VaccinationRecord,
  VaccinationSchedule
} from "../controllers/animalController";

const router = express.Router();

router.get("/animalData", getAnimalData);

router.get("/allPets", getAllPets);

router.get("/records", VaccinationRecord);
router.get("/schedules", VaccinationSchedule);

export default router;
