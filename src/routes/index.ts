import express, {Request, Response}  from "express";
import path from "path";
import user from "./mockUserData";
import collectible from "./mockCollectibles";
import animalData from "./mockAnimalData";
import vaccinationRecord from "./mockVaccinationRecord";

const router = express.Router();

const defaultRoutes = [
    {
        path : "/user",
        route : user
    },
    {
         path : "/collectibles",
         route : collectible,
    },
    {
        path : "/animalData",
        route : animalData,
    },
    {
        path : "/vaccination",
        route : vaccinationRecord
    }
]

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;