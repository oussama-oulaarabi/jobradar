import axios from 'axios';

/**
 * Scrape jobs from Rekrute (Morocco's leading tech job platform)
 */
export async function scrapeRekrute(keywords, countryCode, categoryId) {
  // Rekrute is specific to Morocco
  if (countryCode.toLowerCase() !== 'ma') {
    return [];
  }

  console.log(`🌐 Scanning Rekrute (Maroc) for [${keywords.join(', ')}]...`);
  const jobs = [];

  for (const keyword of keywords) {
    try {
      // Rekrute search page
      const searchUrl = `https://www.rekrute.com/offres-emploi.html?keyword=${encodeURIComponent(keyword)}&st=p`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'fr-FR,fr;q=0.9'
        },
        timeout: 10000
      });

      const html = response.data;
      
      // Parse Rekrute items using HTML regex
      const postRegex = /<li class="post-item[\s\S]*?<\/li>/g;
      const posts = html.match(postRegex) || [];

      if (posts.length > 0) {
        console.log(`✅ Rekrute: Found ${posts.length} HTML offers for "${keyword}"`);
        
        for (const post of posts) {
          const titleMatch = post.match(/<a class="titreJob"[\s\S]*?>([\s\S]*?)<\/a>/);
          const companyMatch = post.match(/<img class="logoCompany"[\s\S]*?alt="([\s\S]*?)"/) || post.match(/<a class="companyName"[\s\S]*?>([\s\S]*?)<\/a>/);
          const locationMatch = post.match(/<span class="location">([\s\S]*?)<\/span>/) || post.match(/📍\s*([^<\n]+)/);
          const linkMatch = post.match(/<a class="titreJob"[\s\S]*?href="([\s\S]*?)"/);

          if (titleMatch && linkMatch) {
            const title = titleMatch[1].trim();
            const company = companyMatch ? companyMatch[1].trim() : 'Recruteur Anonyme';
            const location = locationMatch ? locationMatch[1].trim() : 'Casablanca';
            const url = linkMatch[1].startsWith('http') ? linkMatch[1] : `https://www.rekrute.com${linkMatch[1]}`;

            jobs.push({
              title,
              company,
              location,
              country: 'ma',
              source: 'rekrute',
              url,
              description: `Offre d'emploi informatique ${title} sur Rekrute. Visitez le site pour postuler et voir les exigences de compétences !`,
              category: categoryId,
              postedDate: new Date().toISOString().split('T')[0]
            });
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Rekrute scraper timeout or error for "${keyword}" (${error.message}). Injecting fallback simulation.`);
      jobs.push(...generateRekruteFallback(keyword, categoryId));
    }
  }

  return jobs;
}

function generateRekruteFallback(keyword, category) {
  const searchUrl = `https://www.rekrute.com/offres-emploi.html?keyword=${encodeURIComponent(keyword)}&st=p`;

  return [
    {
      title: `Consulter les nouvelles offres [${keyword}] réelles sur Rekrute Maroc`,
      company: `Rekrute Maroc`,
      location: `Maroc`,
      country: 'ma',
      source: 'rekrute',
      url: searchUrl,
      description: `Le scraping direct de Rekrute a été ralenti par des mesures de protection.\n\n👉 Cliquez sur ce lien pour accéder en temps réel à 100% de la liste complète des offres actives pour ${keyword} sur Rekrute Maroc !`,
      category: category,
      postedDate: new Date().toISOString().split('T')[0]
    }
  ];
}
