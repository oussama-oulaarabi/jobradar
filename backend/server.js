import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './database/db_manager.js';
import { runAllScrapers } from './scrapers/scraper_manager.js';
import { sendTelegramTestMessage, sendDailyJobReport } from './notifier/telegram.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Database before starting server
await db.init();

// Log system ready
console.log('🚀 JobRadar REST API Server is initializing...');

// 1. Get all aggregated jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await db.getJobs();
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Update job status (new, bookmarked, applied, rejected)
app.post('/api/jobs/bookmark', async (req, res) => {
  const { id, status } = req.body;
  if (!id || !status) {
    return res.status(400).json({ success: false, error: 'Missing id or status parameters.' });
  }
  try {
    const success = await db.updateJobStatus(id, status);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Import external job offers (CSV or JSON upload fallback)
app.post('/api/jobs/import', async (req, res) => {
  const { jobs } = req.body;
  if (!jobs || !Array.isArray(jobs)) {
    return res.status(400).json({ success: false, error: 'Invalid or missing jobs array.' });
  }
  
  try {
    const formatJobs = jobs.map(j => ({
      title: j.title,
      company: j.company || 'Importé',
      location: j.location || 'Maroc',
      country: j.country || 'ma',
      source: j.source || 'csv_import',
      url: j.url || '#',
      description: j.description || '',
      category: j.category || 'devops',
      postedDate: j.postedDate || new Date().toISOString().split('T')[0]
    }));

    const added = await db.addJobs(formatJobs);
    res.json({ success: true, count: added.length, added });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Read configuration
app.get('/api/config', (req, res) => {
  try {
    const config = db.getConfig();
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Write configuration
app.post('/api/config', (req, res) => {
  try {
    const success = db.saveConfig(req.body);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Test Telegram connection
app.post('/api/config/telegram-test', async (req, res) => {
  const { botToken, chatId } = req.body;
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    return res.status(400).json({ success: false, error: 'Veuillez configurer le Token et le Chat ID.' });
  }

  try {
    const success = await sendTelegramTestMessage(token, chat);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Manually trigger a fresh job search scan
app.post('/api/search/run', async (req, res) => {
  console.log('⚡ Manual job search requested via API');
  const logs = [];
  const logCallback = (msg) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    const config = db.getConfig();
    
    // Execute all scrapers
    const scrapedJobs = await runAllScrapers(config, logCallback);
    
    // Deduplicate and save
    logCallback('💾 Saving and deduplicating offers...');
    const newlyAddedJobs = await db.addJobs(scrapedJobs);
    logCallback(`✨ Deduplication complete: ${newlyAddedJobs.length} NEW jobs saved.`);

    // Send Telegram alert if enabled
    if (config.telegram && config.telegram.enabled && newlyAddedJobs.length > 0) {
      const token = process.env.TELEGRAM_BOT_TOKEN || config.telegram.botToken;
      const chat = process.env.TELEGRAM_CHAT_ID || config.telegram.chatId;
      if (token && chat) {
        logCallback('📤 Sending alert summary on Telegram...');
        await sendDailyJobReport(token, chat, newlyAddedJobs, config.categories);
      }
    }

    res.json({
      success: true,
      logs,
      scrapedCount: scrapedJobs.length,
      newlyAddedCount: newlyAddedJobs.length,
      addedJobs: newlyAddedJobs
    });
  } catch (err) {
    logCallback(`❌ Error during manual search scan: ${err.message}`);
    res.status(500).json({ success: false, error: err.message, logs });
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log('📊 Available endpoints:');
  console.log('   - GET  /api/jobs');
  console.log('   - POST /api/jobs/bookmark');
  console.log('   - POST /api/jobs/import');
  console.log('   - GET  /api/config');
  console.log('   - POST /api/config');
  console.log('   - POST /api/config/telegram-test');
  console.log('   - POST /api/search/run');
});
