import express from "express";
import user from "./userRoutes";
import pets from "./petRoutes";
import marketplace from "./marketplaceRoutes";
import feed from "./feedRoutes";
import auth from "./authRoutes";
import uploads from "./uploadsRoutes";
import web from "./webRoutes";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/user",
    route: user,
  },
  {
    path: "/web",
    route: web,
  },
  {
    path: "/pets",
    route: pets,
  },
  {
    path: "/marketplace",
    route: marketplace,
  },
  {
    path: "/feed",
    route: feed,
  },
  {
    path: "/auth",
    route: auth,
  },
  {
    path: "/uploads",
    route: uploads,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
