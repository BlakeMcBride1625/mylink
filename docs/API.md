# API Documentation

## Overview

MY HUB uses a Node.js/Express backend that acts as a proxy for external APIs and handles authentication. All API endpoints are prefixed with `/api` or `/auth`.

## Base URL

- **Local Development**: `http://localhost:1600`
- **Production**: `https://developer.epildevconnect.uk/myhub`

## Authentication

### Discord OAuth2

The application uses Discord OAuth2 for user authentication via Passport.js.

#### Login

```http
GET /auth/discord
```

Redirects to Discord OAuth login page.

**Response**: Redirect to Discord authorization

#### Callback

```http
GET /auth/callback
```

OAuth callback endpoint. Automatically called by Discord after authorization.

**Response**: Redirect to home page with session established

#### Get Current User

```http
GET /auth/user
```

Returns the currently authenticated user.

**Response**:

```json
{
  "user": {
    "profile": {
      "id": "850726663289700373",
      "username": "epildev",
      "discriminator": "0",
      "avatar": "abc123...",
      "email": "user@example.com"
    },
    "accessToken": "..."
  }
}
```

Or if not authenticated:

```json
{
  "user": null
}
```

#### Logout

```http
POST /auth/logout
```

Logs out the current user and destroys the session.

**Response**:

```json
{
  "success": true
}
```

## External API Proxies

These endpoints proxy requests to external APIs to avoid CORS issues and keep API keys secure.

### Lanyard (Discord Presence)

```http
GET /api/lanyard/:userId
```

Fetches real-time Discord presence data for a user.

**Parameters**:

- `userId` (path): Discord user ID

**Example**:

```bash
curl http://localhost:1600/api/lanyard/850726663289700373
```

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "discord_user": {
      "id": "850726663289700373",
      "username": "epildev",
      "avatar": "...",
      "discriminator": "0"
    },
    "discord_status": "online",
    "activities": [
      {
        "type": 0,
        "name": "Visual Studio Code",
        "details": "Editing MyLink",
        "state": "Working on TypeScript"
      }
    ],
    "spotify": null,
    "listening_to_spotify": false
  }
}
```

**Error Response** (500):

```json
{
  "error": "Failed to fetch Lanyard data"
}
```

### Last.fm (Music Tracking)

```http
GET /api/lastfm/recent
```

Fetches the most recent track from Last.fm.

**Environment Variables Required**:

- `LASTFM_USERNAME`
- `LASTFM_API_KEY`

**Example**:

```bash
curl http://localhost:1600/api/lastfm/recent
```

**Success Response** (200):

```json
{
  "recenttracks": {
    "track": [
      {
        "name": "Collider",
        "artist": {
          "#text": "Noisia"
        },
        "album": {
          "#text": "Split the Atom"
        },
        "image": [
          {
            "size": "small",
            "#text": "https://..."
          },
          {
            "size": "medium",
            "#text": "https://..."
          },
          {
            "size": "large",
            "#text": "https://..."
          },
          {
            "size": "extralarge",
            "#text": "https://..."
          }
        ],
        "@attr": {
          "nowplaying": "true"
        }
      }
    ]
  }
}
```

**Error Response** (500):

```json
{
  "error": "Failed to fetch Last.fm data"
}
```

Or if credentials not configured:

```json
{
  "error": "Last.fm credentials not configured"
}
```

### WakaTime (Coding Stats)

```http
GET /api/wakatime/stats
```

Fetches coding statistics from WakaTime for the last 7 days.

**Environment Variables Required**:

- `WAKATIME_USERNAME`
- `WAKATIME_API_KEY`

**Example**:

```bash
curl http://localhost:1600/api/wakatime/stats \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Success Response** (200):

```json
{
  "data": {
    "human_readable_total": "8 hrs 42 mins",
    "human_readable_total_including_other_language": "9 hrs 15 mins",
    "languages": [
      {
        "name": "TypeScript",
        "total_seconds": 15480,
        "percent": 54.3,
        "text": "4 hrs 18 mins"
      },
      {
        "name": "JavaScript",
        "total_seconds": 8640,
        "percent": 30.2,
        "text": "2 hrs 24 mins"
      }
    ],
    "best_day": {
      "date": "2024-01-15",
      "text": "3 hrs 24 mins"
    },
    "projects": [
      {
        "name": "MyLink",
        "percent": 85.5,
        "text": "7 hrs 26 mins"
      }
    ]
  }
}
```

