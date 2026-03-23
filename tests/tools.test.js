const request = require('supertest');
const app = require('../app');
const Tool = require('../apps/tools/data-access/toolModel');
const User = require('../apps/users/data-access/userModel');

describe('Tools Endpoints', () => {
  let accessToken;
  let userId;
  let toolId;

  beforeEach(async () => {
    // Register and login to get token
    const userData = { email: 'tools@example.com', password: 'password123', name: 'Tool Tester' };
    const regRes = await request(app).post('/auth/register').send(userData);
    accessToken = regRes.body.data.tokens.accessToken;
    userId = regRes.body.data.user.id;

    // Create a shared tool for tests that need it
    const tool = await Tool.create({
      name: 'Shared Tool',
      url: 'https://shared.com',
      category: 'productivity',
      description: 'Shared tool description',
      submittedBy: userId
    });
    toolId = tool._id;
  });

  describe('POST /tools', () => {
    it('should create a new tool when authenticated', async () => {
      const toolData = {
        name: 'Test Tool',
        url: 'https://example.com/tool',
        category: 'productivity',
        description: 'A very useful test tool for productivity.',
        tags: ['test', 'demo']
      };

      const res = await request(app)
        .post('/tools')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(toolData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tool.name).toBe(toolData.name);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/tools')
        .send({ name: 'Unauthorized' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /tools', () => {
    it('should list all active tools', async () => {
      const res = await request(app).get('/tools');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.tools)).toBe(true);
    });

    it('should filter tools by category', async () => {
      const res = await request(app).get('/tools?category=productivity');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.tools.every(t => t.category === 'productivity')).toBe(true);
    });
  });

  describe('POST /tools/:id/upvote', () => {
    it('should toggle upvote for a tool', async () => {
      // First upvote
      const res1 = await request(app)
        .post(`/tools/${toolId}/upvote`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res1.statusCode).toBe(200);
      expect(res1.body.message).toBe('Tool upvoted');
      expect(res1.body.data.upvoteCount).toBe(1);

      // Second toggle (remove upvote)
      const res2 = await request(app)
        .post(`/tools/${toolId}/upvote`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res2.statusCode).toBe(200);
      expect(res2.body.message).toBe('Upvote removed');
      expect(res2.body.data.upvoteCount).toBe(0);
    });
  });

  describe('DELETE /tools/:id', () => {
    it('should soft delete the tool', async () => {
      const res = await request(app)
        .delete(`/tools/${toolId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      
      const tool = await Tool.findById(toolId);
      expect(tool.isActive).toBe(false);
    });
  });
});
