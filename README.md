# Quick Token Backend (Node.js + Express + MongoDB)

This is the **backend server** for the Quick Token Flutter app, built with **Node.js**, **Express**, and **MongoDB**.  
It provides APIs for managing **patients, appointments, and tokens** efficiently.

---

## Features

- **Patient Management**
  - Create and manage patient accounts
  - Store patient details securely

- **Token / Appointment Management**
  - Issue tokens for appointments
  - Track token status
  - View patient appointments

- **Product Management (Optional)**
  - Add and fetch products (if used in app)
  - Filter products by name, category, gender, and price

- **Static File Serving**
  - Serves files from `/uploads` (for images or documents)

- **CORS Enabled**
  - Allows requests from any origin

- **Server Health Check**
  - GET `/` returns `"Backend running successfully!"`

---

## Installation

### Prerequisites

- Node.js (>=14)  
- npm or yarn  
- MongoDB database  
- `.env` file with:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
