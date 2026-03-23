const mongoose = require('mongoose');
const Tool = require('./apps/tools/data-access/toolModel');
const dotenv = require('dotenv');

dotenv.config();

const tools = [
  {
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    category: 'AI Assistant',
    description: 'Powerful AI for writing, coding, and brainstorming.',
    tags: ['ai', 'writing', 'productivity'],
    submittedBy: '000000000000000000000001',
    isActive: true
  },
  {
    name: 'Notion',
    url: 'https://notion.so',
    category: 'Productivity',
    description: 'All-in-one workspace for notes, tasks, and wikis.',
    tags: ['notes', 'collab', 'productivity'],
    submittedBy: '000000000000000000000001',
    isActive: true
  },
  {
    name: 'Grammarly',
    url: 'https://grammarly.com',
    category: 'Writing',
    description: 'AI-powered writing assistant for grammar and style.',
    tags: ['writing', 'ai', 'education'],
    submittedBy: '000000000000000000000001',
    isActive: true
  },
  {
    name: 'Coursera',
    url: 'https://coursera.org',
    category: 'Education',
    description: 'Learn from top universities and companies online.',
    tags: ['learning', 'courses', 'education'],
    submittedBy: '000000000000000000000001',
    isActive: true
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  
  await Tool.deleteMany({ submittedBy: '000000000000000000000001' });
  await Tool.insertMany(tools);
  console.log('Tools seeded successfully');
  
  await mongoose.disconnect();
}

seed();
