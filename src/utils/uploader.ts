import cloudinary from "cloudinary";

// --- Cloudinary Upload Helper (Using upload_stream for Buffers) ---
export async function uploadToCloudinary(
  file: Express.Multer.File,
  folder: string,
  resourceType: "image" | "video" | "raw" | "auto" = "auto",
  publicId?: string,
): Promise<cloudinary.UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const format =
      resourceType === "raw" && file.mimetype === "application/pdf"
        ? "pdf"
        : undefined;

    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        public_id: publicId,
        format: format,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Cloudinary upload failed silently."));
        }
        resolve(result);
      },
    );
    uploadStream.end(file.buffer);
  });
}

// --- Upload Buffer Helper (for generated/merged PDFs) ---
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: "raw" | "image" | "auto" = "raw",
  publicId?: string,
  format?: string,
): Promise<cloudinary.UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        public_id: publicId,
        format: format,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Buffer Upload Error:", error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Cloudinary buffer upload failed silently."));
        }
        resolve(result);
      },
    );
    uploadStream.end(buffer);
  });
}
