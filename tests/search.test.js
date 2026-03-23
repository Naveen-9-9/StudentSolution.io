const request = require('supertest');
const app = require('../app');
const Tool = require('../apps/tools/data-access/toolModel');

describe('Search Endpoints', () => {
  beforeEach(async () => {
    // Seed some tools for search
    const tools = [
      {
        name: 'PDF Master',
        url: 'https://pdf.example.com',
        category: 'pdf-converter',
        description: 'Advanced PDF editing and conversion tool',
        tags: ['pdf', 'edit'],
        submittedBy: '000000000000000000000001', // Dummy ID
        isActive: true
      },
      {
        name: 'Slide Maker Pro',
        url: 'https://ppt.example.com',
        category: 'ppt-maker',
        description: 'Create professional presentations easily',
        tags: ['ppt', 'slides'],
        submittedBy: '000000000000000000000001',
        isActive: true
      }
    ];
    await Tool.insertMany(tools);
    await Tool.createIndexes();
  });

  describe('GET /search', () => {
    it('should find tools matching text query', async () => {
      const res = await request(app).get('/search?q=PDF');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tools.some(t => t.name.includes('PDF'))).toBe(true);
    });

    it('should filter by category via search endpoint', async () => {
      const res = await request(app).get('/search?category=pdf-converter');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.tools.every(t => t.category === 'pdf-converter')).toBe(true);
    });
  });

  describe('GET /search/suggest', () => {
    it('should provide suggestions based on partial name', async () => {
      const res = await request(app).get('/search/suggest?q=Sli');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.suggestions.some(s => s.name.startsWith('Slide'))).toBe(true);
    });
  });

  describe('GET /search/categories', () => {
    it('should return categories with counts', async () => {
      const res = await request(app).get('/search/categories');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data.categories)).toBe(true);
      expect(res.body.data.categories.length).toBeGreaterThan(0);
    });
  });
});
