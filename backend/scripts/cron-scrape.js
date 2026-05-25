import dotenv from 'dotenv';
import { db } from '../database/db_manager.js';
import { runAllScrapers } from '../scrapers/scraper_manager.js';
import { sendDailyJobReport } from '../notifier/telegram.js';

// Load environmental variables
dotenv.config();

async function runCronJob() {
  console.log('⏰ Starting Scheduled Daily Job Search Alert...');
  console.log(`📅 Execution Time: ${new Date().toLocaleString('fr-FR')}`);
  
  try {
    // 1. Initialize DB
    await db.init();
    
    // 2. Read Configuration
    const config = db.getConfig();
    console.log(`🛠️ Active keywords for search categories:`, config.categories.map(c => `${c.name} (${c.keywords.length})`));
    console.log(`🌍 Targeted countries:`, config.countries.filter(c => c.enabled).map(c => c.name));
    
    // 3. Run Scrapers
    const logs = [];
    const logCallback = (msg) => {
      console.log(msg);
      logs.push(msg);
    };
    
    const scrapedJobs = await runAllScrapers(config, logCallback);
    console.log(`📊 Total raw jobs scraped: ${scrapedJobs.length}`);

    // 4. Save and Deduplicate
    console.log('💾 Saving and deduplicating jobs...');
    const newlyAddedJobs = await db.addJobs(scrapedJobs);
    console.log(`✨ Deduplication complete: ${newlyAddedJobs.length} NEW jobs saved to database.`);

    // 5. Send Telegram Notification
    if (config.telegram && config.telegram.enabled) {
      const token = process.env.TELEGRAM_BOT_TOKEN || config.telegram.botToken;
      const chat = process.env.TELEGRAM_CHAT_ID || config.telegram.chatId;
      
      if (token && chat) {
        console.log(`📤 Broadcasting daily report to Telegram Chat [${chat}]...`);
        const notificationSuccess = await sendDailyJobReport(token, chat, newlyAddedJobs, config.categories);
        if (notificationSuccess) {
          console.log('✅ Telegram alert broadcasted successfully!');
        } else {
          console.error('❌ Failed to broadcast daily Telegram alert.');
        }
      } else {
        console.warn('⚠️ Telegram enabled but Bot Token or Chat ID is missing from configuration.');
      }
    } else {
      console.log('ℹ️ Telegram notifications are disabled in configuration.');
    }

    console.log('🏁 Daily cron-scrape execution successfully completed!');
    process.exit(0);

  } catch (error) {
    console.error('💥 Critical error during daily search execution:', error);
    process.exit(1);
  }
}

// Execute immediately when running standalone script
runCronJob();
