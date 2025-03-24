# Backend---Identity_Reconciliation


This is a Node.js-based Contact Management API built with Express and MySQL. It allows creating, retrieving, and updating contacts based on email or phone number, ensuring robust data management and consistency.

## Features

- **Environment Configuration**: Securely manage database credentials using `.env` file.
- **Database Integration**: MySQL database for efficient contact storage and management.
- **Validation**: Input validation using `express-validator`.
- **Dynamic Precedence**: Assign and manage contact precedence (primary or secondary).
- **RESTful API**: Exposes `/identify` endpoint for easy integration.
- **Error Handling**: Handles unexpected errors gracefully.

## Prerequisites

- Node.js (v14 or later)
- MySQL database
- NPM (Node Package Manager)
- `.env` file with the following variables:
  ```plaintext
  DB_HOST=<your-database-host>
  DB_USER=<your-database-username>
  DB_PASS=<your-database-password>
  DB_NAME=<your-database-name>
  PORT=<port-number>

## Setup

1. **Clone the Repository**:
git clone [https://github.com/your-username/contact-identification-api.git](https://github.com/suthekshan10/Backend---Identity_Reconciliation.git)

text

2. **Install Dependencies**:
npm install

text

3. **Create a `.env` File**:
Add the following environment variables:
DB_HOST=localhost
DB_USER=your_username
DB_PASS=your_password
DB_NAME=your_database_name
PORT=3000

text

4. **Start the Server**:
npm start

text

## Endpoints

### POST /identify

- **Purpose**: Identify a contact based on email or phone number.
- **Request Body**:
- `email`: Optional email address.
- `phoneNumber`: Optional phone number.
- **Response**:
- `primaryContactId`: ID of the primary contact.
- `emails`: Array of associated email addresses.
- `phoneNumbers`: Array of associated phone numbers.
- `secondaryContactIds`: Array of IDs of secondary contacts.
