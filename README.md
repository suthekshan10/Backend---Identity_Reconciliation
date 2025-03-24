# Backend---Identity_Reconciliation


This is a Node.js-based Contact Management API built with **Express** and **MySQL**. It allows creating, retrieving, and updating contacts based on email or phone number while maintaining data consistency.

## Features

- **Environment Configuration**: Securely manage database credentials using a `.env` file.
- **Database Integration**: Uses MySQL for contact storage and management.
- **Input Validation**: Ensures valid input using `express-validator`.
- **Primary & Secondary Contacts**: Manages contact precedence dynamically.
- **RESTful API**: Provides an `/identify` endpoint for integration.
- **Error Handling**: Handles errors gracefully.

## Prerequisites

- **Node.js** (v14 or later)
- **MySQL Database**
- **NPM** (Node Package Manager)
- A `.env` file with database credentials.

## Project Structure

```
backend_identity_reconciliation/
│── .vscode/               # VS Code settings (if any)
│── node_modules/          # Installed dependencies
│── .env                   # Environment variables
│── package.json           # Project dependencies & scripts
│── package-lock.json      # Dependency lock file
│── server.js              # Main server file
```

## Setup Instructions

### 1. Clone the Repository

```sh
git clone <repository-url>
cd backend_identity_reconciliation
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add:

```plaintext
DB_HOST=localhost
DB_USER=your_username
DB_PASS=your_password
DB_NAME=your_database_name
PORT=3000
```

### 4. Start the Server

```sh
npm start
```

## API Documentation

### POST /identify
- **Purpose**: Identify a contact based on email or phone number.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "phoneNumber": "1234567890"
  }
  ```
- **Response**:
  ```json
  {
    "primaryContactId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
  ```

- **Errors**:
  - `400 Bad Request`: If both `email` and `phoneNumber` are missing.
  - `500 Internal Server Error`: If something goes wrong.

## Database Schema
Here is the SQL script to create the database and atble 

```sql
CREATE DATABASE IF NOT EXISTS contact_management;
USE contact_management;

CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NULL,
  phoneNumber VARCHAR(20) NULL,
  linkedId INT NULL,
  linkPrecedence ENUM('primary', 'secondary') NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP NULL
);
```


