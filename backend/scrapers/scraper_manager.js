import { scrapeJooble } from './jooble.js';
import { scrapeAdzuna } from './adzuna.js';
import { scrapeLinkedIn } from './linkedin_scraper.js';
import { scrapeIndeed } from './indeed_scraper.js';
import { scrapeRekrute } from './rekrute_scraper.js';
import { scrapeMockJobs } from './mock_scraper.js';
import { scrapeRssFeed } from './rss_scraper.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Coordinate and run all scrapers based on user configuration
 */
export async function runAllScrapers(config, logCallback = console.log) {
  logCallback('🚀 Starting job aggregation across all sources...');
  
  const allScrapedJobs = [];
  const activeCountries = config.countries.filter(c => c.enabled);
  const activeSources = config.sources.filter(s => s.enabled);
  const categories = config.categories;

  if (activeCountries.length === 0) {
    logCallback('⚠️ No countries enabled in configuration. Aborting search.');
    return [];
  }

  // 1. A. Run JobSpy Python Engine if active (to aggregate LinkedIn, Indeed, Glassdoor, ZipRecruiter)
  if (activeSources.some(s => s.id === 'jobspy')) {
    logCallback('🐍 Executing python-jobspy Scraper Engine (LinkedIn + Indeed + Glassdoor + ZipRecruiter)...');
    try {
      const pythonScript = path.resolve(__dirname, '../scripts/jobspy_scraper.py');
      // Run the python script
      execSync(`python "${pythonScript}"`, { stdio: 'inherit' });
      
      // Read the output JSON file
      const resultsPath = path.resolve(__dirname, '../jobspy_results.json');
      if (fs.existsSync(resultsPath)) {
        const data = fs.readFileSync(resultsPath, 'utf-8');
        const jobs = JSON.parse(data);
        logCallback(`✅ python-jobspy completed successfully! Loaded ${jobs.length} jobs.`);
        allScrapedJobs.push(...jobs);
        
        // Clean up temporary results file
        try {
          fs.unlinkSync(resultsPath);
        } catch (e) {}
      }
    } catch (e) {
      logCallback(`❌ python-jobspy scraper execution failed: ${e.message}`);
    }
  }

  // 1. Check if we should use Mock Scraper
  const isMockEnabled = activeSources.some(s => s.id === 'mock') || 
                       (!process.env.JOOBLE_API_KEY && !process.env.ADZUNA_APP_ID && 
                        !config.telegram.botToken && activeSources.length === 0);

  if (isMockEnabled) {
    logCallback('🤖 Injecting realistic mock jobs (Safe / Demo Mode)...');
    
    // Gather all keywords from all categories
    let allKeywords = [];
    for (const cat of categories) {
      allKeywords.push(...cat.keywords);
    }

    try {
      const mockJobs = await scrapeMockJobs(allKeywords, config.countries, categories);
      logCallback(`✅ Demo Mode: Generated ${mockJobs.length} realistic offers.`);
      return mockJobs;
    } catch (e) {
      logCallback(`❌ Error generating mock jobs: ${e.message}`);
      return [];
    }
  }

  // 2. Real scrapers run
  for (const country of activeCountries) {
    logCallback(`🌍 --- Starting Search for Country: ${country.name.toUpperCase()} (${country.code.toUpperCase()}) ---`);

    for (const category of categories) {
      logCallback(`📂 Category: [${category.name}] with keywords [${category.keywords.join(', ')}]`);
      
      const keywords = category.keywords;
      const countryCode = country.code;
      const categoryId = category.id;

      // Create scraper promises for parallel execution
      const scraperPromises = [];

      // A. Jooble API
      if (activeSources.some(s => s.id === 'jooble')) {
        const apiKey = process.env.JOOBLE_API_KEY || config.sources.find(s => s.id === 'jooble')?.apiKey;
        if (apiKey) {
          scraperPromises.push(
            scrapeJooble(apiKey, keywords, countryCode, categoryId)
              .then(jobs => {
                logCallback(`✅ Jooble API: Found ${jobs.length} jobs for ${category.name}`);
                return jobs;
              })
              .catch(err => {
                logCallback(`❌ Jooble API failed for ${category.name}: ${err.message}`);
                return [];
              })
          );
        } else {
          logCallback(`ℹ️ Jooble API: Skipping (No API key found)`);
        }
      }

      // B. Adzuna API
      if (activeSources.some(s => s.id === 'adzuna')) {
        const appId = process.env.ADZUNA_APP_ID || config.sources.find(s => s.id === 'adzuna')?.appId;
        const appKey = process.env.ADZUNA_APP_KEY || config.sources.find(s => s.id === 'adzuna')?.appKey;
        if (appId && appKey) {
          scraperPromises.push(
            scrapeAdzuna(appId, appKey, keywords, countryCode, categoryId)
              .then(jobs => {
                logCallback(`✅ Adzuna API: Found ${jobs.length} jobs for ${category.name}`);
                return jobs;
              })
              .catch(err => {
                logCallback(`❌ Adzuna API failed for ${category.name}: ${err.message}`);
                return [];
              })
          );
        } else {
          logCallback(`ℹ️ Adzuna API: Skipping (No App ID/Key found)`);
        }
      }

      // C. LinkedIn
      if (activeSources.some(s => s.id === 'linkedin')) {
        scraperPromises.push(
          scrapeLinkedIn(keywords, countryCode, categoryId)
            .then(jobs => {
              logCallback(`✅ LinkedIn Scraper: Found ${jobs.length} jobs for ${category.name}`);
              return jobs;
            })
            .catch(err => {
              logCallback(`❌ LinkedIn Scraper failed for ${category.name}: ${err.message}`);
              return [];
            })
        );
      }

      // D. Indeed
      if (activeSources.some(s => s.id === 'indeed')) {
        scraperPromises.push(
          scrapeIndeed(keywords, countryCode, categoryId)
            .then(jobs => {
              logCallback(`✅ Indeed Scraper: Found ${jobs.length} jobs for ${category.name}`);
              return jobs;
            })
            .catch(err => {
              logCallback(`❌ Indeed Scraper failed for ${category.name}: ${err.message}`);
              return [];
            })
        );
      }

      // E. Rekrute (Morocco only)
      if (activeSources.some(s => s.id === 'rekrute') && countryCode.toLowerCase() === 'ma') {
        scraperPromises.push(
          scrapeRekrute(keywords, countryCode, categoryId)
            .then(jobs => {
              logCallback(`✅ Rekrute Scraper: Found ${jobs.length} jobs for ${category.name}`);
              return jobs;
            })
            .catch(err => {
              logCallback(`❌ Rekrute Scraper failed for ${category.name}: ${err.message}`);
              return [];
            })
        );
      }

      // Wait for all scrapers for this category to finish
      const results = await Promise.all(scraperPromises);
      for (const list of results) {
        if (Array.isArray(list)) {
          allScrapedJobs.push(...list);
        }
      }
    }
  }

  logCallback(`\n✨ Aggregation completed! Total raw offers found: ${allScrapedJobs.length}`);
  return allScrapedJobs;
}
