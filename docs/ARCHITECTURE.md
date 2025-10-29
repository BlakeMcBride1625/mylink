# MY HUB Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        MY HUB                                │
│                  Personal Dashboard System                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │◄────►│   Backend    │◄────►│ External APIs│
│   (React)    │ HTTP │  (Express)   │ HTTP │              │
│   Port 1500  │      │  Port 1600   │      │ Lanyard      │
│              │      │              │      │ Last.fm      │
│              │      │              │      │ WakaTime     │
└──────────────┘      └──────────────┘      └──────────────┘
       ▲                     ▲
       │                     │
       └─────────────────────┘
            WebSocket (Future)
```

## Frontend Architecture

```
src/
│
├── main.tsx                 # React entry point
├── App.tsx                  # Main app component, routing
├── index.css                # Global styles, Tailwind
│
├── components/              # Reusable UI components
│   ├── Layout.tsx          # Main layout wrapper
│   ├── Navigation.tsx      # Sidebar navigation
│   ├── SocialLinks.tsx     # Social media panel
│   ├── ParticleBackground.tsx  # WebGL particle system
│   ├── BootSequence.tsx    # Terminal animation
│   │
│   └── Dashboard Components
│       ├── DiscordPresence.tsx   # Live Discord status
│       ├── NowPlaying.tsx        # Last.fm integration
│       ├── WakaTimeStats.tsx     # Coding statistics
│       ├── ActivityFeed.tsx      # Combined feed
│       └── SystemUptime.tsx      # Uptime counter
│
├── sections/               # Page sections (routes)
│   ├── Home.tsx           # Real-time dashboard
│   ├── Projects.tsx       # Project showcase
│   ├── TechStack.tsx      # Technologies
│   ├── Experience.tsx     # Career timeline
│   ├── CodeViewer.tsx     # Code examples
│   └── Contact.tsx        # Contact form
│
└── utils/                 # Utilities & helpers
    ├── api.ts            # API client functions
    └── hooks.ts          # Custom React hooks
        ├── usePolling()
        ├── useIdleDetection()
        └── useUptime()
```

### Component Hierarchy

```
App
├── BootSequence (conditional)
└── Layout
    ├── ParticleBackground
    ├── Navigation
    ├── SocialLinks
    └── Routes
        ├── Home
        │   ├── SystemUptime
        │   ├── DiscordPresence
        │   ├── NowPlaying
        │   ├── WakaTimeStats
        │   └── ActivityFeed
        ├── Projects
        ├── TechStack
        ├── Experience
        ├── CodeViewer
        └── Contact
```

## Backend Architecture

```
server/
└── index.ts               # Express server
    │
    ├── Middleware
    │   ├── CORS
    │   ├── Express JSON
    │   ├── Session
    │   └── Passport
    │
    ├── Auth Routes
    │   ├── GET  /auth/discord
    │   ├── GET  /auth/callback
    │   ├── GET  /auth/user
    │   └── POST /auth/logout
    │
    ├── API Proxy Routes
    │   ├── GET /api/lanyard/:userId
    │   ├── GET /api/lastfm/recent
    │   └── GET /api/wakatime/stats
    │
    ├── Contact Routes
    │   ├── POST /api/contact/discord
    │   └── POST /api/contact/email
    │
    └── Utility Routes
        └── GET /health
```

### Request Flow

```
1. Client Request
   └─► Vite Proxy (dev) or Nginx (prod)
       └─► Express Server
           ├─► Session Check
           ├─► CORS Validation
           ├─► Route Handler
           │   ├─► External API Call (if needed)
           │   └─► Response Transform
           └─► JSON Response
