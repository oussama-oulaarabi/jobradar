import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const JSON_DB_PATH = path.resolve(__dirname, '../../../frontend/public/data/jobs.json');
const CONFIG_PATH = path.resolve(__dirname, '../../../frontend/public/data/config.json');
const SQLITE_DB_PATH = path.resolve(__dirname, '../jobs.db');

export class DbManager {
  constructor() {
    // Detect environment
    this.isServerless = process.env.GITHUB_ACTIONS === 'true' || process.env.SERVERLESS === 'true';
    this.sqliteDb = null;
  }

  async init() {
    // Ensure data directories exist
    const jsonDir = path.dirname(JSON_DB_PATH);
    if (!fs.existsSync(jsonDir)) {
      fs.mkdirSync(jsonDir, { recursive: true });
    }
    const backendDir = path.dirname(SQLITE_DB_PATH);
    if (!fs.existsSync(backendDir)) {
      fs.mkdirSync(backendDir, { recursive: true });
    }

    // Initialize Config if not exists
    if (!fs.existsSync(CONFIG_PATH)) {
      const defaultConfig = {
        categories: [
          {
            id: 'devops',
            name: 'DevOps & Infrastructures',
            keywords: ['DevOps', 'Kubernetes', 'Docker', 'CI/CD', 'Jenkins', 'Ansible', 'Terraform', 'GitHub', 'GitLab', 'Jira']
          },
          {
            id: 'cloud',
            name: 'Cloud Computing (AWS / Azure)',
            keywords: ['AWS', 'Azure', 'Cloud Engineer', 'Cloud Architect', 'EC2', 'S3', 'EKS', 'AKS']
          },
          {
            id: 'mlops',
            name: 'MLOps & Orchestration',
            keywords: ['MLOps', 'GitOps', 'Airflow', 'MLflow', 'Kubeflow', 'ArgoCD', 'DVC']
          },
          {
            id: 'databases-dw',
            name: 'Bases de Données & Data Warehouse',
            keywords: ['MySQL', 'HBase', 'Elasticsearch', 'Snowflake', 'BigQuery', 'Data Warehouse', 'ClickHouse']
          },
          {
            id: 'observability',
            name: 'Observabilité & Métriques',
            keywords: ['ELK', 'Elasticsearch', 'Logstash', 'Kibana', 'Grafana', 'Prometheus', 'Observability', 'APM']
          },
          {
            id: 'bigdata',
            name: 'Big Data & Data Engineering',
            keywords: ['Big Data', 'Spark', 'Hadoop', 'Kafka', 'Scala', 'Databricks', 'Data Engineer']
          },
          {
            id: 'java-spring',
            name: 'Java & Spring Ecosystem',
            keywords: ['Java', 'Spring Boot', 'Spring Cloud', 'Hibernate', 'Microservices']
          },
          {
            id: 'frontend',
            name: 'Frontend Modern (React)',
            keywords: ['React', 'Next.js', 'Vite', 'TypeScript', 'Tailwind', 'Frontend']
          }
        ],
        countries: [
          { code: 'ma', name: 'Maroc', enabled: true },
          { code: 'fr', name: 'France', enabled: true },
          { code: 'ca', name: 'Canada', enabled: true }
        ],
        sources: [
          { id: 'jooble', name: 'Jooble API', enabled: true },
          { id: 'adzuna', name: 'Adzuna API', enabled: true },
          { id: 'linkedin', name: 'LinkedIn Public', enabled: true },
          { id: 'indeed', name: 'Indeed Public', enabled: true },
          { id: 'rekrute', name: 'Rekrute (Maroc)', enabled: true }
        ],
        telegram: {
          enabled: true,
          botToken: process.env.TELEGRAM_BOT_TOKEN || '',
          chatId: process.env.TELEGRAM_CHAT_ID || ''
        },
        cron: '0 18 * * *' // Everyday at 6 PM local time
      };
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2), 'utf-8');
    }

    // Initialize Jobs JSON if not exists
    if (!fs.existsSync(JSON_DB_PATH)) {
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
    }

    if (this.isServerless) {
      console.log('📦 Database initialized in Serverless Mode (Flat JSON DB)');
      return;
    }

    // SQLite mode for local server
    console.log('📦 Database initialized in Local Server Mode (SQLite DB)');
    return new Promise((resolve, reject) => {
      this.sqliteDb = new sqlite3.Database(SQLITE_DB_PATH, (err) => {
        if (err) return reject(err);
        
        // Create jobs table
        this.sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            title TEXT,
            company TEXT,
            location TEXT,
            country TEXT,
            source TEXT,
            url TEXT,
            description TEXT,
            category TEXT,
            posted_date TEXT,
            scraped_date TEXT,
            status TEXT DEFAULT 'new'
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  // Get configuration
  getConfig() {
    try {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading config file', e);
      return {};
    }
  }

  // Save configuration
  saveConfig(config) {
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error('Error writing config file', e);
      return false;
    }
  }

  // Get all jobs
  async getJobs() {
    if (this.isServerless) {
      try {
        const data = fs.readFileSync(JSON_DB_PATH, 'utf-8');
        return JSON.parse(data);
      } catch (e) {
        return [];
      }
    }

    return new Promise((resolve, reject) => {
      this.sqliteDb.all('SELECT * FROM jobs ORDER BY scraped_date DESC', [], (err, rows) => {
        if (err) reject(err);
        else {
          // Map snake_case database schema to standard camelCase/javascript objects
          const jobs = rows.map(r => ({
            id: r.id,
            title: r.title,
            company: r.company,
            location: r.location,
            country: r.country,
            source: r.source,
            url: r.url,
            description: r.description,
            category: r.category,
            postedDate: r.posted_date,
            scrapedDate: r.scraped_date,
            status: r.status
          }));
          resolve(jobs);
        }
      });
    });
  }

  // Save/add jobs (handles deduplication)
  // Returns the list of newly added jobs
  async addJobs(scrapedJobs) {
    const existingJobs = await this.getJobs();
    const existingIds = new Set(existingJobs.map(j => j.id));
    const newJobsToAdd = [];

    // Helper to generate a unique hash for each job
    const generateId = (job) => {
      const uniqueString = `${job.title}-${job.company}-${job.country}-${job.source}`.toLowerCase().replace(/[^a-z0-9]/g, '');
      let hash = 0;
      for (let i = 0; i < uniqueString.length; i++) {
        hash = (hash << 5) - hash + uniqueString.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return 'job_' + Math.abs(hash).toString(36);
    };

    const scrapedDate = new Date().toISOString().split('T')[0];

    for (const job of scrapedJobs) {
      const id = job.id || generateId(job);
      if (!existingIds.has(id)) {
        const newJob = {
          ...job,
          id,
          scrapedDate,
          status: 'new'
        };
        newJobsToAdd.push(newJob);
        existingIds.add(id);
      }
    }

    if (newJobsToAdd.length === 0) {
      return [];
    }

    if (this.isServerless) {
      const allJobs = [...newJobsToAdd, ...existingJobs];
      // Limit to last 1000 jobs to avoid massive file growth on GitHub
      const truncatedJobs = allJobs.slice(0, 1000);
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(truncatedJobs, null, 2), 'utf-8');
      return newJobsToAdd;
    }

    // SQLite mode: Bulk insert
    return new Promise((resolve, reject) => {
      const stmt = this.sqliteDb.prepare(`
        INSERT OR IGNORE INTO jobs (id, title, company, location, country, source, url, description, category, posted_date, scraped_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      this.sqliteDb.serialize(() => {
        this.sqliteDb.run("BEGIN TRANSACTION");
        for (const job of newJobsToAdd) {
          stmt.run(
            job.id,
            job.title,
            job.company,
            job.location,
            job.country,
            job.source,
            job.url,
            job.description || '',
            job.category || '',
            job.postedDate || scrapedDate,
            job.scrapedDate
          );
        }
        this.sqliteDb.run("COMMIT", (err) => {
          if (err) reject(err);
          else resolve(newJobsToAdd);
        });
      });
      stmt.finalize();
    });
  }

  // Update status (e.g. bookmarked, applied)
  async updateJobStatus(jobId, status) {
    if (this.isServerless) {
      const jobs = await this.getJobs();
      const jobIdx = jobs.findIndex(j => j.id === jobId);
      if (jobIdx !== -1) {
        jobs[jobIdx].status = status;
        fs.writeFileSync(JSON_DB_PATH, JSON.stringify(jobs, null, 2), 'utf-8');
        return true;
      }
      return false;
    }

    return new Promise((resolve, reject) => {
      this.sqliteDb.run('UPDATE jobs SET status = ? WHERE id = ?', [status, jobId], (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }
}

export const db = new DbManager();
