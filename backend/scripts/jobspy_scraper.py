import sys
import os
import json
from datetime import datetime

# Helper to check and install jobspy if missing
try:
    from jobspy import scrape_jobs
except ImportError:
    import subprocess
    print("[INFO] python-jobspy not found. Installing now...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-jobspy"])
    from jobspy import scrape_jobs

def load_config():
    # Read frontend config.json
    config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../frontend/public/data/config.json'))
    if not os.path.exists(config_path):
        # Fallback to local config
        config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../database/config.json'))
        
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[ERROR] Error reading config: {e}")
        return None

def main():
    print("--- Starting python-jobspy Scraper Engine ---")
    config = load_config()
    if not config:
        sys.exit(1)

    active_countries = [c for c in config.get('countries', []) if c.get('enabled')]
    categories = config.get('categories', [])
    
    # Map country codes to jobspy search queries
    country_names = {
        'ma': 'Morocco',
        'fr': 'France',
        'ca': 'Canada'
    }
    
    # Map country codes to indeed country domains
    indeed_countries = {
        'ma': 'morocco',
        'fr': 'france',
        'ca': 'canada'
    }

    scraped_jobs = []

    for country in active_countries:
        code = country.get('code').lower()
        country_name = country_names.get(code, 'France')
        indeed_c = indeed_countries.get(code, 'france')
        
        print(f"\nCountry: {country.get('name').upper()} ({code.upper()})")

        for category in categories:
            cat_id = category.get('id')
            cat_name = category.get('name')
            keywords = category.get('keywords', [])
            
            print(f"Category: [{cat_name}]")
            
            for keyword in keywords:
                print(f"  Scraping keyword: '{keyword}'...")
                try:
                    # Run JobSpy scraping
                    jobs_df = scrape_jobs(
                        site_name=["indeed", "linkedin", "glassdoor", "zip_recruiter"],
                        search_term=keyword,
                        location=country_name,
                        results_wanted=6,  # keep it small and fast per keyword
                        hours_old=48,     # get only fresh jobs from the last 48 hours!
                        country_indeed=indeed_c
                    )
                    
                    if not jobs_df.empty:
                        # Convert Pandas DataFrame rows to our standard JSON schema
                        for _, row in jobs_df.iterrows():
                            # Extract company
                            company = str(row.get('company', 'N/A'))
                            if company == 'nan' or not company:
                                company = 'N/A'
                                
                            # Extract location
                            loc = str(row.get('location', country_name))
                            if loc == 'nan' or not loc:
                                loc = country_name

                            # Extract date
                            date_posted = str(row.get('date_posted', ''))
                            if date_posted == 'NaT' or date_posted == 'nan' or not date_posted:
                                date_posted = datetime.today().strftime('%Y-%m-%d')
                            else:
                                # Clean date string
                                date_posted = date_posted.split(' ')[0]

                            scraped_jobs.append({
                                'title': str(row.get('title', keyword)),
                                'company': company,
                                'location': loc,
                                'country': code,
                                'source': str(row.get('site', 'jobspy')).lower(),
                                'url': str(row.get('job_url', '#')),
                                'description': str(row.get('description', 'Consultation directe sur le site d\'origine.')),
                                'category': cat_id,
                                'postedDate': date_posted
                            })
                        print(f"  Found {len(jobs_df)} jobs for '{keyword}'")
                    else:
                        print(f"  No jobs found for '{keyword}'")
                except Exception as e:
                    print(f"  JobSpy error for '{keyword}': {e}")

    # Output results in a temporary JSON file so Node.js can read it safely
    output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../jobspy_results.json'))
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(scraped_jobs, f, ensure_ascii=False, indent=2)

    print(f"\npython-jobspy completed! Saved {len(scraped_jobs)} raw jobs to backend/jobspy_results.json")

if __name__ == '__main__':
    main()
