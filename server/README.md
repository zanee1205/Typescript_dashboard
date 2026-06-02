# Auth Backend Server

This server issues JWT access and refresh tokens backed by DummyJSON user data.

## Run locally

1. Install dependencies:
   npm install
2. Copy `.env.example` to `.env` and update values if needed.
3. Start the server:
   npm run dev

Endpoints:
- POST /auth/login
- POST /auth/refresh
- GET /auth/me
