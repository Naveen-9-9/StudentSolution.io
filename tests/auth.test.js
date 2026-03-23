const request = require('supertest');
const app = require('../app');
const User = require('../apps/users/data-access/userModel');

describe('Auth Endpoints', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');

      // Verify user exists in DB
      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeDefined();
      expect(user.name).toBe(testUser.name);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'invalid-email' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 if user already exists', async () => {
      // First registration
      await request(app).post('/auth/register').send(testUser);

      // Second registration with same email
      const res = await request(app)
        .post('/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('CONFLICT');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Register user before login test
      await request(app).post('/auth/register').send(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.tokens).toHaveProperty('accessToken');
    });

    it('should return 400 for incorrect password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Invalid credentials/i);
    });

    it('should return 400 for non-existent user', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Account Management', () => {
    let accessToken;

    beforeEach(async () => {
      const res = await request(app).post('/auth/register').send(testUser);
      accessToken = res.body.data.tokens.accessToken;
    });

    it('should update user profile', async () => {
      const res = await request(app)
        .put('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.name).toBe('Updated Name');
    });

    it('should change password successfully', async () => {
      const res = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: testUser.password,
          newPassword: 'newPassword123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Password updated/i);

      // Verify login with new password
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'newPassword123'
        });
      expect(loginRes.statusCode).toBe(200);
    });

    it('should return 400 for incorrect old password', async () => {
      const res = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'wrongpassword',
          newPassword: 'newPassword123'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should delete user account', async () => {
      const res = await request(app)
        .delete('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);

      // Verify user no longer exists
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      expect(loginRes.statusCode).toBe(400);
    });
  });
});
