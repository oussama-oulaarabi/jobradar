import axios from 'axios';

/**
 * Send job alerts or test notifications to a Telegram chat
 */
export async function sendTelegramMessage(botToken, chatId, text, parseMode = 'Markdown') {
  if (!botToken || !chatId) {
    console.warn('⚠️ Telegram Bot Token or Chat ID not configured. Message not sent.');
    return false;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    const response = await axios.post(url, {
      chat_id: chatId,
      text: text,
      parse_mode: parseMode,
      disable_web_page_preview: true
    });
    return response.data && response.data.ok;
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Format and send a beautifully structured daily report of new jobs
 */
export async function sendDailyJobReport(botToken, chatId, newJobs, categoriesConfig) {
  if (newJobs.length === 0) {
    const emptyMsg = `🔍 *JobRadar - Rapport Quotidien*\n\nAucune nouvelle offre d'emploi correspondant à vos critères n'a été détectée aujourd'hui. Nous relancerons une recherche demain ! ⏰`;
    return await sendTelegramMessage(botToken, chatId, emptyMsg);
  }

  // Header
  let header = `🚀 *JobRadar - Rapport de Veille* 🚀\n`;
  header += `📅 Date : _${new Date().toLocaleDateString('fr-FR')}_\n`;
  header += `✨ *${newJobs.length}* nouvelle(s) offre(s) d'emploi trouvée(s) !\n\n`;
  header += `───────────────────────\n\n`;

  // Group jobs by category
  const jobsByCategory = {};
  for (const job of newJobs) {
    const cat = job.category || 'Autres';
    if (!jobsByCategory[cat]) jobsByCategory[cat] = [];
    jobsByCategory[cat].push(job);
  }

  let body = '';
  const flags = { ma: '🇲🇦', fr: '🇫🇷', ca: '🇨🇦', us: '🇺🇸', uk: '🇬🇧' };

  for (const [category, jobs] of Object.entries(jobsByCategory)) {
    // Find category display name
    const categoryConfig = categoriesConfig.find(c => c.id === category);
    const categoryName = categoryConfig ? categoryConfig.name : category;
    
    body += `📂 *${categoryName.toUpperCase()}* (${jobs.length} offres)\n`;
    
    for (const job of jobs) {
      const flag = flags[job.country?.toLowerCase()] || '📍';
      const company = job.company ? `*${job.company}*` : 'N/A';
      const source = job.source ? `[${job.source.toUpperCase()}]` : '';
      
      let jobStr = `• ${flag} ${company} - *${job.title}*\n`;
      jobStr += `  📍 Location : _${job.location || 'Non précisé'}_\n`;
      jobStr += `  🔗 [Postuler en 1-Clic ici](${job.url})\n\n`;
      
      // If we exceed character limit (Telegram limit is 4096), send what we have and start a new message
      if ((header + body + jobStr).length > 3900) {
        await sendTelegramMessage(botToken, chatId, header + body);
        header = `🚀 *Suite du Rapport JobRadar* 🚀\n\n`;
        body = jobStr;
      } else {
        body += jobStr;
      }
    }
    body += `───────────────────────\n\n`;
  }

  const footer = `🔔 _Restez connecté, de nouvelles opportunités arrivent tous les jours !_`;

  return await sendTelegramMessage(botToken, chatId, header + body + footer);
}

/**
 * Send a test connection message to the user
 */
export async function sendTelegramTestMessage(botToken, chatId) {
  const testMsg = `✅ *Connexion Réussie !*\n\nFélicitations, votre robot *JobRadar* est maintenant correctement connecté à ce canal de discussion.\n\nVous recevrez ici vos rapports quotidiens d'offres d'emploi en *Big Data, DevOps, Cloud (AWS/Azure), Observabilité (ELK/Grafana), Java/Spring, et React* ! 🚀🔥`;
  return await sendTelegramMessage(botToken, chatId, testMsg);
}
