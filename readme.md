# Sportzy

A real-time sports match management API with live commentary feed and WebSocket support. Built with Node.js, Express, PostgreSQL, and advanced security features.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod for schema validation
- **Real-time**: WebSocket (ws) for live updates
- **Security**: Arcjet for bot detection, rate limiting, and DDoS protection
- **Dev Tools**: Drizzle Kit for migrations, Nodemon for hot-reloading

## Core Features

- **Match Management**: Create, list, and manage sports matches with status tracking
- **Live Commentary**: Add and retrieve real-time commentary entries per match
- **Real-time Updates**: WebSocket subscriptions for instant match and commentary updates
- **Security**: Built-in bot detection, rate limiting (HTTP: 50 req/10s, WS: 5 req/2s), and DDoS protection
- **Status Tracking**: Automatic match status calculation (scheduled → live → finished)
- **Data Seeding**: Comprehensive seeding script for demo data with match expansion and randomization
- **CORS Support**: Configurable cross-origin resource sharing

## Database Schema

### Matches Table

- `id` (serial, primary key)
- `sport` (varchar, required) — e.g., "football", "cricket", "baseball"
- `homeTeam` (varchar, required)
- `awayTeam` (varchar, required)
- `status` (enum: "scheduled" | "live" | "finished", default: "scheduled")
- `startTime` (timestamp, required)
- `endTime` (timestamp)
- `homeScore` (integer, default: 0)
- `awayScore` (integer, default: 0)
- `createdAt` (timestamp, auto-generated)

### Commentary Table

- `id` (serial, primary key)
- `matchId` (integer, foreign key → matches.id, cascade delete)
- `minute` (integer, optional) — timestamp within the match
- `sequence` (integer, required) — ordering within inning/period
- `period` (varchar, optional) — e.g., "1st inning", "2nd half"
- `eventType` (varchar, required) — e.g., "goal", "wicket", "assist"
- `actor` (varchar, optional) — player/team performing action
- `team` (varchar, optional) — team associated with event
- `message` (text, required) — description of the event
- `metadata` (jsonb, optional) — additional event data
- `tags` (jsonb, optional) — array of tag strings
- `createdAt` (timestamp, auto-generated)

## API Endpoints

### Matches

#### `GET /matches`

List all matches with optional pagination.

**Query Parameters:**

- `limit` (number, 1-100, default: 50) — max matches to return

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "sport": "football",
      "homeTeam": "Team A",
      "awayTeam": "Team B",
      "status": "live",
      "startTime": "2026-02-02T10:00:00Z",
      "endTime": "2026-02-02T12:00:00Z",
      "homeScore": 2,
      "awayScore": 1,
      "createdAt": "2026-02-02T09:50:00Z"
    }
  ]
}
```

#### `POST /matches`

Create a new match.

**Request Body:**

```json
{
  "sport": "football",
  "homeTeam": "Team A",
  "awayTeam": "Team B",
  "startTime": "2026-02-02T10:00:00Z",
  "endTime": "2026-02-02T12:00:00Z",
  "homeScore": 0,
  "awayScore": 0
}
```

**Validation:**

- `sport`: non-empty string
- `homeTeam`: non-empty string
- `awayTeam`: non-empty string
- `startTime`: ISO datetime
- `endTime`: ISO datetime (must be after startTime)
- `homeScore`, `awayScore`: non-negative integers (optional)

**Response:** Returns created match object with auto-generated `id` and status
**Broadcasts:** Triggers `match_created` WebSocket event

#### `PATCH /matches/:id/score`

Update match score (WIP — not fully implemented).

**Request Body:**

```json
{
  "homeScore": 3,
  "awayScore": 2
}
```

### Commentary

#### `GET /matches/:id/commentary`

List commentary for a specific match.

**Parameters:**

- `:id` (number) — match ID

**Query Parameters:**

- `limit` (number, 1-100, default: 10) — max entries to return

**Response:**

```json
{
  "data": [
    {
      "id": 101,
      "matchId": 1,
      "minute": 45,
      "sequence": 5,
      "period": "2nd half",
      "eventType": "goal",
      "actor": "Player Name",
      "team": "Team A",
      "message": "Goal scored!",
      "metadata": { "xGoal": 0.85 },
      "tags": ["important", "highlight"],
      "createdAt": "2026-02-02T11:00:00Z"
    }
  ]
}
```

#### `POST /matches/:id/commentary`

Add commentary entry for a match.

**Parameters:**

- `:id` (number) — match ID

**Request Body:**

```json
{
  "minute": 45,
  "sequence": 5,
  "period": "2nd half",
  "eventType": "goal",
  "actor": "Player Name",
  "team": "Team A",
  "message": "Goal scored!",
  "metadata": { "xGoal": 0.85 },
  "tags": ["important", "highlight"]
}
```

**Validation:**

- `minute`: non-negative integer (optional)
- `sequence`: integer (optional)
- `period`: string (optional)
- `eventType`: string (optional)
- `actor`: string (optional)
- `team`: string (optional)
- `message`: non-empty string (required)
- `metadata`: object with string keys (optional)
- `tags`: array of strings (optional)

**Response:** Returns created commentary entry
**Broadcasts:** Triggers `commentary` WebSocket event for subscribed match

## WebSocket API

### Connection

**Endpoint:** `ws://[HOST]:[PORT]/ws`

