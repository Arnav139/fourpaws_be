import express from "express"
import { authenticateUser } from "../middlewares";
import PaymentsController from "../controllers/paymentsController";

const router = express.Router();

router.post("/create-order", authenticateUser, PaymentsController.createOrder);

export default router;

