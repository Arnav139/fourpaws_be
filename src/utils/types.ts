import { pets } from "../models/schema";


export type petType = typeof pets.$inferSelect;