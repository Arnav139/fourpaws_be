import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";
import stream from "stream";
import { promisify } from "util";
import cloudinary from "../config/cloudinary";

ffmpeg.setFfmpegPath(ffmpegPath!); // ensure ffmpeg-static path is set

const pipeline = promisify(stream.pipeline);

export default class UploadController {
  static upload = async (req: any, res: any): Promise<any> => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file provided" });

      const file = req.file;
      const mimeType = file.mimetype;

      let uploadOptions: any = {};
      let fileBuffer: Buffer;

      if (mimeType.startsWith("image/")) {
        fileBuffer = await compressImage(file.buffer, mimeType);
        uploadOptions.resource_type = "image";
      } else if (mimeType.startsWith("video/")) {
        fileBuffer = await compressVideo(file.buffer, mimeType);
        uploadOptions.resource_type = "video";
      } else if (mimeType === "application/pdf") {
        fileBuffer = file.buffer; // no compression, just upload as-is
        uploadOptions.resource_type = "raw";
      } else {
        return res.status(400).json({ message: "Unsupported file type" });
      }

      const result: any = await new Promise((resolve, reject) => {
        const cloudStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        const bufferStream = stream.Readable.from(fileBuffer);
        bufferStream.pipe(cloudStream);
      });

      return res.status(200).json({
        status: true,
        message: "Upload successful",
        secureUrl: result.secure_url,
        publicId: result.public_id,
      });
    } catch (err: any) {
      console.error("Error uploading to Cloudinary:", err);
      return res.status(500).json({
        message: "Upload failed",
        error: err.message,
      });
    }
  };
}

// Helpers

async function compressImage(inputBuffer: Buffer, mimeType: string): Promise<Buffer> {
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  const width = metadata.width && metadata.width > 1200 ? 1200 : metadata.width;
  const height = metadata.height && metadata.height > 1200 ? 1200 : metadata.height;

  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return image
      .resize(width, height, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  if (mimeType === "image/png") {
    return image
      .resize(width, height, { fit: "inside", withoutEnlargement: true })
      .png({ quality: 80, compressionLevel: 6 })
      .toBuffer();
  }

  if (mimeType === "image/gif") {
    return image
      .resize(width, height, { fit: "inside" })
      .gif()
      .toBuffer();
  }

  throw new Error("Unsupported image format");
}

async function compressVideo(inputBuffer: Buffer, mimeType: string): Promise<Buffer> {
  const inputStream = stream.Readable.from(inputBuffer);
  const outputChunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    ffmpeg(inputStream)
      .videoCodec("libx264")
      .format("mp4")
      .on("error", (err) => reject(err))
      .on("end", () => resolve(Buffer.concat(outputChunks)))
      .pipe()
      .on("data", (chunk) => outputChunks.push(chunk));
  });
}
