import { z } from "zod";
import { Request, Response, NextFunction } from "express";


export default class userValidators {
  static validateGetUser = z.object({
        body : z.object({}).strict(),
        params: z.object({}).strict(),
        query: z.object({}).strict(),
  });

  static validateUpdateUser = z.object({
    body: z.object({
      name: z.string({required_error:"userName is required"}).optional(),
      bio: z.string({required_error:"bio is required"}).optional(),
    }).strict(),
  });
}
