import express from "express";
import { VaccinationRecord, VaccinationSchedule } from "../controllers/vaccinationData";
const router = express.Router();

router.get("/records", VaccinationRecord);
router.get("/schedules", VaccinationSchedule);

export default router;
