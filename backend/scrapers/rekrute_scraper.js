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
      // Rekrute search page uses offres.html with keyWords parameter
      const searchUrl = `https://www.rekrute.com/offres.html?keyWords=${encodeURIComponent(keyword)}&st=p`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'fr-FR,fr;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
        },
        timeout: 10000
      });

      const html = response.data;
      
      // Parse Rekrute items using the correct 'post-id' class container
      const postRegex = /<li class="post-id"[\s\S]*?<\/li>/g;
      const posts = html.match(postRegex) || [];

      if (posts.length > 0) {
        console.log(`✅ Rekrute: Found ${posts.length} HTML offers for "${keyword}"`);
        
        for (const post of posts) {
          // Robust attribute-order-independent regexes
          const titleMatch = post.match(/<a[^>]*class=['"]titreJob['"][^>]*>([\s\S]*?)<\/a>/i);
          const linkMatch = post.match(/<a[^>]*class=['"]titreJob['"][^>]*href=['"]([^'"]+)['"]/i) || 
                            post.match(/<a[^>]*href=['"]([^'"]+)['"][^>]*class=['"]titreJob['"]/i);
          const companyMatch = post.match(/<img[^>]*class=['"]photo['"][^>]*alt=['"]([^'"]+)['"]/i) || 
                               post.match(/<img[^>]*alt=['"]([^'"]+)['"][^>]*class=['"]photo['"]/i) ||
                               post.match(/alt=['"]([^'"]+)['"]\s+title=/i) ||
                               post.match(/<a class=['"]companyName['"][\s\S]*?>([\s\S]*?)<\/a>/i);
          const descMatch = post.match(/<span style="color: #5b5b5b;line-height: 18px;">([\s\S]*?)<\/span>/i) ||
                            post.match(/<div class="info"[\s\S]*?>([\s\S]*?)<\/div>/i);

          if (titleMatch && linkMatch) {
            const rawTitle = titleMatch[1].replace(/\s+/g, ' ').trim();
            const rawUrl = linkMatch[1].trim();
            const url = rawUrl.startsWith('http') ? rawUrl : `https://www.rekrute.com${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
            
            let company = 'Recruteur Anonyme';
            if (companyMatch) {
              company = companyMatch[1].replace(/\s+/g, ' ').trim();
            }

            let location = 'Maroc';
            let title = rawTitle;
            // Split title and location if formatted as "Job | City (Maroc)"
            if (rawTitle.includes('|')) {
              const parts = rawTitle.split('|');
              title = parts[0].trim();
              location = parts[1].trim();
            }

            let description = descMatch 
              ? descMatch[1].replace(/<\/?[^>]+(>|$)/g, "").replace(/\s+/g, ' ').trim()
              : '';

            if (!description) {
              description = `Offre d'emploi informatique ${title} chez ${company} sur Rekrute. Visitez le site pour postuler et voir les exigences de compétences !`;
            }

            jobs.push({
              title,
              company,
              location,
              country: 'ma',
              source: 'rekrute',
              url,
              description,
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
  const searchUrl = `https://www.rekrute.com/offres.html?keyWords=${encodeURIComponent(keyword)}&st=p`;

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
