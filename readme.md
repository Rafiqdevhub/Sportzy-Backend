# Sportzy

Backend API for managing sports matches and live commentary.

## Tech Stack

- Node.js (ES Modules)
- Express
- Drizzle ORM
- Zod

## Available Routes

### Matches

- `GET /matches` — list matches (supports `limit`)
- `POST /matches` — create a match
- `PATCH /matches/:id/score` — update score for a live match

### Commentary

- `GET /matches/:id/commentary` — list commentary (supports `limit`)
- `POST /matches/:id/commentary` — create commentary entry

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Start the server:
   ```
   npm start
   ```

## Notes

- Commentaries are scoped to a match via `:id`.
- Validation is handled using Zod schemas in `src/validation`.
- Database access is via Drizzle in `src/db`.
