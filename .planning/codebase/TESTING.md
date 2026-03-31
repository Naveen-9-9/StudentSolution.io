# Testing

## Framework

- **Jest** `^30.3.0` — Test runner
- **Supertest** `^7.2.2` — HTTP request testing
- **mongodb-memory-server** `^11.0.1` — In-memory MongoDB for isolated tests

## Configuration

- **Config file:** `jest.config.js`
- **Setup file:** `tests/setup.js`
- **Run:** `npm test` or `npm run test:watch`

## Test Setup Pattern

```javascript
// tests/setup.js
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  // Clear all collections between tests
  for (const key in mongoose.connection.collections) {
    await mongoose.connection.collections[key].deleteMany();
  }
});
```

## Test Files

| File | Coverage Area |
|------|--------------|
| `tests/auth.test.js` | Auth endpoints (register, login, /me) |
| `tests/tools.test.js` | Tool CRUD endpoints |
| `tests/search.test.js` | Search and filtering endpoints |

## Test Pattern

- Integration tests via Supertest against `app.js`
- Each test file imports `app` directly (not `server.js`)
- Tests use in-memory MongoDB (no real DB needed)
- Rate limiting disabled in test environment (`NODE_ENV=test`)

## Gaps

- **No frontend tests** — No React component or E2E tests
- **No unit tests** — Only integration/API tests present
- **No CI/CD pipeline** — Tests not automated
- **Limited coverage** — Ratings/comments endpoints not explicitly tested
