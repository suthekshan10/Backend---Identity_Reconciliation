// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

// Initialize Express application
const app = express();
app.use(bodyParser.json());

// Connect to MySQL database using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database.');
});

// Helper function to retrieve matching contacts from the database
const getMatchingContacts = (email, phoneNumber) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM contacts 
      WHERE (email = ? OR phoneNumber = ?) AND deletedAt IS NULL;
    `;
    db.query(query, [email, phoneNumber], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Helper function to insert a new contact into the database
const insertContact = (email, phoneNumber, linkedId, linkPrecedence) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO contacts (email, phoneNumber, linkedId, linkPrecedence, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `;
    db.query(query, [email, phoneNumber, linkedId, linkPrecedence], (err, result) => {
      if (err) reject(err);
      else resolve(result.insertId); // Resolve with the inserted contact ID
    });
  });
};

// Helper function to update a contact's precedence in the database
const updateContactPrecedence = (id, linkPrecedence) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE contacts SET linkPrecedence = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?;
    `;
    db.query(query, [linkPrecedence, id], (err) => {
      if (err) reject(err);
      else resolve(); // Resolve once the update is successful
    });
  });
};

// Endpoint to identify a contact with input validation
app.post('/identify', [
  body('email').optional().isEmail(),
  body('phoneNumber').optional().isMobilePhone()
], async (req, res) => {
  // Validate inputs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Return validation errors if any
  }

  const { email, phoneNumber } = req.body;

  // Check if at least one of email or phoneNumber is provided
  if (!email && !phoneNumber) {
    return res.status(400).json({ message: 'Either email or phone number is required.' });
  }

  try {
    // If only email is provided, set phoneNumber to null
    const phoneNumberToUse = phoneNumber || null;
    // If only phone number is provided, set email to null
    const emailToUse = email || null;

    // Retrieve matching contacts from the database
    const matchingContacts = await getMatchingContacts(emailToUse, phoneNumberToUse);

    if (matchingContacts.length === 0) {
      // Create a new primary contact if no matches are found
      const newContactId = await insertContact(emailToUse, phoneNumberToUse, null, 'primary');
      return res.status(200).json({
        primaryContactId: newContactId,
        emails: emailToUse ? [emailToUse] : [],
        phoneNumbers: phoneNumberToUse ? [phoneNumberToUse] : [],
        secondaryContactIds: []
      });
    }

    // Determine the primary contact (prefer 'primary' link precedence, or oldest if none specified)
    let primaryContact = matchingContacts.find(c => c.linkPrecedence === 'primary');
    if (!primaryContact) {
      primaryContact = matchingContacts.reduce((oldest, current) =>
        new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest
      );
      await updateContactPrecedence(primaryContact.id, 'primary');
    }

    // Initialize sets for unique emails and phone numbers, and array for secondary contact IDs
    const secondaryIds = [];
    const emails = new Set();
    const phoneNumbers = new Set();

    // Populate sets and array from matching contacts
    for (const contact of matchingContacts) {
      if (contact.email) emails.add(contact.email);
      if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
      if (contact.id !== primaryContact.id) secondaryIds.push(contact.id);
    }

    // Add new secondary contact if new information is provided
    if ((emailToUse && !emails.has(emailToUse)) || (phoneNumberToUse && !phoneNumbers.has(phoneNumberToUse))) {
      const newSecondaryId = await insertContact(emailToUse, phoneNumberToUse, primaryContact.id, 'secondary');
      secondaryIds.push(newSecondaryId);
      if (emailToUse) emails.add(emailToUse);
      if (phoneNumberToUse) phoneNumbers.add(phoneNumberToUse);
    }

    // Return response with primary contact ID, unique emails and phone numbers, and secondary contact IDs
    res.status(200).json({
      primaryContactId: primaryContact.id,
      emails: Array.from(emails),
      phoneNumbers: Array.from(phoneNumbers),
      secondaryContactIds: secondaryIds
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' }); // Handle unexpected errors
  }
});

// Start the server and listen on specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
