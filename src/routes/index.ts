import express, { Request, Response } from "express";
import user from "./userRoutes";
import pets from "./petRoutes";
import marketPlace from "./marketPlaceroutes";
import feed from "./feedRoutes";
import auth from "./authRoutes"

const router = express.Router();

const defaultRoutes = [
  {
    path: "/user",
    route: user,
  },
  {
    path: "/pets",
    route: pets,
  },
  {
    path: "/marketplace",
    route: marketPlace,
  },
  {
    path : "/feed",
    route : feed
  },
  {
    path : "/auth",
    route : auth
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
