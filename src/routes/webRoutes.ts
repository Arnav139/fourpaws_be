import express from "express"
import { animalController } from "../controllers";

const router = express.Router();

router.get("/allPets", animalController.getAllPetsWeb)

export default router;