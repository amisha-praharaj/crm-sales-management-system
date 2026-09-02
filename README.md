# CRM Sales Management System

A full-stack CRM Sales Management System built using the MERN stack to manage leads, customers, contacts, deals, sales activities, and the sales pipeline.

## Project Overview

The application provides a complete CRM workflow:

```text
Lead
  ↓
Qualification
  ↓
Customer
  ↓
Contact
  ↓
Deal
  ↓
Sales Pipeline
  ↓
Negotiation
  ↓
Closed Won / Closed Lost
```

The system includes authentication, role-based access control, CRUD operations, lead conversion, record assignment, deal pipeline management, activity tracking, dashboard analytics, search, filtering, pagination, and Redux Toolkit / RTK Query setup.

---

## Features

### Authentication & Authorization

- User login and logout
- Protected routes
- Authentication middleware
- Role-based access control
- Backend authorization
- User status management
- Cookie-based authentication

### Supported Roles

- `ADMIN`
- `SALES_MANAGER`
- `SALES_EXECUTIVE`

---

## Lead Management

- Create leads
- View leads
- Update leads
- Delete leads
- Search leads
- Filter leads
- Assign leads
- Lead status management
- Lead source management
- Lead conversion
- Notes management

### Lead Statuses

```text
New
Contacted
Qualified
Proposal
Converted
Lost
```

### Lead Sources

```text
Website
Referral
Social Media
Advertisement
Cold Call
Other
```

---

## Lead Conversion

Qualified leads can be converted into customers.

```text
New Lead
   ↓
Contacted
   ↓
Qualified
   ↓
Converted
   ↓
Customer
```

The converted customer is linked with the original lead.

---

## Customer Management

- Create customers
- View customers
- Update customers
- Delete customers
- Assign customers
- Search customers
- Customer information management

---

## Contact Management

Contacts can be associated with customers or leads.

### Contact Information

- Name
- Email
- Phone
- Job Title
- Department
- Company
- Customer
- Lead
- Assigned User
- Notes
- Active/Inactive status

### Contact Operations

- Create contacts
- View contacts
- Update contacts
- Delete contacts
- Search contacts
- Filter contacts
- Assign contacts

---

## Deal Management

- Create deals
- View deals
- Update deals
- Delete deals
- Assign deals
- Search deals
- Filter deals
- Track deal value
- Expected close date
- Probability tracking
- Expected revenue
- Deal notes

### Sales Pipeline

```text
Prospecting
     ↓
Qualification
     ↓
Proposal
     ↓
Negotiation
     ↓
Closed Won

or

Closed Lost
```

The backend enforces business rules for closed deals. Once a deal reaches `Closed Won` or `Closed Lost`, invalid stage changes are rejected by the backend.

---

## Deal Stage History

The system maintains deal stage history.

Example:

```text
Prospecting
    ↓
Qualification
    ↓
Negotiation
    ↓
Closed Won
```

Stage history records:

- Previous stage
- New stage
- User who changed the stage
- Timestamp
- Change note

---

## Activities

The CRM supports sales activities such as:

- Calls
- Meetings
- Emails
- Follow-ups
- Demos
- Reminders

### Activity Status

```text
Pending
Completed
Cancelled
```

The system also tracks overdue and upcoming activities.

### Activity Features

- Create activity
- View activity
- Update activity
- Delete activity
- Assign activity
- Due date
- Customer association
- Deal association
- Lead association
- Activity status management

---

## Dashboard

The dashboard provides an overview of CRM and sales performance.

### Dashboard Metrics

- Total Leads
- Total Customers
- Total Deals
- Converted Leads
- Lead Conversion Rate
- Pipeline Value
- Active Pipeline Value
- Expected Revenue
- Won Value
- Won Count
- Lost Value
- Lost Count
- Win Rate
- Pending Activities
- Completed Activities
- Cancelled Activities
- Overdue Activities
- Recent Activities
- Upcoming Activities

---

## Search, Filtering & Pagination

The backend supports server-side:

- Search
- Filtering
- Pagination
- Sorting
- Assignment filtering
- Stage filtering
- Status filtering

---

## Role-Based Access Control

### ADMIN

Admins can:

- Manage users
- Manage leads
- Manage customers
- Manage contacts
- Manage deals
- Assign records
- Delete records
- Access dashboard information

### SALES_MANAGER

Sales Managers can:

- Manage sales records
- Manage leads
- Manage customers
- Manage contacts
- Manage deals
- Assign records to Sales Executives
- Monitor the sales pipeline

### SALES_EXECUTIVE

Sales Executives can:

- View assigned records
- Manage assigned leads
- Manage assigned customers
- Manage assigned contacts
- Manage assigned deals
- Update assigned records
- Manage assigned activities

Backend authorization prevents Sales Executives from accessing unauthorized records.

---

## State Management

Redux Toolkit has been integrated into the frontend architecture.

The project also includes an RTK Query API layer for centralized server-state management.

### Redux Store

The Redux store is configured using:

- `@reduxjs/toolkit`
- `react-redux`

The application is wrapped with the Redux Provider.

### RTK Query

The project includes an RTK Query API layer using:

- `createApi`
- `fetchBaseQuery`

The API layer provides a centralized foundation for server-state management and cache/tag management.

### Global / Server State

