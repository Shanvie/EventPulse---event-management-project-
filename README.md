# EventPulse

EventPulse is a full-stack event management platform built with the MERN stack. It allows users to browse events, create bookings, manage check-ins, and view analytics for event operations.

## Features

- User registration and login
- Event creation and browsing
- Booking management
- QR-based check-in support
- Analytics dashboard
- Responsive frontend experience

## Tech Stack

- Frontend: React, Vite, React Router
- Backend: Node.js, Express.js, MongoDB/Mongoose
- Other: JWT authentication, QR code support

## Project Structure

- backend/ - Express API and database models
- frontend/ - React application
- start.js - Starts both backend and frontend together

## Getting Started

### 1. Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### 2. Run the app

From the project root:

```bash
node start.js
```

This starts:
- Backend server from the backend folder
- Frontend dev server from the frontend folder

### 3. Database note

If MongoDB is not running on localhost:27017, the backend will fall back to a local JSON-based database.

## GitHub Repository

https://github.com/Shanvie/EventPulse---event-management-project-.git
