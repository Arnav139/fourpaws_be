import express from "express";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import axios from "axios";

export async function generatePetPdf({
  applicantName = "",
  guardianName = "",
  residentialAddress = "",
  contact = "",
  dogName = "",
  dogBreed = "",
  dogColor = "",
  dogAge = "",
  imageUrl = "",
  vaccinationCard = "",
  sterilizaed = "",
}): Promise<Buffer> {
  try {
    // Validate inputs
    if (!dogName || !dogBreed) {
      throw new Error("Dog name and breed are required for PDF generation");
    }

    // Define PDF path with fallback
    const pdfPath = path.join(__dirname, "../../assets/dogRegForm.pdf");
    let existingPdfBytes: Buffer;

    try {
      existingPdfBytes = fs.readFileSync(pdfPath);
    } catch (error) {
      console.error(`Error reading PDF template at ${pdfPath}:`, error);
      throw new Error("Failed to load PDF template");
    }

    // Load PDF document
    let pdfDoc: PDFDocument;
    try {
      pdfDoc = await PDFDocument.load(existingPdfBytes);
    } catch (error) {
      console.error("Error loading PDF document:", error);
      throw new Error("Invalid PDF template");
    }

    // Get form
    const form = pdfDoc.getForm();
    if (!form) {
      throw new Error("PDF form not found");
    }

    // Log available fields for debugging
    const fields = form.getFields();
    const fieldNames = fields.map((field) => field.getName());
    console.debug("Available PDF fields:", fieldNames);

    // Set text fields with fallback
    const setTextField = (fieldName: string, value: string) => {
      try {
        const field = form.getTextField(fieldName);
        field.setText(value || "");
      } catch (error) {
        console.warn(`Field ${fieldName} not found or error setting value:`, error);
      }
    };

    setTextField("applicantName", applicantName);
    setTextField("guardianName", guardianName);
    setTextField("residentialAddress", residentialAddress);
    setTextField("contact", contact);
    setTextField("dogName", dogName);
    setTextField("dogBreed", dogBreed);
    setTextField("dogColor", dogColor);
    setTextField("dogAge", dogAge);
    setTextField("vaccinationCard", vaccinationCard);
    setTextField("sterilized", sterilizaed);
    setTextField("applicantNameAffidavit", applicantName);
    setTextField("s/w-o", guardianName);
    setTextField("addressAffidavit", residentialAddress);


    // Handle image
    if (imageUrl) {
      try {
        const imageResponse = await axios.get(imageUrl, {
          responseType: "arraybuffer",
          timeout: 5000,
        });
        const imageBytes = Buffer.from(imageResponse.data);

        let image;
        try {
          image = await pdfDoc.embedJpg(imageBytes);
        } catch (error) {
          console.warn("Failed to embed JPG, trying PNG:", error);
          image = await pdfDoc.embedPng(imageBytes);
        }

        const page = pdfDoc.getPages()[0];
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();
        const width = 80;
        const height = 80;
        const x = pageWidth - width - 45;
        const y = pageHeight - height - 125;

        page.drawImage(image, { x, y, width, height });
      } catch (error) {
        console.warn("Failed to embed image in PDF:", error);
      }
    }

    // Flatten the form to make fields non-editable
    form.flatten();

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("Error generating pet PDF:", error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}
