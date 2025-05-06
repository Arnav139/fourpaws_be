import fs from "fs";
import { PDFDocument } from "pdf-lib";
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
async function imageToPDF(imageBuffer: Buffer) {
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

async function fetchPdfBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// export async function imageToPDF(imageBuffer: Buffer): Promise<Buffer> {
//   const pdfDoc = await PDFDocument.create();

//   let image;
//   try {
//     image = await pdfDoc.embedJpg(imageBuffer);
//   } catch {
//     try {
//       image = await pdfDoc.embedPng(imageBuffer);
//     } catch (err) {
//       throw new Error("Failed to embed image: Unsupported format or corrupted data.");
//     }
//   }

//   const page = pdfDoc.addPage([image.width, image.height]);
//   page.drawImage(image, {
//     x: 0,
//     y: 0,
//     width: image.width,
//     height: image.height,
//   });

//   const pdfBytes = await pdfDoc.save();
//   return Buffer.from(pdfBytes);
// }

export async function mergePDFs(pdfUrls: string[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const url of pdfUrls) {
    const { buffer, ext } = await downloadFile(url);

    let pdfBuffer: Buffer;
    if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
      const pdfBytes = await imageToPDF(buffer); // Convert image to PDF
      pdfBuffer = Buffer.from(pdfBytes);
    } else {
      pdfBuffer = buffer;
    }

    const pdf = await PDFDocument.load(pdfBuffer); // Always load a valid PDF buffer
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return Buffer.from(await mergedPdf.save());
}

