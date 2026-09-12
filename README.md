# Apple David Groomer

A full-stack pet grooming appointment management system consisting of a type-safe RESTful API backend (Hono, TypeScript, LowDB) and a React frontend (TanStack Start).

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [System](#system)
  - [Authentication](#authentication)
  - [Services](#services)
  - [Bookings](#bookings)
- [Database](#database)
- [Scripts](#scripts)
- [License](#license)

## Overview

The Apple David Groomer project provides endpoints for managing pet grooming appointments, checking groomer availability, listing catalog services with pricing, and validating API tokens. Data is persisted to a local JSON database via LowDB.

The project consists of a backend server, a shared types package, and a React frontend client.

## Features

- **Type-Safe Validation** — Request body and query parameters validated using Zod and `@hono/zod-validator`.
- **Bearer Token Authentication** — Secure endpoints requiring an `Authorization: Bearer <token>` header.
- **Availability & Conflict Checking** — Automated validation prevents double-booking for overlapping time slots and pets.
- **Pagination & Search Filtering** — Filter bookings by owner name, pet name, booking ID, and status.
- **Node.js HTTP Server** — Runs via `@hono/node-server` on port 3000.
- **React Frontend** — TanStack Start/React client with dashboard, booking forms, and search/filter UI.
- **Shared Types** — TypeScript types shared between client and server via the `@apple-david/shared-types` package.
- **Mock API Fallback** — Frontend gracefully falls back to mock data when the backend is unavailable.

## Project Structure

```
├── Apple-David-Groomer/         # React frontend (TanStack Start)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts           # API client (fetch + mock fallback)
│   │   │   └── mock-api.ts      # Mock data for offline/dev mode
│   │   ├── routes/              # TanStack Router routes
│   │   └── components/          # React components
│   ├── .env                     # Frontend env (API URL, token)
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── Apple-David-Groomer-backend/ # Core API server
│   ├── src/
│   │   ├── index.ts             # Server entry point & CORS configuration
│   │   ├── lib/
│   │   │   └── db.ts            # LowDB database layer & CRUD queries
│   │   ├── middleware/
│   │   │   └── auth.ts          # Bearer token validation middleware
│   │   ├── routes/
│   │   │   ├── auth.ts          # Auth verification endpoint
│   │   │   ├── bookings.ts      # Booking CRUD and availability endpoints
│   │   │   └── services.ts      # Grooming services catalog endpoint
│   │   └── types.ts             # Local API type definitions
│   ├── db.json                  # LowDB JSON database
│   ├── db.json.backup           # Seed data backup for resets
│   ├── package.json
│   ├── tsconfig.json
│   └── .gitignore
├── shared-types/                # Shared TypeScript models across client/server
│   ├── src/index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .gitignore
├── package.json                 # Root monorepo workspace definition
├── .env.example                 # Sample environment configuration
└── README.md
```

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher)

## Getting Started

### Installation

Clone the repository:

```bash
git clone https://github.com/Mcneil-official/Groom.git
cd Groom
```

Install dependencies for all workspace packages:

```bash
npm install
```

Install frontend dependencies:

```bash
cd Apple-David-Groomer
npm install
cd ..
```

### Configure Environment Variables

Backend:

```bash
cp .env.example .env
```

Frontend (already configured at `Apple-David-Groomer/.env`):

```bash
cd Apple-David-Groomer
ls .env
cd ..
```

### Start the Development Servers

Start the backend:

```bash
npm run dev
```

The backend will be available at http://localhost:3000.

Start the frontend:

```bash
cd Apple-David-Groomer
npm run dev
cd ..
```

The frontend will be available at http://localhost:3001.

### Run the Production Servers

Build the backend and shared types:

```bash
npm run build
```

Build the frontend:

```bash
cd Apple-David-Groomer
npm run build
cd ..
```

Run the backend:

```bash
npm run start
```

## Environment Variables

### Backend

Configure your environment in the root `.env`:

| Variable    | Description                                | Default                    |
| ----------- | ------------------------------------------ | -------------------------- |
| `API_TOKEN` | Bearer token required for authenticated API requests | `apple-david-dev-token-2026` |

### Frontend

Configure your environment in `Apple-David-Groomer/.env`:

| Variable          | Description                       | Default                          |
| ----------------- | --------------------------------- | -------------------------------- |
| `VITE_API_URL`    | Backend API base URL              | `http://localhost:3001/api`      |
| `VITE_API_TOKEN`  | Bearer token for API requests     | `apple-david-dev-token-2026`     |

## API Reference

All protected endpoints require the following request header:

```http
Authorization: Bearer <API_TOKEN>
```

### System

#### `GET /`

Returns an interactive HTML overview page of the API.

#### `GET /health`

Returns system status and current timestamp.

**Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2026-09-12T10:52:16.892Z"
}
```

### Authentication

#### `POST /api/auth/verify`

Validates an API token.

**Request Body:**

```json
{
  "token": "your-api-token"
}
```

**Response (200 OK):**

```json
{
  "data": {
    "valid": true
  }
}
```

### Services

#### `GET /api/services`

Retrieves all grooming services with pricing.

**Protected:** requires Bearer token.

**Response (200 OK):**

```json
{
  "data": [
    {
      "name": "Bath & Dry",
      "price": 250
    },
    {
      "name": "Basic Grooming",
      "price": 350
    },
    {
      "name": "Full Grooming",
      "price": 500
    },
    {
      "name": "Nail Trimming",
      "price": 150
    }
  ]
}
```

### Bookings

All booking endpoints are protected and require a Bearer token.

#### `GET /api/bookings`

List bookings with optional filtering and pagination.

**Query Parameters:**

| Parameter  | Type   | Description                                                              |
| ---------- | ------ | ------------------------------------------------------------------------ |
| `search`   | string | Search across owner name, pet name, or booking ID                      |
| `status`   | string | Filter by status: `Pending`, `Confirmed`, `Completed`, `Cancelled`, or `All` |
| `page`     | number | Page number (default: `1`)                                              |
| `pageSize` | number | Items per page, max `100` (default: `10`)                              |

**Response (200 OK):**

```json
{
  "data": {
    "data": [
      {
        "id": "BK-001",
        "ownerName": "Maria Santos",
        "petName": "Mochi",
        "petType": "Dog",
        "service": "Full Grooming",
        "date": "2026-09-15",
        "time": "10:00",
        "price": 500,
        "status": "Confirmed"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

#### `GET /api/bookings/:id`

Fetch a specific booking by ID.

**Response (200 OK):**

```json
{
  "data": {
    "id": "BK-001",
    "ownerName": "Maria Santos",
    "petName": "Mochi",
    "petType": "Dog",
    "service": "Full Grooming",
    "date": "2026-09-15",
    "time": "10:00",
    "price": 500,
    "status": "Confirmed"
  }
}
```

**Response (404 Not Found):**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking not found"
  }
}
```

#### `POST /api/bookings`

Create a new grooming booking. Automatically validates that the date and time slot do not conflict with existing bookings.

**Request Body:**

```json
{
  "ownerName": "John Doe",
  "petName": "Milo",
  "petType": "Dog",
  "service": "Basic Grooming",
  "date": "2026-09-18",
  "time": "10:30"
}
```

| Field       | Type   | Constraints                                                                 |
| ----------- | ------ | --------------------------------------------------------------------------- |
| `ownerName` | string | Required. Letters and spaces only.                                          |
| `petName`   | string | Required. Letters and spaces only.                                          |
| `petType`   | string | Required.                                                                   |
| `service`   | string | Required. Must match a known service name.                                  |
| `date`      | string | Required. Format `YYYY-MM-DD`. Cannot be in the past.                       |
| `time`      | string | Required. Format `HH:MM`.                                                   |
| `status`    | string | Optional. Defaults to `Pending`. One of: `Pending`, `Confirmed`, `Completed`, `Cancelled`. |

**Response (201 Created):**

```json
{
  "data": {
    "id": "BK-013",
    "ownerName": "John Doe",
    "petName": "Milo",
    "petType": "Dog",
    "service": "Basic Grooming",
    "date": "2026-09-18",
    "time": "10:30",
    "price": 350,
    "status": "Pending"
  }
}
```

**Response (409 Conflict - duplicate booking):**

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "This pet already has a booking at this date and time"
  }
}
```

#### `PATCH /api/bookings/:id`

Update an existing booking (status, date, time, service, etc.).

**Request Body:**

```json
{
  "status": "Confirmed"
}
```

**Response (200 OK):**

```json
{
  "data": {
    "id": "BK-001",
    "ownerName": "Maria Santos",
    "petName": "Mochi",
    "petType": "Dog",
    "service": "Full Grooming",
    "date": "2026-09-15",
    "time": "10:00",
    "price": 500,
    "status": "Confirmed"
  }
}
```

#### `DELETE /api/bookings/:id`

Remove a booking record.

**Response (200 OK):**

```json
{
  "data": null
}
```

## Database

The application uses LowDB with a flat-file JSON datastore located at:

```
Apple-David-Groomer-backend/db.json
```

A backup copy is provided in `Apple-David-Groomer-backend/db.json.backup` to restore initial seed data:

```bash
npm run --workspace=apple-david-groomer-backend db:reset
```

## Scripts

Run scripts from the repository root:

| Command                          | Description                                    |
| -------------------------------- | ---------------------------------------------- |
| `npm run dev`                    | Starts the backend server with live reload     |
| `npm run build`                  | Compiles TypeScript workspace packages to dist |
| `npm run start`                  | Runs the production build                      |
| `npm run lint`                   | Performs type checking with `tsc --noEmit`     |

## License

MIT