- Example: `ws://localhost:8000/ws`

### Subscribe to Match Updates

```json
{
  "type": "subscribe",
  "matchId": 1
}
```

**Response:**

```json
{
  "type": "subscribed",
  "matchId": 1
}
```

### Unsubscribe from Match

```json
{
  "type": "unsubscribe",
  "matchId": 1
}
```

**Response:**

```json
{
  "type": "unsubscribed",
  "matchId": 1
}
```

### Broadcast Events

When subscribed to a match:

**Match Created** (`match_created`):

- Sent to all connected clients
- Payload: match object

**Commentary Added** (`commentary`):

- Sent to clients subscribed to that match ID
- Payload: commentary entry object

### WebSocket Errors

```json
{
  "type": "error",
  "message": "Invalid JSON"
}
```

## Security & Rate Limiting

Powered by **Arcjet**:

- **HTTP Protection**:
  - Shield: DDoS and basic attack protection
  - Bot Detection: Blocks malicious bots, allows search engines and previews
  - Rate Limiting: 50 requests per 10-second window per IP

- **WebSocket Protection**:
  - Shield: DDoS protection
  - Bot Detection: Same as HTTP
  - Rate Limiting: 5 requests per 2-second window per IP

## Environment Variables

### Required

- `DATABASE_URL` — PostgreSQL connection string (format: `postgresql://user:password@host:port/dbname`)
- `ARCJET_KEY` — Arcjet API key for security features

### Optional

- `HOST` — Server bind host (default: `0.0.0.0`)
- `PORT` — Server port (default: `8000`)
- `CORS_ORIGIN` — CORS origin URL (default: `http://localhost:3000`)
- `ARCJET_MODE` — Arcjet mode: `LIVE` or `DRY_RUN` (default: `LIVE`)

### Seed Script

- `API_URL` — Base API URL for seeding (required for seeding, e.g., `http://localhost:8000`)
- `DELAY_MS` — Delay in milliseconds between commentary inserts (default: `250`)
- `SEED_MATCH_DURATION_MINUTES` — Duration in minutes for generated matches (default: `120`)
- `SEED_FORCE_LIVE` — Force all matches to be live; set to `false` to allow non-live matches (default: `true`)

## Project Structure

