# CRM Sales Management System — Setup Guide

This guide explains how to install and run the CRM Sales Management System locally.

## 1. Prerequisites

Install:

- Node.js 18+
- npm
- MongoDB or MongoDB Atlas
- Git

Check Node.js and npm:

```bash
node --version
npm --version
```

---

## 2. Clone the Repository

```bash
git clone [https Projectlink]
cd crm-sales-management-system
```

---

## 3. Backend Setup

Open Terminal 1:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Replace the placeholder values with your own MongoDB connection string and JWT secret.

### Start Backend

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### Development Mode

For automatic restart with Nodemon:

```bash
npm run dev
```

---

## 4. Frontend Setup

Open Terminal 2:

```bash
cd client
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Vite will display the frontend URL in the terminal.

Usually:

```text
http://localhost:5173
```

Open that URL in your browser.

---

## 5. Run Both Applications

Both the backend and frontend must be running.

### Terminal 1 — Backend

```bash
cd crm-sales-management-system/server
npm install
npm start
```

### Terminal 2 — Frontend

```bash
cd crm-sales-management-system/client
npm install
npm run dev
```

Then open the frontend URL displayed by Vite.

---

## 6. Create Admin User

The server provides an admin creation script.

From the `server` directory:

```bash
npm run create-admin
```

Follow the prompts/configuration provided by the script.

---

## 7. Frontend Commands

From the `client` directory:

### Start development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Run ESLint

```bash
npm run lint
```

---

## 8. Backend Commands

From the `server` directory:

### Start production/server process

```bash
npm start
```

### Development mode

```bash
npm run dev
```

### Create administrator

```bash
npm run create-admin
```

---

## 9. API Base URL

The frontend uses:

```text
http://localhost:5000/api
```

Main API modules:

```text
/auth
/users
/dashboard
/leads
/customers
/contacts
/deals
/activities
```

---

## 10. Environment Variables

Keep environment variables private.

Example `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Do not commit `.env` to GitHub.

---

## 11. Troubleshooting

### Backend does not start

Check that:

1. MongoDB is running or the MongoDB Atlas connection is available.
2. `server/.env` exists.
3. `MONGODB_URI` is correct.
4. `JWT_SECRET` is configured.
5. Port `5000` is available.

### Frontend cannot connect to backend

Check that the backend is running:

```text
http://localhost:5000
```

Then restart the frontend:

```bash
cd client
npm run dev
```

### Dependencies are missing

Run:

```bash
cd server
npm install
```

and in another terminal:

```bash
cd client
npm install
```

### Port already in use

Stop the process using the port or configure a different backend port and update the frontend API base URL accordingly.

---

## 12. Recommended Startup Order

For the easiest setup:

```text
1. Start MongoDB / MongoDB Atlas
        ↓
2. Start Express backend
        ↓
3. Start React/Vite frontend
        ↓
4. Open the Vite URL
        ↓
5. Log in and test the CRM
```

---

## 13. Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Redux Toolkit
- React Redux
- RTK Query
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Cookie Parser
- CORS
- dotenv

---

## 14. Project Structure

```text
crm-sales-management-system/
│
├── client/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── src/
│   ├── scripts/
│   ├── package.json
│   └── ...
│
├── .gitignore
├── README.md
└── SETUP.md
```

---

## 15. GitHub Repository

For more information about the project features and architecture, see `README.md`.