**Error Response** (500):

```json
{
  "error": "Failed to fetch WakaTime data"
}
```

## Contact Endpoints

### Send Discord Message (Authenticated)

```http
POST /api/contact/discord
```

Sends a message via Discord. Requires authentication.

**Headers**:

- `Content-Type: application/json`
- `Cookie: connect.sid=...` (session cookie)

**Request Body**:

```json
{
  "message": "Hello, I'd like to discuss a project..."
}
```

**Success Response** (200):

```json
{
  "success": true
}
```

**Error Responses**:

401 Unauthorized:

```json
{
  "error": "Not authenticated"
}
```

500 Internal Server Error:

```json
{
  "error": "Failed to send message"
}
```

### Send Email (Unauthenticated)

```http
POST /api/contact/email
```

Sends a contact form email. No authentication required.

**Headers**:

- `Content-Type: application/json`

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I'm interested in collaborating..."
}
```

**Success Response** (200):

```json
{
  "success": true
}
```

**Error Responses**:

400 Bad Request:

```json
{
  "error": "All fields are required"
}
```

500 Internal Server Error:

```json
{
  "error": "Failed to send email"
}
```

## Health Check

```http
GET /health
```

Simple health check endpoint to verify the server is running.

**Example**:

```bash
curl http://localhost:1600/health
```

**Response** (200):

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:34:56.789Z"
}
```

## Rate Limiting

Currently, there is no rate limiting implemented. Consider adding rate limiting in production using packages like:

- `express-rate-limit`
- `rate-limiter-flexible`

Example implementation:

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

## CORS Configuration

The backend is configured to accept requests from the frontend origin:

```javascript
app.use(
  cors({
    origin: `http://localhost:${process.env.FRONTEND_PORT || 1500}`,
    credentials: true,
  })
);
```

In production, update this to your production domain.

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message describing what went wrong"
}
```

HTTP status codes used:

- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `500` - Internal Server Error

## WebSocket Support

Currently not implemented, but can be added for real-time features:

```javascript
import { Server } from "socket.io";

const io = new Server(server, {
  cors: {
    origin: `http://localhost:${process.env.FRONTEND_PORT}`,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
```

## Client-Side Usage

### Using the API Utility

The frontend includes a utility file (`src/utils/api.ts`) with helper functions:

```typescript
import {
  fetchLanyardData,
  fetchLastFmData,
  fetchWakaTimeData,
  sendEmail,
  sendDiscordMessage,
} from "@/utils/api";

// Fetch data
const lanyardData = await fetchLanyardData("850726663289700373");
const musicData = await fetchLastFmData();
const codingStats = await fetchWakaTimeData();

// Send contact
await sendEmail("John", "john@example.com", "Hello!");
await sendDiscordMessage("Hi via Discord!");
```

### Using Polling Hook

For real-time updates:

```typescript
import { usePolling } from "@/utils/hooks";

function Component() {
  const { data, error, isLoading } = usePolling(
    () => fetchLanyardData("850726663289700373"),
    1000 // Update every second
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

## Security Considerations

1. **API Keys**: Never expose API keys in frontend code
2. **Session Secret**: Use a strong, random session secret
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: Validate all user inputs
5. **Rate Limiting**: Implement rate limiting for public endpoints
6. **CORS**: Restrict CORS to your specific domain
7. **SQL Injection**: Use parameterized queries if adding database
8. **XSS**: Sanitize user input before displaying

## Future Enhancements

Potential API improvements:

- [ ] GraphQL endpoint for more flexible queries
- [ ] WebSocket for real-time updates
- [ ] Rate limiting
- [ ] API versioning (`/api/v1/...`)
- [ ] Request caching with Redis
- [ ] API key authentication for third-party access
- [ ] Webhook endpoints for external services
- [ ] Admin API for content management

## Testing

### Manual Testing

Use curl or Postman to test endpoints:

```bash
# Test health
curl http://localhost:1600/health

# Test Lanyard
curl http://localhost:1600/api/lanyard/850726663289700373

# Test contact form
curl -X POST http://localhost:1600/api/contact/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello"}'
```

### Automated Testing

Consider adding tests with Jest or Mocha:

```javascript
describe("API Endpoints", () => {
  test("GET /health returns 200", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});
```

## Support

For API-related questions:

- Check this documentation
- Review `server/index.ts` source code
- Open a GitHub issue
- Contact @epildev on Discord
