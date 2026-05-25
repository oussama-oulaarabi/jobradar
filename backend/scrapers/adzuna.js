import axios from 'axios';

/**
 * Fetch jobs from the official Adzuna REST API
 */
export async function scrapeAdzuna(appId, appKey, keywords, countryCode, categoryId) {
  if (!appId || !appKey) {
    console.log('ℹ️ Adzuna App ID or App Key not set. Skipping Adzuna.');
    return [];
  }

  // Adzuna only supports specific countries. Let's map them.
  // Note: Morocco ('ma') is not natively supported by Adzuna API, but France ('fr') and Canada ('ca') are!
  const supportedAdzunaCountries = ['fr', 'ca', 'gb', 'us'];
  const targetCountry = countryCode.toLowerCase();

  if (!supportedAdzunaCountries.includes(targetCountry)) {
    console.log(`ℹ️ Adzuna: Country [${countryCode}] is not natively supported by Adzuna API. Skipping.`);
    return [];
  }

  console.log(`🌐 Scanning Adzuna API for [${keywords.join(', ')}] in [${targetCountry}]...`);
  const jobs = [];

  for (const keyword of keywords) {
    try {
      // Adzuna requires a country code in the URL endpoint
      const url = `https://api.adzuna.com/v1/api/jobs/${targetCountry}/search/1`;
      
      const response = await axios.get(url, {
        params: {
          app_id: appId,
          app_key: appKey,
          what: keyword,
          results_per_page: 20
        },
        timeout: 10000
      });

      if (response.data && Array.isArray(response.data.results)) {
        console.log(`✅ Adzuna: Found ${response.data.results.length} offers for "${keyword}"`);
        
        for (const rawJob of response.data.results) {
          jobs.push({
            title: rawJob.title,
            company: rawJob.company?.display_name || 'N/A',
            location: rawJob.location?.display_name || '',
            country: targetCountry,
            source: 'adzuna',
            url: rawJob.redirect_url,
            description: rawJob.description || '',
            category: categoryId,
            postedDate: rawJob.created ? new Date(rawJob.created).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          });
        }
      }
    } catch (error) {
      console.error(`❌ Adzuna API error for keyword "${keyword}" in "${targetCountry}":`, error.message);
    }
  }

  return jobs;
}
