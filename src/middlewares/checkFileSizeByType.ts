import { Request, Response, NextFunction } from "express";

export const checkFileSizeByType = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  const { mimetype, size } = req.file;

  const typeLimits: Record<string, number> = {
    "image/jpeg": 2 * 1024 * 1024,
    "image/png": 2 * 1024 * 1024,
    "image/gif": 2 * 1024 * 1024,
    "application/pdf": 5 * 1024 * 1024,
    "video/mp4": 16 * 1024 * 1024,
    "video/webm": 16 * 1024 * 1024,
    "video/quicktime": 16 * 1024 * 1024,
  };

  const maxAllowed = typeLimits[mimetype];

  if (maxAllowed && size > maxAllowed) {
    return res.status(413).json({ error: `File size exceeds limit for ${mimetype}` });
  }

  next();
};
