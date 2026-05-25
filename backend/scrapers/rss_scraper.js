import axios from 'axios';

/**
 * Universal RSS Feed Scraper
 * Downloads any standard RSS/Atom job feed, parses it, 
 * and filters items based on keywords and category.
 */
export async function scrapeRssFeed(feedUrl, keywords, countryCode, categoryId) {
  if (!feedUrl) return [];

  console.log(`🌐 Scanning RSS Feed [${feedUrl}] for [${keywords.join(', ')}]...`);
  const jobs = [];

  try {
    const response = await axios.get(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const xml = response.data;
    
    // Extract feed items (support both <item> and <entry> tags)
    const isAtom = xml.includes('<entry>');
    const items = isAtom 
      ? xml.match(/<entry>([\s\S]*?)<\/entry>/g) || []
      : xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    console.log(`ℹ️ RSS Feed: Found ${items.length} total raw items`);

    for (const item of items) {
      const titleMatch = isAtom 
        ? item.match(/<title>([\s\S]*?)<\/title>/)
        : item.match(/<title>([\s\S]*?)<\/title>/);
        
      const linkMatch = isAtom
        ? item.match(/<link[\s\S]*?href="([\s\S]*?)"/) || item.match(/<link>([\s\S]*?)<\/link>/)
        : item.match(/<link>([\s\S]*?)<\/link>/);

      const descMatch = isAtom
        ? item.match(/<summary>([\s\S]*?)<\/summary>/) || item.match(/<content>([\s\S]*?)<\/content>/)
        : item.match(/<description>([\s\S]*?)<\/description>/);

      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace('<![CDATA[', '').replace(']]>', '').trim();
        const url = linkMatch[1].trim();
        const description = descMatch 
          ? descMatch[1].replace('<![CDATA[', '').replace(']]>', '').replace(/<\/?[^>]+(>|$)/g, "").trim()
          : '';

        // Search within title and description
        const searchSpace = `${title} ${description}`.toLowerCase();
        
        // Check if any keyword matches
        const matchesKeyword = keywords.length === 0 || keywords.some(kw => searchSpace.includes(kw.toLowerCase()));

        if (matchesKeyword) {
          // Attempt to extract company (often "Job Title at Company Name" or "Job Title (Company)")
          let company = 'RSS Partner';
          if (title.includes(' at ')) {
            company = title.split(' at ')[1];
          } else if (title.includes(' - ')) {
            company = title.split(' - ')[1];
          } else if (title.includes(' (')) {
            const start = title.indexOf(' (');
            const end = title.indexOf(')', start);
            if (end !== -1) {
              company = title.substring(start + 2, end);
            }
          }

          jobs.push({
            title: title.split(' at ')[0].split(' - ')[0].trim(),
            company: company.trim(),
            location: countryCode === 'ma' ? 'Maroc' : countryCode === 'fr' ? 'France' : 'Canada',
            country: countryCode.toLowerCase(),
            source: 'rss_feed',
            url: url,
            description: description.substring(0, 300) + '...',
            category: categoryId,
            postedDate: new Date().toISOString().split('T')[0]
          });
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error parsing RSS Feed [${feedUrl}]:`, error.message);
  }

  return jobs;
}
