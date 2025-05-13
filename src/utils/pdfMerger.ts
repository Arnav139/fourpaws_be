// Optimized mergePDFs utility
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import path from "path";

async function downloadFile(url: string) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  return { buffer, ext };
}

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

export async function mergePDFs(pdfUrls: string[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  const pdfBuffers = await Promise.all(
    pdfUrls.map(async (url) => {
      const { buffer, ext } = await downloadFile(url);
      if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        const pdfBytes = await imageToPDF(buffer);
        return Buffer.from(pdfBytes);
      }
      return buffer;
    })
  );

  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return Buffer.from(await mergedPdf.save());
}
