# MyWellness EMS & Asset Management System

A modern Employee Management System (EMS) and Asset Management platform built with Node.js, Express, MongoDB, and React. This project supports employee onboarding, asset tracking, license management, ticketing, integrations, and more.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Scripts](#scripts)
- [API Overview](#api-overview)
- [Frontend Overview](#frontend-overview)
- [Testing](#testing)
- [Logging & Audit](#logging--audit)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Employee onboarding & management
- Asset (hardware/software) management
- License management & assignment
- Ticketing system for support/issues
- Integration with external services (e.g., Microsoft Graph)
- Role-based access control (admin, manager, employee)
- Audit logs and activity tracking
- File uploads (documents, certificates, etc.)
- Responsive, modern UI with React & Tailwind CSS

---

## Project Structure

```
.
├── backend/
│   ├── app.js
│   ├── config.js
│   ├── index.js
│   ├── package.json
│   ├── .env
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── uploads/
│   └── logs/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   └── src/
├── .gitignore
└── README.md
```

---

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose, BullMQ, Nodemailer, Winston
- **Frontend:** React, Redux Toolkit, React Router, Tailwind CSS, Vite
- **Integrations:** Microsoft Graph API, others via integrations module
- **Authentication:** JWT, Microsoft SSO (planned/partial)
- **Dev Tools:** ESLint, Prettier, Morgan, dotenv

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+)
- MongoDB (local or Atlas)
- Redis (for BullMQ queues)
- [Optional] Microsoft Azure AD App (for Graph integration)

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` as needed.

#### Backend `.env` example:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ems
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_ID=your_azure_client_id
CLIENT_SECRET=your_azure_client_secret
TENANT_ID=your_azure_tenant_id
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
LOG_DIR=logs
```

#### Frontend `.env` example:

```
VITE_API_URL=http://localhost:5000/api/v1
```

### Installation

#### 1. Clone the repository

```sh
git clone https://github.com/your-org/ems.git
cd ems
```

#### 2. Install dependencies

```sh
cd backend
npm install

cd ../frontend
npm install
```

---

### Running the Application

#### 1. Start MongoDB and Redis

Make sure MongoDB and Redis are running locally or update `.env` for remote connections.

#### 2. Start Backend

```sh
cd backend
npm start
```

#### 3. Start Frontend

```sh
cd frontend
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

---

## Scripts

### Backend

- `npm start` — Start the Express server
- `npm run dev` — (If configured) Start with nodemon
- `npm test` — Run backend tests (if implemented)

### Frontend

- `npm run dev` — Start Vite dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Lint code

---

## API Overview

- RESTful endpoints under `/api/v1/`
- Auth: `/api/v1/auth`
- Employees: `/api/v1/employees`
- Assets: `/api/v1/hardware`, `/api/v1/software`
- Licenses: `/api/v1/licenses`
- Tickets: `/api/v1/tickets`
- Integrations: `/api/v1/integrations`
- See [backend/routes/](backend/routes/) for details.

---

## Frontend Overview

- React SPA with routing (`react-router-dom`)
- State management via Redux Toolkit
- UI components in [frontend/src/components/](frontend/src/components/)
- Pages in [frontend/src/pages/](frontend/src/pages/)
- Auth context in [frontend/src/auth/](frontend/src/auth/)
- Tailwind CSS for styling

---

## Testing

- **Backend:** Add tests in `backend/tests/` (not present by default).
- **Frontend:** Add tests in `frontend/src/__tests__/` (not present by default).
- Run `npm test` in each directory if tests are implemented.

---

## Logging & Audit

- Backend logs stored in `backend/logs/`
- Uses Winston with daily rotate and audit logs
- Audit logs for sensitive actions (see [backend/utils/logger.js](backend/utils/logger.js))

---

## Contributing

1. Fork the repo and create your branch (`git checkout -b feature/your-feature`)
2. Commit your changes (`git commit -am 'Add new feature'`)
3. Push to the branch (`git push origin feature/your-feature`)
4. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Contact

For questions or support, please contact the