```

## Data Flow

### Real-Time Updates (Polling)

```
┌─────────────┐
│   Home.tsx  │
└──────┬──────┘
       │
       │ usePolling(fetchFn, 1000ms)
       │
       ├─► fetchLanyardData()
       │   └─► GET /api/lanyard/:userId
       │       └─► https://api.lanyard.rest
       │
       ├─► fetchLastFmData()
       │   └─► GET /api/lastfm/recent
       │       └─► http://ws.audioscrobbler.com
       │
       └─► fetchWakaTimeData()
           └─► GET /api/wakatime/stats
               └─► https://wakatime.com/api
```

### Authentication Flow

```
1. User clicks "Login with Discord"
   │
   ├─► GET /auth/discord
   │   └─► Redirect to Discord OAuth
   │
2. User authorizes on Discord
   │
   ├─► Discord redirects to /auth/callback
   │   └─► Passport validates token
   │       └─► Create session
   │           └─► Redirect to /
   │
3. Subsequent requests include session cookie
   │
   └─► Backend validates session
       └─► Returns user data or null
```

### Contact Form Flow

```
User fills form
│
├─► Authenticated?
│   │
│   ├─► YES: POST /api/contact/discord
│   │   └─► Send via Discord (or email notification)
│   │
│   └─► NO: POST /api/contact/email
│       └─► Send via Nodemailer SMTP
│
└─► Success/Error response
    └─► UI feedback
```

## State Management

### Client State

```
React Component State (useState)
├── Local UI state (modals, forms, etc.)
├── Loading states
└── Error states

Custom Hooks
├── usePolling → API data cache
├── useIdleDetection → User activity
└── useUptime → Timer state
```

### Server State

```
Express Session
├── User authentication
├── OAuth tokens
└── Session data

No database (stateless)
└── All data from external APIs
```

## File Structure

```
MyLink/
│
├── Frontend Source
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── sections/      # Page sections
│   │   ├── utils/         # Utilities
│   │   ├── App.tsx        # Root component
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Global styles
│   │
│   └── public/            # Static assets
│
├── Backend Source
│   └── server/
│       └── index.ts       # Express server
│
├── Configuration
│   ├── package.json       # Dependencies
│   ├── tsconfig.json      # TypeScript config
│   ├── vite.config.ts     # Vite config
│   ├── tailwind.config.js # Tailwind theme
│   ├── .env.example       # Environment template
│   ├── .prettierrc        # Code formatting
│   └── .editorconfig      # Editor settings
│
├── Deployment
│   ├── Dockerfile         # Container image
│   ├── docker-compose.yml # Orchestration
│   └── .dockerignore      # Docker ignore
│
├── Documentation
│   ├── docs/
│   │   ├── SETUP.md       # Setup guide
│   │   ├── DEPLOYMENT.md  # Deploy guide
│   │   ├── API.md         # API docs
│   │   └── ARCHITECTURE.md # This file
│   │
│   ├── README.md          # Main docs
│   ├── QUICKSTART.md      # Quick start
│   ├── CONTRIBUTING.md    # Contributing
│   ├── CHANGELOG.md       # Version history
│   ├── PROJECT_SUMMARY.md # Project overview
│   └── LICENSE            # MIT License
│
├── Utilities
│   └── scripts/
│       ├── check-env.js   # Env validator
│       └── generate-session-secret.js
│
└── Development
    └── .vscode/
        ├── extensions.json
        └── settings.json
```

## Key Technologies

### Frontend Stack

```
React 18.3.1
└─► TypeScript 5.3.3
    └─► Vite 5.1.0
        ├─► Tailwind CSS 3.4.1
        ├─► Framer Motion 11.0.3
        ├─► Three.js 0.161.0
        ├─► React Router DOM 6.22.0
        └─► Axios 1.6.7
```

### Backend Stack

```
Node.js 20+
└─► Express 4.18.2
    ├─► Passport 0.7.0
    │   └─► passport-discord 0.1.4
    ├─► Nodemailer 6.9.9
    ├─► Express Session 1.18.0
    └─► CORS 2.8.5
