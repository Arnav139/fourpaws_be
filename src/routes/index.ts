import express, { Request, Response } from "express";
import user from "./mockUserRoutes";
import mockAnimalData from "./mockAnimalRoutes";
import marketPlaceData from "./marketPlaceroutes";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/user",
    route: user,
  },
  {
    path: "/animal",
    route: mockAnimalData,
  },
  {
    path: "/marketplace",
    route: marketPlaceData,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
