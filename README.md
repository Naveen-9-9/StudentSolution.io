# StudentSolution.ai

A community-driven platform where students discover and share the best tools for solving common problems.

## Features

- User authentication (Google OAuth + email/password registration)
- Community-driven tool database with categories
- Upvote and rating system
- Comments and discussions
- Search and filtering capabilities
- RESTful API built with Node.js and Express

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: Passport.js (Google OAuth + JWT)
- **Validation**: Joi
- **Logging**: Pino
- **Testing**: Jest
- **Security**: Helmet, CORS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (free tier)
- Google Cloud Console account (for OAuth)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd studentsolution-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Fill in your actual values in `.env`:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
   - `JWT_SECRET`: A random string for JWT signing

4. Start the development server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:3000`

### API Endpoints

#### Health Check
- `GET /health` - Server health status
- `GET /` - Welcome message

#### Authentication (Phase 2)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout user

#### Tools (Phase 3)
- `GET /tools` - List all tools (with filtering, pagination, search)
- `GET /tools/popular` - Get popular tools
- `GET /tools/categories/:category` - Get tools by category
- `GET /tools/:id` - Get tool details
- `POST /tools` - Create new tool (authenticated)
- `PUT /tools/:id` - Update tool (owner only)
- `DELETE /tools/:id` - Delete tool (owner only)
- `POST /tools/:id/upvote` - Toggle upvote (authenticated)
- `GET /tools/:id/upvote-status` - Get upvote status (authenticated)

#### Ratings & Comments (Phase 4)
- `GET /comments/tools/:toolId` - Get comments for a tool (with replies)
- `POST /comments/tools/:toolId` - Add comment to tool (authenticated)
- `PUT /comments/:commentId` - Update comment (owner only)
- `DELETE /comments/:commentId` - Delete comment (owner only)
- `POST /comments/:commentId/upvote` - Upvote comment (authenticated)
- `GET /comments/:commentId/upvote-status` - Check comment upvote status

#### Search (Phase 5)
- `GET /search?q=<query>&category=<category>&tags=<tags>&sortBy=<relevant|popular|recent>&page=<page>&limit=<limit>` - Search tools with full-text search and filters
- `GET /search/suggest?q=<query>&limit=<limit>` - Get autocomplete suggestions
- `GET /search/categories` - Get all categories with tool counts

## Project Structure

```
studentsolution-ai/
├── apps/
│   ├── users/           # User management
│   │   ├── data-access/ # Database models
│   │   ├── domain/      # Business logic
│   │   └── entry-points/# API routes
│   ├── tools/           # Tool CRUD
│   ├── ratings/         # Upvotes & comments
│   └── search/          # Search functionality
│       ├── domain/      # Search business logic
│       └── entry-points/# Search API routes
├── libraries/           # Shared utilities
├── middleware/          # Express middleware
├── config/              # Configuration
├── tests/               # Test files
├── server.js            # Application entry point
├── .env.example         # Environment template
└── package.json         # Dependencies & scripts
```

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Testing

```bash
npm test
```

### API Testing

Use tools like Postman or curl to test the API endpoints. The server includes comprehensive error handling and logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

ISC

## Roadmap

- [x] Phase 1: Project setup & infrastructure
- [x] Phase 2: Authentication & user management
- [x] Phase 3: Tools database & CRUD
- [x] Phase 4: Ratings & comments system
- [x] Phase 5: Search & filtering
- [x] Phase 6: Error handling & validation
- [x] Phase 7: Testing & deployment prep

## Deployment

### Using Docker

The application is containerized and can be easily deployed using Docker and Docker Compose.

1. **Build and start the services:**
   ```bash
   docker-compose up -d --build
   ```

2. **Access the API:**
   The API will be available at `http://localhost:3000`.

3. **Stop the services:**
   ```bash
   docker-compose down
   ```

## Testing

Run the test suite using:
```bash
npm test
```