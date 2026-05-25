import axios from 'axios';

/**
 * Scrape public jobs from Indeed
 * Note: Indeed is heavily protected by Cloudflare. 
 * We provide a scraper that fetches jobs through search feeds,
 * with a reliable, realistic mock fallback to keep the app working.
 */
export async function scrapeIndeed(keywords, countryCode, categoryId) {
  const targetCountry = countryCode.toLowerCase();
  console.log(`🌐 Scanning Indeed Public for [${keywords.join(', ')}] in [${targetCountry}]...`);
  
  const jobs = [];
  
  // Indeed domains by country
  const indeedDomains = {
    ma: 'ma.indeed.com',
    fr: 'fr.indeed.com',
    ca: 'ca.indeed.com'
  };

  const domain = indeedDomains[targetCountry] || 'fr.indeed.com';

  for (const keyword of keywords) {
    try {
      // Indeed public search RSS/Atom feed URL (excellent and very reliable way to bypass Cloudflare!)
      const searchUrl = `https://${domain}/rss?q=${encodeURIComponent(keyword)}&l=`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000
      });

      const xml = response.data;
      
      // Parse XML items using simple regex to avoid XML parser package overhead
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      if (items.length > 0) {
        console.log(`✅ Indeed RSS: Found ${items.length} offers for "${keyword}"`);
        
        for (const item of items) {
          const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
          const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
          const descMatch = item.match(/<description>([\s\S]*?)<\/description>/);
          const sourceMatch = item.match(/<source>([\s\S]*?)<\/source>/);

          if (titleMatch && linkMatch) {
            // Indeed RSS title is usually "Job Title - Company - Location"
            const fullTitle = titleMatch[1].replace('<![CDATA[', '').replace(']]>', '').trim();
            const parts = fullTitle.split(' - ');
            
            const title = parts[0] || keyword;
            const company = parts[1] || 'Indeed Partner';
            const location = parts[2] || (targetCountry === 'ma' ? 'Maroc' : targetCountry === 'fr' ? 'France' : 'Canada');
            const url = linkMatch[1].trim();
            
            const description = descMatch 
              ? descMatch[1].replace('<![CDATA[', '').replace(']]>', '').replace(/<\/?[^>]+(>|$)/g, "").trim()
              : '';

            jobs.push({
              title,
              company,
              location,
              country: targetCountry,
              source: 'indeed',
              url,
              description,
              category: categoryId,
              postedDate: new Date().toISOString().split('T')[0]
            });
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Indeed scraper blocked or timed out for "${keyword}" (${error.message}). Injecting fallback simulation.`);
      jobs.push(...generateIndeedFallback(keyword, targetCountry, categoryId));
    }
  }

  return jobs;
}

function generateIndeedFallback(keyword, country, category) {
  const flags = { ma: 'ma.indeed.com', fr: 'fr.indeed.com', ca: 'ca.indeed.com' };
  const domain = flags[country] || 'fr.indeed.com';
  const geoName = country === 'ma' ? 'Maroc' : country === 'fr' ? 'France' : 'Canada';
  
  // Real working search URL
  const searchUrl = `https://${domain}/jobs?q=${encodeURIComponent(keyword)}&l=`;

  return [
    {
      title: `Consulter les nouvelles offres [${keyword}] réelles sur Indeed`,
      company: `Indeed ${geoName}`,
      location: geoName,
      country: country,
      source: 'indeed',
      url: searchUrl,
      description: `Le scraping direct d'Indeed a été ralenti par Cloudflare sur GitHub Actions.\n\n👉 Cliquez sur ce lien pour accéder directement à la liste complète et en temps réel de 100% des offres réelles de ${keyword} sur Indeed ${geoName} !`,
      category: category,
      postedDate: new Date().toISOString().split('T')[0]
    }
  ];
}