Appropriate server data includes:

```text
Users
Leads
Customers
Deals
Activities
Contacts
Dashboard data
```

### Local Component State

Temporary UI state remains local to components, such as:

```text
Form values
Modal visibility
Selected record
Search input
Confirmation dialogs
Temporary UI state
```

---

## Technology Stack

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- Lucide React
- Redux Toolkit
- React Redux
- RTK Query

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

### Development Tools

- Git
- GitHub
- Postman
- Visual Studio Code
- Nodemon

---

## Project Structure

```text
crm-sales-management-system/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── leads/
│   │   │   ├── customers/
│   │   │   ├── deals/
│   │   │   ├── activities/
│   │   │   └── contacts/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   ├── api/
│   │   │   │   └── apiSlice.js
│   │   │   └── store.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── scripts/
│   │   └── createAdmin.js
│   ├── package.json
│   └── ...
│
├── .gitignore
├── README.md
└── ...
```

---

# Installation & Setup

## Prerequisites

Install the following before running the project:

- Node.js 18+
- npm
- MongoDB or MongoDB Atlas
- Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/abhijit9864/crm-sales-management-system.git
cd crm-sales-management-system
```

---

## 2. Start the Backend

Open a terminal:

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

Use your own MongoDB connection string and JWT secret.

### Start the backend

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### Development mode

For automatic restart during development:

```bash
npm run dev
```

---

## 3. Start the Frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Vite will display the frontend URL in the terminal.

Usually:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

---

## 4. Frontend Commands

### Development

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## 5. Create Admin User

From the `server` directory:

```bash
npm run create-admin
```

Follow the script configuration/prompts to create an administrator account.

---

## API Base URL

The frontend communicates with the backend through:

```text
http://localhost:5000/api
```

---

## Main API Modules

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

The API uses standard REST operations:

```text
GET
POST
PATCH
DELETE
```

Additional endpoints support:

- Lead assignment
- Lead conversion
- Customer assignment
- Deal assignment
- Contact assignment
- User status management

---

## CRM Workflow

```text
                    ┌───────────────┐
                    │     Login     │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │     Leads     │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Qualification │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Lead Conversion│
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Customers   │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Contacts    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │     Deals     │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Sales Pipeline│
                    └───────┬───────┘
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
          ┌─────────────┐       ┌─────────────┐
          │ Closed Won  │       │ Closed Lost │
          └─────────────┘       └─────────────┘
```

---

## Testing & Validation

Major CRM workflows tested during development include:

- User authentication
- Role-based authorization
- Lead creation
- Lead update
- Lead assignment
- Lead conversion
- Customer creation
- Customer update
- Contact creation
- Contact update
- Deal creation
- Deal assignment
- Deal stage updates
- Deal stage history
- Closed-deal validation
- Activity creation
- Dashboard statistics
- Search
- Filtering
- Pagination
- API error handling

---

## Backend Validation & Security

The backend performs validation and authorization independently of the frontend.

Implemented protections include:

- Authentication middleware
- Role-based authorization
- Record ownership/assignment checks
- Mongoose validation
- Required-field validation
- Email validation
- Assignment validation
- Customer existence validation
- Lead existence validation
- Assigned-user validation
- Inactive-user assignment prevention
- Closed-deal stage validation
- HTTP status-based error handling

Sensitive environment variables must remain in `.env` and should not be committed to GitHub.

---

## Example Deal Pipeline

```text
Prospecting
    ↓
Qualification
    ↓
Negotiation
    ↓
Closed Won
```

A deal can also end as:

```text
Closed Lost
```

Once a deal is closed, the backend prevents invalid stage changes.

---

## Example Dashboard Metrics

```text
Total Leads
Total Customers
Total Deals
Converted Leads
Conversion Rate
Pipeline Value
Expected Revenue
Won Value
Won Count
Lost Value
Lost Count
Win Rate
Pending Activities
Completed Activities
Cancelled Activities
Overdue Activities
```

---

## Environment Variables

Do not commit sensitive environment variables to GitHub.

Example server `.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

The `.env` file should remain local.

---

## Important: Running Both Applications

The backend and frontend must both be running.

### Terminal 1 — Backend

```bash
cd server
npm install
npm start
```

### Terminal 2 — Frontend

```bash
cd client
npm install
npm run dev
```

Then open the frontend URL shown by Vite.

---

## Future Enhancements

Possible future improvements include:

- Automated unit and integration tests
- Real-time notifications
- Socket.IO integration
- Email reminders
- File attachments
- CSV/Excel import and export
- Advanced sales reports
- Redis caching
- Docker support
- CI/CD pipeline
- Production deployment
- Advanced analytics

---

## Author

**Amisha Praharaj**

Full Stack Developer

GitHub:  
https://github.com/amisha-praharaj

Repository:  
https://github.com/amisha-praharaj/crm-sales-management-system

---

## Assignment

This project was developed as part of a Full Stack Developer technical assessment.

The project demonstrates practical implementation of:

- MERN stack development
- REST API development
- Authentication
- Role-Based Access Control
- MongoDB and Mongoose
- React frontend development
- Redux Toolkit
- RTK Query architecture
- CRUD operations
- Business logic
- API validation
- Sales pipeline management
- Dashboard analytics
- Full-stack application architecture
