import axios from 'axios';

/**
 * Fetch jobs from the official Jooble REST API
 */
export async function scrapeJooble(apiKey, keywords, countryCode, categoryId) {
  if (!apiKey) {
    console.log('ℹ️ Jooble API Key not set. Skipping Jooble.');
    return [];
  }

  console.log(`🌐 Scanning Jooble API for [${keywords.join(', ')}] in [${countryCode}]...`);
  const jobs = [];
  
  // Country code mapping for Jooble API locations
  const countryNames = {
    ma: 'Maroc',
    fr: 'France',
    ca: 'Canada'
  };

  const location = countryNames[countryCode.toLowerCase()] || countryCode;

  for (const keyword of keywords) {
    try {
      const url = `https://jooble.org/api/${apiKey}`;
      const response = await axios.post(url, {
        keywords: keyword,
        location: location
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      if (response.data && Array.isArray(response.data.jobs)) {
        console.log(`✅ Jooble: Found ${response.data.jobs.length} offers for "${keyword}"`);
        
        for (const rawJob of response.data.jobs) {
          jobs.push({
            title: rawJob.title,
            company: rawJob.company || 'N/A',
            location: rawJob.location || location,
            country: countryCode.toLowerCase(),
            source: 'jooble',
            url: rawJob.link,
            description: rawJob.snippet ? rawJob.snippet.replace(/<\/?[^>]+(>|$)/g, "") : '', // strip html tags
            category: categoryId,
            postedDate: rawJob.updated ? new Date(rawJob.updated).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          });
        }
      }
    } catch (error) {
      console.error(`❌ Jooble API error for keyword "${keyword}":`, error.message);
    }
  }

  return jobs;
}