```
.
├── src/
│   ├── index.js                    # Express app entry point
│   ├── arcjet.js                   # Arcjet security configuration
│   ├── config/
│   │   └── index.js                # Environment config loader
│   ├── db/
│   │   ├── db.js                   # Drizzle ORM client
│   │   └── schema.js               # Database schema definitions
│   ├── routes/
│   │   ├── matchRoute.js           # Matches API endpoints
│   │   └── commentaryRoute.js      # Commentary API endpoints
│   ├── validation/
│   │   ├── matches.js              # Match Zod schemas
│   │   └── commentary.js           # Commentary Zod schemas
│   ├── utils/
│   │   └── matchStatus.js          # Match status calculation utility
│   ├── ws/
│   │   └── server.js               # WebSocket server setup
│   ├── seed/
│   │   └── seed.js                 # Data seeding script
│   └── data/
│       └── data.json               # Sample seed data
├── drizzle/
│   ├── migrations/                 # Database migrations
│   └── meta/                       # Drizzle metadata
├── drizzle.config.js               # Drizzle configuration
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## Available Scripts

### `npm run dev`

Start development server with hot-reloading via Nodemon.

- Auto-restarts on file changes
- Loads environment variables from `.env`

### `npm run db:generate`

Generate Drizzle ORM artifacts (introspection, queries, types).

- Must run after schema changes
- Creates migration files in `drizzle/migrations/`

### `npm run db:migrate`

Apply pending database migrations.

- Safe to run multiple times (idempotent)
- Updates `_prisma_migrations` table for tracking

### `npm run db:test`

Test database connectivity.

- Verifies `DATABASE_URL` is valid
- Checks PostgreSQL connection

### `npm run seed`

Seed database with demo data via REST API.

- Requires running API server
- Reads from `src/data/data.json`
- Creates up to 20 matches by default
- Supports match expansion for multiple sports
- Randomizes commentary distribution

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone and install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**
   Create `.env` file in project root:

   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/sportzy
   ARCJET_KEY=your_arcjet_api_key
   HOST=0.0.0.0
   PORT=8000
   CORS_ORIGIN=http://localhost:3000
   API_URL=http://localhost:8000
   DELAY_MS=250
   SEED_MATCH_DURATION_MINUTES=120
   ```

3. **Initialize database:**

   ```bash
   npm run db:migrate
   ```

4. **Start development server:**

   ```bash
   npm run dev
   ```

5. **In another terminal, seed data:**
   ```bash
   npm run seed
   ```

### Testing the API

**Create a match:**

```bash
curl -X POST http://localhost:8000/matches \
  -H "Content-Type: application/json" \
  -d '{
    "sport": "football",
    "homeTeam": "Team A",
    "awayTeam": "Team B",
    "startTime": "2026-02-02T10:00:00Z",
    "endTime": "2026-02-02T12:00:00Z"
  }'
```

**Get matches:**

```bash
curl http://localhost:8000/matches?limit=10
```

**Subscribe to WebSocket:**

```bash
websocat ws://localhost:8000/ws
# Then send:
{"type": "subscribe", "matchId": 1}
```

## Seed Data Format

The seeding script expects `src/data/data.json` with one of these formats:

**Array format:**

```json
[
  { "message": "First event", "minute": 0, "matchId": 1 },
  { "message": "Second event", "minute": 45, "matchId": 1 }
]
```

**Object with commentary and matches:**

```json
{
  "commentary": [
    { "message": "First event", "minute": 0, "matchId": 1 },
    { "message": "Second event", "minute": 45, "matchId": 1 }
  ],
  "matches": [
    {
      "id": 1,
      "sport": "football",
      "homeTeam": "Team A",
      "awayTeam": "Team B",
      "startTime": "2026-02-02T10:00:00Z",
      "endTime": "2026-02-02T12:00:00Z"
    }
  ]
}
```

**Seed Script Features:**

- Automatically adjusts match times to be live (if `SEED_FORCE_LIVE=true`)
- Expands commentary for new matches by cloning and team-substitution
- Randomizes commentary order while respecting cricket innings structure
- Limits fetch to 20 matches by default
- Adds delays between inserts to simulate real-time activity

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` — Success
- `201` — Created
- `400` — Bad request (validation error)
- `403` — Forbidden (Arcjet blocked)
- `429` — Too many requests (rate limit)
- `500` — Server error
- `503` — Service unavailable (Arcjet error)

Error responses include details:

```json
{
  "error": "Invalid payload.",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "path": ["sport"],
      "message": "Expected string, received undefined"
    }
  ]
}
```

## Development Notes

- **Validation**: All inputs validated with Zod before database operations
- **Status Calculation**: Match status automatically determined based on current time vs. start/end times
- **Cricket Support**: Seed script includes special handling for cricket innings ordering
- **Cascade Deletes**: Deleting a match automatically removes all associated commentary
- **WebSocket Cleanup**: Socket disconnection properly cleans up all subscriptions
- **Rate Limiting**: Enforced per-IP; reset sliding window every interval
- **JSON Payload**: Max 1MB payload on WebSocket connections

## Future Enhancements

- Score update endpoints (currently commented out)
- Match status update endpoints
- Player/team statistics tracking
- Advanced filtering and search
- Authentication and authorization
- Event logging and audit trail
- Performance metrics dashboard
