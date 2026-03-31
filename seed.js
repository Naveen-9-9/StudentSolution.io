const mongoose = require('mongoose');
const Tool = require('./apps/tools/data-access/toolModel');
const Comment = require('./apps/ratings/data-access/commentModel');
const dotenv = require('dotenv');

dotenv.config();

const SYSTEM_USER_ID = '000000000000000000000001';

const tools = [
  // ═══════════════════════════════════════════
  // PDF CONVERTER
  // ═══════════════════════════════════════════
  {
    name: 'iLovePDF',
    url: 'https://www.ilovepdf.com',
    category: 'pdf-converter',
    description: 'Free online tool to merge, split, compress, convert, rotate, unlock, and watermark PDFs. Simple and easy to use with batch processing support.',
    tags: ['pdf', 'merge', 'compress', 'convert', 'free'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 42
  },
  {
    name: 'Smallpdf',
    url: 'https://smallpdf.com',
    category: 'pdf-converter',
    description: 'All-in-one PDF toolkit to compress, convert, edit, and sign PDFs. Offers 21+ tools with a clean interface and cloud integration.',
    tags: ['pdf', 'compress', 'edit', 'sign', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 38
  },
  {
    name: 'PDF24 Tools',
    url: 'https://tools.pdf24.org',
    category: 'pdf-converter',
    description: 'Completely free PDF tools — no file size limit, no watermarks. Over 30 tools for merging, splitting, compressing, and converting PDFs.',
    tags: ['pdf', 'free', 'merge', 'split', 'no-watermark'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 35
  },
  {
    name: 'Adobe Acrobat Online',
    url: 'https://www.adobe.com/acrobat/online.html',
    category: 'pdf-converter',
    description: 'Adobe\'s official online PDF toolkit. Convert, compress, sign, and edit PDFs with high-quality output. Limited free uses, then requires subscription.',
    tags: ['pdf', 'adobe', 'convert', 'sign', 'paid'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 30
  },
  {
    name: 'Sejda PDF',
    url: 'https://www.sejda.com',
    category: 'pdf-converter',
    description: 'Online PDF editor that lets you edit text directly in PDFs, merge, split, compress, and convert. Free tier allows 3 tasks per day.',
    tags: ['pdf', 'editor', 'merge', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 22
  },
  {
    name: 'PDF Candy',
    url: 'https://pdfcandy.com',
    category: 'pdf-converter',
    description: 'Free online PDF converter with 47+ tools. Convert PDF to Word, Excel, JPG and vice versa. Also offers OCR, merge, split, and more.',
    tags: ['pdf', 'convert', 'ocr', 'free'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 18
  },

  // ═══════════════════════════════════════════
  // PPT MAKER
  // ═══════════════════════════════════════════
  {
    name: 'Canva Presentations',
    url: 'https://www.canva.com/presentations',
    category: 'ppt-maker',
    description: 'Design stunning presentations with thousands of free templates, stock photos, and drag-and-drop editing. No design skills needed.',
    tags: ['presentation', 'design', 'templates', 'free'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 55
  },
  {
    name: 'Google Slides',
    url: 'https://slides.google.com',
    category: 'ppt-maker',
    description: 'Free cloud-based presentation tool by Google. Real-time collaboration, auto-save, and seamless integration with Google Workspace.',
    tags: ['presentation', 'google', 'collaboration', 'free', 'cloud'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 48
  },
  {
    name: 'Beautiful.ai',
    url: 'https://www.beautiful.ai',
    category: 'ppt-maker',
    description: 'AI-powered presentation maker that automatically designs slides as you add content. Smart templates adapt to your content in real-time.',
    tags: ['presentation', 'ai', 'design', 'paid'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 33
  },
  {
    name: 'Pitch',
    url: 'https://pitch.com',
    category: 'ppt-maker',
    description: 'Collaborative presentation software for modern teams. Beautiful templates, brand consistency, and real-time collaboration features.',
    tags: ['presentation', 'collaboration', 'templates', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 28
  },
  {
    name: 'Prezi',
    url: 'https://prezi.com',
    category: 'ppt-maker',
    description: 'Create dynamic, non-linear presentations that zoom and pan between topics. Stand out with motion-based storytelling instead of static slides.',
    tags: ['presentation', 'interactive', 'zoom', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 25
  },
  {
    name: 'Slidesgo',
    url: 'https://slidesgo.com',
    category: 'ppt-maker',
    description: 'Huge library of free Google Slides and PowerPoint templates for students. Covers education, thesis, creative, and professional themes.',
    tags: ['templates', 'free', 'powerpoint', 'google-slides'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 40
  },
  {
    name: 'Gamma',
    url: 'https://gamma.app',
    category: 'ppt-maker',
    description: 'AI-powered tool that generates beautiful presentations, documents, and webpages from a simple prompt. Just describe what you need and it creates it.',
    tags: ['ai', 'presentation', 'generator', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 45
  },

  // ═══════════════════════════════════════════
  // API
  // ═══════════════════════════════════════════
  {
    name: 'Postman',
    url: 'https://www.postman.com',
    category: 'api',
    description: 'Industry-standard API development platform. Build, test, document, and monitor APIs with a powerful GUI and collaboration features.',
    tags: ['api', 'testing', 'development', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 50
  },
  {
    name: 'RapidAPI',
    url: 'https://rapidapi.com',
    category: 'api',
    description: 'World\'s largest API marketplace. Discover, test, and connect to thousands of APIs for weather, translation, AI, sports data, and more.',
    tags: ['api', 'marketplace', 'integration', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 35
  },
  {
    name: 'Insomnia',
    url: 'https://insomnia.rest',
    category: 'api',
    description: 'Open-source API client for REST, GraphQL, and gRPC. Clean interface for designing, debugging, and testing APIs locally.',
    tags: ['api', 'rest', 'graphql', 'open-source', 'free'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 28
  },
  {
    name: 'Swagger Editor',
    url: 'https://editor.swagger.io',
    category: 'api',
    description: 'Free online editor for designing, describing, and documenting RESTful APIs using OpenAPI specification. Generates interactive API docs.',
    tags: ['api', 'documentation', 'openapi', 'free'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 32
  },
  {
    name: 'Hoppscotch',
    url: 'https://hoppscotch.io',
    category: 'api',
    description: 'Open-source, lightweight API development ecosystem. Fast alternative to Postman with real-time WebSocket testing and GraphQL support.',
    tags: ['api', 'testing', 'open-source', 'free', 'lightweight'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 30
  },
  {
    name: 'Thunder Client',
    url: 'https://www.thunderclient.com',
    category: 'api',
    description: 'Lightweight REST API client extension for VS Code. Test APIs without leaving your code editor. Clean UI with collections and environment support.',
    tags: ['api', 'vscode', 'extension', 'free'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 26
  },

  // ═══════════════════════════════════════════
  // FILE CONVERTER
  // ═══════════════════════════════════════════
  {
    name: 'CloudConvert',
    url: 'https://cloudconvert.com',
    category: 'file-converter',
    description: 'Convert between 200+ file formats including documents, images, audio, video, and ebooks. High quality conversions with API access.',
    tags: ['converter', 'documents', 'images', 'video', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 40
  },
  {
    name: 'Zamzar',
    url: 'https://www.zamzar.com',
    category: 'file-converter',
    description: 'Free online file converter supporting 1200+ formats. Convert documents, images, videos, and audio without installing software.',
    tags: ['converter', 'free', 'documents', 'video', 'audio'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 32
  },
  {
    name: 'Convertio',
    url: 'https://convertio.co',
    category: 'file-converter',
    description: 'Advanced online file converter supporting 300+ formats. Drag-and-drop interface with cloud storage integration (Google Drive, Dropbox).',
    tags: ['converter', 'cloud', 'drag-drop', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 36
  },
  {
    name: 'Online-Convert',
    url: 'https://www.online-convert.com',
    category: 'file-converter',
    description: 'Free online converter for audio, video, images, documents, ebooks, and archives. Offers advanced settings for quality and format options.',
    tags: ['converter', 'free', 'audio', 'video', 'ebook'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 24
  },
  {
    name: 'HandBrake',
    url: 'https://handbrake.fr',
    category: 'file-converter',
    description: 'Free, open-source video transcoder. Convert nearly any video format with presets for different devices and platforms.',
    tags: ['video', 'converter', 'open-source', 'free', 'desktop'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 38
  },
  {
    name: 'FFmpeg',
    url: 'https://ffmpeg.org',
    category: 'file-converter',
    description: 'Complete, cross-platform command-line tool for audio and video processing. The backbone behind most media conversion tools.',
    tags: ['video', 'audio', 'command-line', 'open-source', 'free'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 44
  },

  // ═══════════════════════════════════════════
  // PRODUCTIVITY
  // ═══════════════════════════════════════════
  {
    name: 'Notion',
    url: 'https://www.notion.so',
    category: 'productivity',
    description: 'All-in-one workspace for notes, tasks, wikis, and databases. Perfect for students to organize coursework, track assignments, and collaborate.',
    tags: ['notes', 'tasks', 'wiki', 'collaboration', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 60
  },
  {
    name: 'Obsidian',
    url: 'https://obsidian.md',
    category: 'productivity',
    description: 'Knowledge base app using local Markdown files with bi-directional linking. Build your personal knowledge graph for studying and research.',
    tags: ['notes', 'markdown', 'knowledge-base', 'free'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 52
  },
  {
    name: 'Todoist',
    url: 'https://todoist.com',
    category: 'productivity',
    description: 'Clean and powerful task manager with natural language input, projects, labels, and priority levels. Great for managing assignments and deadlines.',
    tags: ['tasks', 'todo', 'deadlines', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 40
  },
  {
    name: 'Trello',
    url: 'https://trello.com',
    category: 'productivity',
    description: 'Visual project management with Kanban boards. Drag-and-drop cards to organize tasks, group projects, and study plans.',
    tags: ['kanban', 'project-management', 'collaboration', 'free'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 38
  },
  {
    name: 'Forest',
    url: 'https://www.forestapp.cc',
    category: 'productivity',
    description: 'Stay focused by planting virtual trees. Your tree grows while you focus and dies if you leave the app. Gamified productivity timer.',
    tags: ['focus', 'timer', 'gamification', 'paid'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 35
  },
  {
    name: 'Excalidraw',
    url: 'https://excalidraw.com',
    category: 'productivity',
    description: 'Free, open-source virtual whiteboard for sketching hand-drawn diagrams. Perfect for brainstorming, flowcharts, and explaining concepts.',
    tags: ['whiteboard', 'drawing', 'diagrams', 'free', 'open-source'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 45
  },
  {
    name: 'Google Calendar',
    url: 'https://calendar.google.com',
    category: 'productivity',
    description: 'Free calendar app with seamless scheduling, reminders, and event sharing. Integrates with Gmail and Google Meet for class schedules.',
    tags: ['calendar', 'scheduling', 'google', 'free'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 42
  },

  // ═══════════════════════════════════════════
  // EDUCATION
  // ═══════════════════════════════════════════
  {
    name: 'Khan Academy',
    url: 'https://www.khanacademy.org',
    category: 'education',
    description: 'Free world-class education platform. Learn math, science, computing, history, and more with interactive exercises and video lessons.',
    tags: ['learning', 'math', 'science', 'free', 'videos'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 58
  },
  {
    name: 'Coursera',
    url: 'https://www.coursera.org',
    category: 'education',
    description: 'Online courses from top universities like Stanford, MIT, and Yale. Earn certificates and degrees in CS, business, data science, and more.',
    tags: ['courses', 'university', 'certificates', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 50
  },
  {
    name: 'Quizlet',
    url: 'https://quizlet.com',
    category: 'education',
    description: 'Create and study flashcards, practice tests, and interactive games. AI-enhanced study tools help you learn faster and retain more.',
    tags: ['flashcards', 'study', 'quizzes', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 45
  },
  {
    name: 'Wolfram Alpha',
    url: 'https://www.wolframalpha.com',
    category: 'education',
    description: 'Computational knowledge engine that answers math, science, and engineering questions with step-by-step solutions. Essential for STEM students.',
    tags: ['math', 'science', 'solver', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 55
  },
  {
    name: 'Desmos',
    url: 'https://www.desmos.com',
    category: 'education',
    description: 'Free online graphing calculator. Plot functions, create tables, add sliders, animate graphs, and explore math concepts interactively.',
    tags: ['math', 'graphing', 'calculator', 'free'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 42
  },
  {
    name: 'Grammarly',
    url: 'https://www.grammarly.com',
    category: 'education',
    description: 'AI-powered writing assistant that checks grammar, spelling, punctuation, clarity, and tone. Essential for essays, papers, and assignments.',
    tags: ['writing', 'grammar', 'ai', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 48
  },
  {
    name: 'Zotero',
    url: 'https://www.zotero.org',
    category: 'education',
    description: 'Free reference manager to collect, organize, cite, and share research. Auto-generates bibliographies in any citation style (APA, MLA, Chicago).',
    tags: ['research', 'citations', 'bibliography', 'free', 'open-source'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 38
  },
  {
    name: 'edX',
    url: 'https://www.edx.org',
    category: 'education',
    description: 'Free online courses from Harvard, MIT, Berkeley, and 160+ institutions. Earn verified certificates and micro-degrees in various fields.',
    tags: ['courses', 'university', 'free', 'certificates'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 40
  },

  // ═══════════════════════════════════════════
  // OTHER
  // ═══════════════════════════════════════════
  {
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    category: 'other',
    description: 'AI chatbot by OpenAI for writing essays, coding help, brainstorming, research summaries, and answering complex questions. Game-changer for students.',
    tags: ['ai', 'chatbot', 'writing', 'coding', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 65
  },
  {
    name: 'GitHub',
    url: 'https://github.com',
    category: 'other',
    description: 'Platform for version control and collaboration using Git. Host code repositories, contribute to open-source, and build your portfolio.',
    tags: ['git', 'code', 'collaboration', 'open-source', 'free'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 55
  },
  {
    name: 'Figma',
    url: 'https://www.figma.com',
    category: 'other',
    description: 'Collaborative design tool for UI/UX, wireframing, and prototyping. Free for students with real-time multiplayer editing.',
    tags: ['design', 'ui', 'prototyping', 'collaboration', 'free'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 50
  },
  {
    name: 'Replit',
    url: 'https://replit.com',
    category: 'other',
    description: 'Browser-based IDE supporting 50+ languages. Write, run, and share code instantly without any setup. Great for CS students and beginners.',
    tags: ['coding', 'ide', 'online', 'collaboration', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 42
  },
  {
    name: 'Remove.bg',
    url: 'https://www.remove.bg',
    category: 'other',
    description: 'Instantly remove image backgrounds with AI. Perfect for presentations, project thumbnails, and profile pictures. Free for standard quality.',
    tags: ['images', 'ai', 'background-removal', 'free'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 38
  },
  {
    name: 'TinyPNG',
    url: 'https://tinypng.com',
    category: 'other',
    description: 'Smart PNG and JPEG image compression. Reduce file sizes by up to 80% without visible quality loss. Free for up to 20 images at a time.',
    tags: ['images', 'compression', 'free', 'png', 'jpeg'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 30
  },
  {
    name: 'Overleaf',
    url: 'https://www.overleaf.com',
    category: 'other',
    description: 'Online LaTeX editor for writing academic papers, theses, and research documents. Real-time collaboration with templates for every journal.',
    tags: ['latex', 'academic', 'writing', 'collaboration', 'freemium'],
    submittedBy: SYSTEM_USER_ID,
    isActive: true,
    upvoteCount: 46
  }
];

async function seed() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing seeded tools and reviews
    await Tool.deleteMany({ submittedBy: SYSTEM_USER_ID });
    await Comment.deleteMany({ userId: SYSTEM_USER_ID });
    console.log('Cleared existing seeded tools and reviews');

    const sampleReviews = [
      { text: "This tool saved me so much time on my last assignment!", rating: 5 },
      { text: "Highly recommend for any student. Super easy to use.", rating: 5 },
      { text: "Pretty good, does exactly what it says.", rating: 4 },
      { text: "Standard tool in my workflow now.", rating: 4 },
      { text: "A bit confusing at first but very powerful once you get it.", rating: 4 },
      { text: "Life saver! Best in its category.", rating: 5 },
      { text: "Solid choice for students on a budget.", rating: 4 },
      { text: "The free tier is generous and the output is high quality.", rating: 5 }
    ];

    // Insert new tools
    const insertedTools = [];
    console.log(`Starting to seed ${tools.length} tools...`);
    
    for (const toolData of tools) {
      const tool = new Tool(toolData);
      
      // Generate 2-5 random reviews for each tool
      const numReviews = Math.floor(Math.random() * 4) + 2;
      let totalRating = 0;

      for (let i = 0; i < numReviews; i++) {
        const reviewTemplate = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
        const review = new Comment({
          toolId: tool._id,
          userId: SYSTEM_USER_ID,
          text: reviewTemplate.text,
          rating: reviewTemplate.rating
        });
        await review.save();
        totalRating += reviewTemplate.rating;
      }

      tool.averageRating = Math.round((totalRating / numReviews) * 10) / 10;
      tool.reviewCount = numReviews;
      await tool.save();
      insertedTools.push(tool);
    }

    console.log(`\u2705 Successfully seeded ${insertedTools.length} tools with reviews across ${[...new Set(tools.map(t => t.category))].length} categories:`);

    // Show summary by category
    const categoryCounts = {};
    tools.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} tools`);
    });

    await mongoose.disconnect();
    console.log('\nDone! Database disconnected.');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    if (error.code === 'ECONNREFUSED' || error.name === 'MongooseServerSelectionError') {
      console.error('\n\u26A1 CONNECTION ERROR DETECTED:');
      console.error('It looks like your network is blocking the MongoDB Atlas connection (ECONNREFUSED).');
      console.error('Try changing your DNS to 8.8.8.8 or check your firewall/whitelist settings.');
    }
    process.exit(1);
  }
}

seed();
