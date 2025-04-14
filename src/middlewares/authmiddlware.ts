import jwt from "jsonwebtoken";
import { verifyJwt } from "../config/jwtConfig";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken =async (req: any, res: any, next: any) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
    const decoded = await verifyJwt(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error, "error in middleware");
    return res.status(401).json({
      success: false,
      message: "wrong token",
    });
  }
};
