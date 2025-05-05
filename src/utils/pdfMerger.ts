import fs from "fs";
import { PDFDocument } from "pdf-lib";
import PDFMerger from "pdf-merger-js";
import path from "path";

// Utility to download file from a URL
async function downloadFile(url: string) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  return { buffer, ext };
}

// Convert image buffer to a single-page PDF buffer
async function imageToPDF(imageBuffer) {
  const pdfDoc = await PDFDocument.create();
  const image =
    (await pdfDoc.embedJpg(imageBuffer).catch(() => null)) ||
    (await pdfDoc.embedPng(imageBuffer));

  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });

  return await pdfDoc.save();
}

export async function mergePDFs(files: string[]) {
  const merger = new PDFMerger();

  for (const url of files) {
    const { buffer, ext } = await downloadFile(url);

    if (ext === ".pdf") {
      // Save buffer temporarily
      const tempPath = `temp_${Date.now()}.pdf`;
      fs.writeFileSync(tempPath, buffer);
      await merger.add(tempPath);
      fs.unlinkSync(tempPath);
    } else if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      const pdfBuffer = await imageToPDF(buffer);
      const tempPath = `temp_image_${Date.now()}.pdf`;
      fs.writeFileSync(tempPath, pdfBuffer);
      await merger.add(tempPath);
      fs.unlinkSync(tempPath);
    }
  }
  const mergedBuffer = await merger.saveAsBuffer();
  return Buffer.from(mergedBuffer);
}
