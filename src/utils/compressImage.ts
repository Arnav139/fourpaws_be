import sharp from "sharp";
import { Readable } from "stream";

interface CompressedImage {
  data: Readable;
  format: string;
  buffer: Buffer;
}

export const compressImageToUnder2MB = async (
  inputBuffer: Buffer,
  mimetype: string,
  maxSizeMB = 2,
  maxWidth = 1080,
  maxHeight = 1080
): Promise<CompressedImage> => {
  const format = mimetype.split("/")[1];
  let quality = 90;
  const targetSize = maxSizeMB * 1024 * 1024;
  let outputBuffer: Buffer;

  const sharpInstance = sharp(inputBuffer).resize({
    width: maxWidth,
    height: maxHeight,
    fit: "inside",
    withoutEnlargement: true,
  });

  do {
    if (format === "jpeg" || format === "jpg") {
      outputBuffer = await sharpInstance.clone().jpeg({
        quality,
        chromaSubsampling: "4:4:4",
        progressive: false,
      }).toBuffer();
    } else if (format === "png") {
      outputBuffer = await sharpInstance.clone().png({
        compressionLevel: Math.floor((100 - quality) / 10),
        progressive: false,
      }).toBuffer();
    } else if (format === "webp") {
      outputBuffer = await sharpInstance.clone().webp({
        quality,
      }).toBuffer();
    } else {
      throw new Error(`Unsupported image format: ${format}`);
    }

    if (outputBuffer.length <= targetSize || quality < 40) break;
    quality -= 10;
  } while (true);

  return {
    data: Readable.from([outputBuffer]),
    format,
    buffer: outputBuffer,
  };
};
