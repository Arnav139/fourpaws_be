import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Ensure environment variables are defined
const jwtSecret = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1h"; 

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// Interface for JWT payload (optional, for TypeScript)
interface JwtPayload {
  userId: string;
  email: string;
}

// Sign JWT
export const signJwt = (userId: number, email: string): string => {
  // Validate inputs
  if (!userId || !email) {
    throw new Error("userId and email are required");
  }

  try {
    const token = jwt.sign({ userId, email }, jwtSecret, {
      expiresIn: JWT_EXPIRES,
    });
    return token;
  } catch (error) {
    throw new Error(`Failed to sign JWT: ${error.message}`);
  }
};

// Verify JWT
export const verifyJwt = async (token: string): Promise<JwtPayload> => {
  if (!token) {
    throw new Error("Token is required");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error(`Unable to verify JWT: ${error.message}`);
  }
};