// import fs from "fs";
// import { PDFDocument } from "pdf-lib";
// import path from "path";

// // Utility to download file from a URL
// async function downloadFile(url: string) {
//   const res = await fetch(url);
//   const arrayBuffer = await res.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   const ext = path.extname(new URL(url).pathname).toLowerCase();
//   return { buffer, ext };
// }

// // Convert image buffer to a single-page PDF buffer
// async function imageToPDF(imageBuffer: Buffer) {
//   const pdfDoc = await PDFDocument.create();
//   const image =
//     (await pdfDoc.embedJpg(imageBuffer).catch(() => null)) ||
//     (await pdfDoc.embedPng(imageBuffer));

//   const page = pdfDoc.addPage([image.width, image.height]);
//   page.drawImage(image, {
//     x: 0,
//     y: 0,
//     width: image.width,
//     height: image.height,
//   });

//   return await pdfDoc.save();
// }

// async function fetchPdfBuffer(url: string): Promise<Buffer> {
//   const response = await fetch(url);
//   const arrayBuffer = await response.arrayBuffer();
//   return Buffer.from(arrayBuffer);
// }

// // export async function imageToPDF(imageBuffer: Buffer): Promise<Buffer> {
// //   const pdfDoc = await PDFDocument.create();

// //   let image;
// //   try {
// //     image = await pdfDoc.embedJpg(imageBuffer);
// //   } catch {
// //     try {
// //       image = await pdfDoc.embedPng(imageBuffer);
// //     } catch (err) {
// //       throw new Error("Failed to embed image: Unsupported format or corrupted data.");
// //     }
// //   }

// //   const page = pdfDoc.addPage([image.width, image.height]);
// //   page.drawImage(image, {
// //     x: 0,
// //     y: 0,
// //     width: image.width,
// //     height: image.height,
// //   });

// //   const pdfBytes = await pdfDoc.save();
// //   return Buffer.from(pdfBytes);
// // }

// export async function mergePDFs(pdfUrls: string[]): Promise<Buffer> {
//   const mergedPdf = await PDFDocument.create();

//   for (const url of pdfUrls) {
//     const { buffer, ext } = await downloadFile(url);

//     let pdfBuffer: Buffer;
//     if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
//       const pdfBytes = await imageToPDF(buffer); // Convert image to PDF
//       pdfBuffer = Buffer.from(pdfBytes);
//     } else {
//       pdfBuffer = buffer;
//     }

//     const pdf = await PDFDocument.load(pdfBuffer); // Always load a valid PDF buffer
//     const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
//     copiedPages.forEach((page) => mergedPdf.addPage(page));
//   }

//   return Buffer.from(await mergedPdf.save());
// }

import { PDFDocument, PDFImage } from "pdf-lib";
import { Buffer } from "buffer"; // Node.js Buffer

// Interface for the input sources
export interface PdfSource {
  buffer: Buffer;
  // Provide the original mimetype to determine if it's an image or PDF
  mimetype: "application/pdf" | "image/jpeg" | "image/png" | string; // Allow other potential image/* types
}

/**
 * Merges multiple PDF documents, potentially converting source images to PDF first.
 * @param pdfSources An array of objects, each containing a Buffer and its original mimetype.
 * @returns A Promise resolving to a Buffer containing the merged PDF.
 */
export async function mergePDFsWithBuffers(
  pdfSources: PdfSource[],
): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const source of pdfSources) {
    let pdfBufferToLoad: Buffer;

    // Check if the source is an image that needs conversion
    if (source.mimetype.startsWith("image/")) {
      try {
        // Convert the image buffer to a single-page PDF buffer
        const pdfBytes = await imageBufferToPDF(source.buffer, source.mimetype);
        pdfBufferToLoad = Buffer.from(pdfBytes); // pdf-lib save returns Uint8Array
      } catch (conversionError) {
        console.error(
          `Failed to convert image buffer (mimetype: ${source.mimetype}) to PDF:`,
          conversionError,
        );
        // Decide how to handle: skip this source, throw error, etc.
        console.warn(`Skipping source due to image conversion error.`);
        continue; // Skip this source
      }
    } else if (source.mimetype === "application/pdf") {
      // It's already a PDF, use the buffer directly
      pdfBufferToLoad = source.buffer;
    } else {
      console.warn(
        `Skipping source with unsupported mimetype: ${source.mimetype}`,
      );
      continue; // Skip unsupported types
    }

    // Load the PDF buffer (either original or converted)
    try {
      const pdf = await PDFDocument.load(pdfBufferToLoad);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (pdfLoadError) {
      console.error(
        `Failed to load or copy pages from a PDF buffer (original type: ${source.mimetype}):`,
        pdfLoadError,
      );
      // Decide how to handle: skip, throw, etc.
      console.warn(`Skipping source due to PDF loading/copying error.`);
      continue; // Skip this source if loading fails
    }
  }

  // Save the merged document
  const mergedPdfBytes = await mergedPdf.save();
  return Buffer.from(mergedPdfBytes); // Convert Uint8Array to Buffer
}

/**
 * Converts an image buffer (JPEG or PNG) into a single-page PDF document.
 * @param imageBuffer The buffer containing the image data.
 * @param mimetype The mimetype of the image ('image/jpeg' or 'image/png').
 * @returns A Promise resolving to a Uint8Array containing the PDF bytes.
 * @throws Error if the mimetype is unsupported or embedding fails.
 */
async function imageBufferToPDF(
  imageBuffer: Buffer,
  mimetype: string,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let image: PDFImage;

  try {
    if (mimetype === "image/jpeg") {
      image = await pdfDoc.embedJpg(imageBuffer);
    } else if (mimetype === "image/png") {
      image = await pdfDoc.embedPng(imageBuffer);
    } else {
      throw new Error(
        `Unsupported image mimetype for PDF conversion: ${mimetype}`,
      );
    }
  } catch (embedError) {
    console.error(
      `Failed to embed image with mimetype ${mimetype}:`,
      embedError,
    );
    throw new Error(`Failed to embed image data for PDF conversion.`);
  }

  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });

  return await pdfDoc.save();
}

// The downloadFile function is no longer needed for this buffer-based workflow.
/*
async function downloadFile(url: string) {
  // ... (keep if needed elsewhere, but not by mergePDFsWithBuffers)
}
*/
