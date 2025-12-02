// api/fill-elterngeld.js
// Vercel Serverless Function to fill Elterngeld PDF

import { PDFDocument } from 'pdf-lib';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Validate required fields
    if (!data.childFirstName || !data.childLastName || !data.childBirthDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['childFirstName', 'childLastName', 'childBirthDate']
      });
    }

    // Download the blank PDF template
    const pdfUrl = 'https://fhh1.hamburg.de/Dibis/form/pdf/2025_Mantelbogen_Elterngeldantrag.pdf';
    const pdfResponse = await fetch(pdfUrl);

    if (!pdfResponse.ok) {
      throw new Error('Failed to fetch PDF template');
    }

    const pdfBytes = await pdfResponse.arrayBuffer();

    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Fill Section 1.a: Child's Name
    try {
      const firstNameField = form.getTextField('1a Vorname(n)');
      firstNameField.setText(data.childFirstName);
    } catch (e) {
      console.error('Could not fill first name field:', e.message);
    }

    try {
      const lastNameField = form.getTextField('1a Nachname');
      lastNameField.setText(data.childLastName);
    } catch (e) {
      console.error('Could not fill last name field:', e.message);
    }

    // Fill number of children if twins/triplets
    if (data.numberOfChildren && data.numberOfChildren > 1) {
      try {
        const numberOfChildrenField = form.getTextField('1a Anzahl der Kinder');
        numberOfChildrenField.setText(data.numberOfChildren.toString());
      } catch (e) {
        console.error('Could not fill number of children field:', e.message);
      }
    }

    // Fill Section 1.b: Birth Date
    try {
      const birthDateField = form.getTextField('1b Geburtsdatum Jahr');
      birthDateField.setText(data.childBirthDate);
    } catch (e) {
      console.error('Could not fill birth date field:', e.message);
    }

    // Handle premature birth checkbox
    if (data.isPremature) {
      try {
        const prematureCheckbox = form.getCheckBox('1b Frh geboren'); // Note: might be abbreviated
        prematureCheckbox.check();
      } catch (e) {
        console.error('Could not check premature checkbox:', e.message);
      }

      // Fill original due date if premature
      if (data.originalDueDate) {
        try {
          const dueDateField = form.getTextField('1b Errechneter Geburtstermin Jahr');
          dueDateField.setText(data.originalDueDate);
        } catch (e) {
          console.error('Could not fill due date field:', e.message);
        }
      }
    }

    // Handle disability checkbox
    if (data.hasDisability) {
      try {
        const disabilityCheckbox = form.getCheckBox('1b Behinderung');
        disabilityCheckbox.check();
      } catch (e) {
        console.error('Could not check disability checkbox:', e.message);
      }
    }

    // Option: Flatten the form (makes it non-editable)
    // Uncomment if you want the PDF to be read-only
    // form.flatten();

    // Save the filled PDF
    const filledPdfBytes = await pdfDoc.save();

    // Return the PDF as a downloadable file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="elterngeld-${Date.now()}.pdf"`);
    res.send(Buffer.from(filledPdfBytes));

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      error: 'Failed to generate PDF',
      message: error.message
    });
  }
}
