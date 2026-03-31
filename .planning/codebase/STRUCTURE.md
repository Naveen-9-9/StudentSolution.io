# Structure

## Root Directory Layout

```
StudentSolutin.io/
├── app.js                    ← Express app setup (middleware, routes)
├── server.js                 ← Server entry point (DB connect, listen)
├── package.json              ← Backend dependencies
├── seed.js                   ← Database seeding script
├── .env                      ← Environment variables
├── .gitignore
├── Dockerfile                ← Backend Docker config
├── docker-compose.yml        ← Docker Compose orchestration
├── jest.config.js            ← Jest test configuration
├── README.md                 ← Project documentation
├── Untitled Diagram.drawio   ← Architecture diagram
│
├── apps/                     ← Feature modules (domain-driven)
│   ├── users/
│   │   ├── data-access/      ← Mongoose models
│   │   ├── domain/           ← Business logic services
│   │   └── entry-points/     ← Express route handlers
│   ├── tools/
│   │   ├── data-access/toolModel.js
│   │   ├── domain/toolService.js
│   │   └── entry-points/tools.js
│   ├── ratings/
│   │   ├── data-access/
│   │   ├── domain/
│   │   └── entry-points/
│   └── search/
│       ├── domain/
│       └── entry-points/     ← (No data-access — searches Tool model)
│
├── config/
│   └── database.js           ← MongoDB connection setup
│
├── middleware/
│   ├── errorHandler.js       ← Centralized error handling
│   ├── jwt.js                ← JWT token generation/verification
│   ├── passport.js           ← Auth strategies (local, Google, JWT)
│   ├── roles.js              ← Role-based authorization
│   └── validate.js           ← Joi validation middleware
│
├── libraries/
│   ├── errors.js             ← Custom error class hierarchy
│   └── logger.js             ← Pino logger setup
│
├── tests/
│   ├── setup.js              ← Jest setup (MongoMemoryServer)
│   ├── auth.test.js           ← Auth endpoint tests
│   ├── tools.test.js          ← Tool endpoint tests
│   └── search.test.js         ← Search endpoint tests
│
└── frontend/                 ← Next.js frontend application
    ├── package.json           ← Frontend dependencies
    ├── next.config.ts
    ├── tsconfig.json
    ├── components.json        ← shadcn UI config
    ├── eslint.config.mjs
    ├── postcss.config.mjs
    ├── .env.local             ← Frontend env vars
    ├── AGENTS.md
    │
    ├── public/                ← Static assets
    │
    └── src/
        ├── app/
        │   ├── layout.tsx     ← Root layout (AuthProvider)
        │   ├── page.tsx       ← Home page
        │   ├── globals.css    ← Global styles (Tailwind)
        │   ├── auth/          ← Auth pages (login, register)
        │   ├── dashboard/     ← User dashboard
        │   ├── search/        ← Search results page
        │   └── tools/         ← Tool detail pages
        ├── components/
        │   ├── SearchBar.tsx  ← Search bar component
        │   └── ui/            ← shadcn UI components
        ├── context/
        │   └── AuthContext.tsx ← Auth state provider
        └── lib/
            ├── api.ts         ← API client wrapper
            ├── types.ts       ← TypeScript interfaces
            └── utils.ts       ← Utility functions
```

## Key Locations

| What | Where |
|------|-------|
| Server entry | `server.js` |
| Express app config | `app.js` |
| API routes | `apps/{feature}/entry-points/` |
| Business logic | `apps/{feature}/domain/` |
| DB models | `apps/{feature}/data-access/` |
| Auth middleware | `middleware/jwt.js`, `middleware/passport.js` |
| Frontend pages | `frontend/src/app/` |
| Frontend components | `frontend/src/components/` |
| Frontend API client | `frontend/src/lib/api.ts` |
| Tests | `tests/` |
| Environment config | `.env` (backend), `frontend/.env.local` (frontend) |

## Naming Conventions

- **Backend files:** `camelCase.js` (e.g., `toolService.js`, `toolModel.js`)
- **Frontend files:** `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **Route files:** Named after the feature (e.g., `tools.js`, `auth.js`)
- **Models:** Singular PascalCase (e.g., `Tool`, `User`, `Comment`)
- **Services:** `{Feature}Service` class pattern (singleton export)
- **Directories:** `kebab-case` (e.g., `data-access`, `entry-points`)
