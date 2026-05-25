import axios from 'axios';

/**
 * Scrape public jobs from LinkedIn
 * Note: LinkedIn blocks direct programmatic access using Cloudflare.
 * We implement a robust scraper that attempts to fetch public listings,
 * and falls back to a clean mock simulation if blocked or rate-limited.
 */
export async function scrapeLinkedIn(keywords, countryCode, categoryId) {
  const targetCountry = countryCode.toLowerCase();
  console.log(`🌐 Scanning LinkedIn Public for [${keywords.join(', ')}] in [${targetCountry}]...`);
  
  const jobs = [];
  const countryQuery = {
    ma: 'Morocco',
    fr: 'France',
    ca: 'Canada'
  };

  const geoName = countryQuery[targetCountry] || 'France';

  for (const keyword of keywords) {
    try {
      // Build public LinkedIn jobs URL
      const searchUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(geoName)}&start=0`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 10000
      });

      // Quick parsing using regex (avoiding heavy cheerio dependency for light serverless environments)
      // Extracts job IDs, titles, companies, locations from the HTML payload returned by seeMoreJobPostings
      const html = response.data;
      const jobCardRegex = /<li[\s\S]*?>[\s\S]*?<\/li>/g;
      const cards = html.match(jobCardRegex) || [];

      if (cards.length > 0) {
        console.log(`✅ LinkedIn: Parsed ${cards.length} HTML cards for "${keyword}"`);
        
        for (const card of cards) {
          // Extract Job Title
          const titleMatch = card.match(/<h3 class="base-search-card__title">([\s\S]*?)<\/h3>/);
          // Extract Company
          const companyMatch = card.match(/<a class="hidden-nested-link"[\s\S]*?>([\s\S]*?)<\/a>/) || card.match(/<h4 class="base-search-card__subtitle">([\s\S]*?)<\/h4>/);
          // Extract Location
          const locationMatch = card.match(/<span class="job-search-card__location">([\s\S]*?)<\/span>/);
          // Extract Job Link
          const linkMatch = card.match(/<a class="base-card__full-link"[\s\S]*?href="([\s\S]*?)"/);

          if (titleMatch && companyMatch && linkMatch) {
            const title = titleMatch[1].trim();
            const company = companyMatch[1].trim();
            const location = locationMatch ? locationMatch[1].trim() : geoName;
            let url = linkMatch[1].split('?')[0]; // clean tracking params

            jobs.push({
              title,
              company,
              location,
              country: targetCountry,
              source: 'linkedin',
              url,
              description: `Opportunité ${title} chez ${company}. Consultez LinkedIn pour postuler et voir la description complète !`,
              category: categoryId,
              postedDate: new Date().toISOString().split('T')[0]
            });
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ LinkedIn scraper blocked or timed out for "${keyword}" (Cloudflare/Rate Limit). Injecting fallback simulation.`);
      // Generate 1-2 realistic mock fallback jobs for this keyword/country/category
      // so the user actually sees fresh results instead of getting an empty dashboard due to LinkedIn's IP block!
      jobs.push(...generateLinkedInFallback(keyword, targetCountry, categoryId));
    }
  }

  return jobs;
}

function generateLinkedInFallback(keyword, country, category) {
  const flags = { ma: 'Maroc', fr: 'France', ca: 'Canada' };
  const geoName = flags[country] || 'France';
  
  // Real working search URL
  const searchUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(geoName)}`;

  return [
    {
      title: `Consulter les nouvelles offres [${keyword}] réelles sur LinkedIn`,
      company: `LinkedIn ${geoName}`,
      location: geoName,
      country: country,
      source: 'linkedin',
      url: searchUrl,
      description: `Le scraping direct de LinkedIn a été limité par la sécurité anti-bot de GitHub Actions (Cloudflare).\n\n👉 Cliquez sur ce lien pour accéder directement à 100% des offres réelles et en temps réel de ${keyword} en ${geoName} sur LinkedIn !`,
      category: category,
      postedDate: new Date().toISOString().split('T')[0]
    }
  ];
}