```

## API Integration Points

### External APIs

```
Lanyard API
├─► Endpoint: https://api.lanyard.rest/v1/users/:id
├─► Rate Limit: Unlimited (websocket available)
├─► Auth: None required
└─► Update: Real-time via websocket or polling

Last.fm API
├─► Endpoint: http://ws.audioscrobbler.com/2.0/
├─► Rate Limit: 5 requests/second
├─► Auth: API Key
└─► Update: Poll every 1-5 seconds

WakaTime API
├─► Endpoint: https://wakatime.com/api/v1/
├─► Rate Limit: 10 requests/minute
├─► Auth: Bearer token
└─► Update: Poll every 5-60 seconds
```

## Security Architecture

```
Frontend Security
├── No API keys in client code
├── HTTPS only in production
├── CORS headers enforced
└── Input validation

Backend Security
├── API keys server-side only
├── Session-based auth
├── CORS whitelist
├── Input sanitization
└── Error handling (no leak)

Environment
├── .env not in git
├── Secrets in environment variables
└── Docker secrets support
```

## Deployment Architecture

### Development

```
Terminal 1: npm run dev:frontend
└─► Vite dev server (port 1500)
    └─► Hot Module Replacement
        └─► Proxies /api to backend

Terminal 2: npm run dev:backend
└─► tsx watch server/index.ts
    └─► Express server (port 1600)
        └─► Auto-restart on changes
```

### Production

```
Docker Container
├── Node.js runtime
├── Built frontend (dist/)
├── Backend source (server/)
└── Nginx reverse proxy
    ├─► /myhub → Frontend (static)
    ├─► /api → Backend (port 1600)
    └─► /auth → Backend (port 1600)

Cloudflare
├── DNS management
├── SSL/TLS termination
├── DDoS protection
└── CDN caching
```

## Performance Considerations

### Frontend Optimisations

- **Code Splitting**: React.lazy for routes
- **Bundle Size**: Tree-shaking with Vite
- **Images**: Lazy loading, optimised formats
- **Animations**: GPU-accelerated (transform, opacity)
- **Particles**: Adaptive count based on viewport

### Backend Optimisations

- **API Caching**: Response caching (future)
- **Connection Pooling**: HTTP keep-alive
- **Error Handling**: Fast failure paths
- **Compression**: Gzip/Brotli (nginx)

### Network Optimizations

- **HTTP/2**: Enabled in production
- **CDN**: Static assets via Cloudflare
- **Minification**: JS/CSS minified
- **Lazy Loading**: Components and images

## Monitoring & Logging

```
Application Logs
├── Frontend: Browser console
└── Backend: Console output
    └── Docker logs
        └── docker-compose logs

Health Checks
├── Backend: GET /health
└── Docker: Health check container

Future Monitoring
├── Sentry for errors
├── Google Analytics for usage
└── Custom metrics endpoint
```

## Scalability

### Current Scale

- Single server deployment
- Session in-memory
- No database
- Stateless backend

### Scale Considerations

```
Horizontal Scaling
├── Load balancer (nginx/HAProxy)
├── Multiple backend instances
├── Sticky sessions or Redis session store
└── CDN for static assets

Vertical Scaling
├── Increase container resources
├── Node.js cluster mode
└── Database for sessions/cache
```

## Future Enhancements

### Architecture Improvements

1. **WebSocket Integration**

   - Replace polling with real-time updates
   - Socket.io or native WebSocket
   - Fallback to polling

2. **Cache Layer**

   - Redis for API responses
   - Reduce external API calls
   - Session storage

3. **Database**

   - PostgreSQL for persistent data
   - User preferences
   - Analytics storage

4. **Message Queue**

   - RabbitMQ or Redis
   - Background jobs
   - Email queue

5. **GraphQL API**
   - Alternative to REST
   - Flexible queries
   - Real-time subscriptions

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Architecture**: Monorepo, Full-Stack, Real-Time
