import express from "express";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
// import { fileURLToPath } from "url";
import axios from "axios";

// const __filename = fileURLToPath((import.meta.url) as unknown as string);
// const __dirname = path.dirname(__filename);

export async function generatePetPdf({
  applicantName,
  guardianName,
  residentialAddress,
  contact,
  dogName,
  dogBreed,
  dogColor,
  dogAge,
  imageUrl,
}: {
  applicantName: string;
  guardianName: string;
  residentialAddress: string;
  contact: string;
  dogName: string;
  dogBreed: string;
  dogColor: string;
  dogAge: string;
  imageUrl: string;
}) {
  const pdfPath = path.join(__dirname, "../../assets/dogRegForm.pdf");
  const existingPdfBytes = fs.readFileSync(pdfPath);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const form = pdfDoc.getForm();

  const fields = form.getFields();
  fields.forEach((field) => {
    if (field.constructor.name === "PDFTextField") {
      console.log("Existing text field:", field.getName());
    }
  });

  // Set text fields
  form.getTextField("applicantName").setText(applicantName);
  form.getTextField("guardianName").setText(guardianName);
  form.getTextField("residentialAddress").setText(residentialAddress);
  form.getTextField("contact").setText(contact);
  form.getTextField("dogName").setText(dogName);
  form.getTextField("dogBreed").setText(dogBreed);
  form.getTextField("dogColor").setText(dogColor);
  form.getTextField("dogAge").setText(dogAge);

  const imageResponse = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });
  const imageBytes = Buffer.from(imageResponse.data);

  const image = await pdfDoc.embedJpg(imageBytes);

  const width = 80;
  const height = 80;

  const page = pdfDoc.getPages()[0];

  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  const x = pageWidth - width - 45;
  const y = pageHeight - height - 125;

  page.drawImage(image, {
    x: x,
    y: y,
    width: width,
    height: height,
  });

  return pdfDoc.save();
}
