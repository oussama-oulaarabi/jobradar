import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Radar from './components/Radar.jsx';
import JobsBoard from './components/JobsBoard.jsx';
import Config from './components/Config.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [config, setConfig] = useState({
    categories: [],
    countries: [],
    sources: [],
    telegram: { enabled: false, botToken: '', chatId: '' }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Detect local server versus static serverless mode
  const isLocalServer = window.location.hostname === 'localhost' || window.location.port === '3000';

  // Load configuration and jobs
  const loadData = async () => {
    setIsLoading(true);
    try {
      if (!isLocalServer) {
        // Mode Serverless (GitHub Pages) - Load static JSON files
        console.log('📦 Loading static resources for GitHub Pages...');
        
        const configRes = await fetch('./data/config.json');
        const configData = await configRes.json();
        setConfig(configData);

        const jobsRes = await fetch('./data/jobs.json');
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      } else {
        // Mode Local Server (REST API)
        console.log('📦 Connecting to local server APIs...');
        
        const configRes = await fetch('/api/config');
        const configData = await configRes.json();
        if (configData.success) setConfig(configData.config);

        const jobsRes = await fetch('/api/jobs');
        const jobsData = await jobsRes.json();
        if (jobsData.success) setJobs(jobsData.jobs);
      }
    } catch (e) {
      console.error('❌ Error fetching data:', e.message);
      // Fallback defaults to let the app open gracefully even if static files are not yet generated
      initializeFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeFallbackData = () => {
    // Basic defaults
    setConfig({
      categories: [
        { id: 'devops', name: 'DevOps & Infrastructures', keywords: ['DevOps', 'Kubernetes', 'Docker', 'Terraform'] },
        { id: 'cloud', name: 'Cloud Computing (AWS / Azure)', keywords: ['AWS', 'Azure', 'Cloud Engineer'] },
        { id: 'observability', name: 'Observabilité & Métriques', keywords: ['ELK', 'Elasticsearch', 'Grafana', 'Prometheus'] },
        { id: 'bigdata', name: 'Big Data & Data Engineering', keywords: ['Big Data', 'Spark', 'Kafka', 'Scala'] },
        { id: 'java-spring', name: 'Java & Spring Ecosystem', keywords: ['Java', 'Spring Boot', 'Hibernate'] },
        { id: 'frontend', name: 'Frontend Modern (React)', keywords: ['React', 'Next.js', 'Vite', 'TypeScript'] }
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
      telegram: { enabled: false, botToken: '', chatId: '' }
    });
    setJobs([]);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update specific job status (bookmarked, applied, etc.)
  const handleUpdateJobStatus = async (jobId, newStatus) => {
    // 1. Optimistic UI update
    setJobs(prevJobs => 
      prevJobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j)
    );

    // 2. Call backend if local server is active
    if (isLocalServer) {
      try {
        await fetch('/api/jobs/bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: jobId, status: newStatus })
        });
      } catch (e) {
        console.error('❌ Failed to update job status on local server:', e.message);
      }
    } else {
      // In static Pages mode, we simulate bookmark persistence using localStorage as fallback
      const savedStatuses = JSON.parse(localStorage.getItem('jobradar_bookmarks') || '{}');
      savedStatuses[jobId] = newStatus;
      localStorage.setItem('jobradar_bookmarks', JSON.stringify(savedStatuses));
      console.log('💾 Status persisted in localStorage (Static Mode)');
    }
  };

  // Save new configuration to backend
  const handleSaveConfig = async (newConfig) => {
    setConfig(newConfig);
    
    if (isLocalServer) {
      try {
        const response = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newConfig)
        });
        const data = await response.json();
        if (data.success) {
          alert('✅ Configuration enregistrée avec succès sur le serveur !');
        } else {
          alert('❌ Erreur lors de la sauvegarde.');
        }
      } catch (e) {
        alert(`❌ Erreur de connexion avec le serveur : ${e.message}`);
      }
    } else {
      // In static Pages mode, we tell them it's saved locally, but they need to put it in their GitHub Secrets/config file for the action
      localStorage.setItem('jobradar_static_config', JSON.stringify(newConfig));
      alert('💾 Configuration sauvegardée LOCALEMENT en mode Démo.\n\n⚠️ IMPORTANT: Pour activer ces réglages dans vos scans GitHub Actions quotidiens, modifiez le fichier config.json dans votre dépôt GitHub et insérez les jetons Telegram dans vos Secrets GitHub !');
    }
  };

  // Callback when a scan finishes
  const handleScanComplete = (newlyAddedJobs) => {
    // Reload all jobs to reflect scan results
    loadData();
  };

  // Merge static localStorage bookmarks back into jobs list in static mode
  const displayedJobs = React.useMemo(() => {
    if (isLocalServer) return jobs;
    
    const savedStatuses = JSON.parse(localStorage.getItem('jobradar_bookmarks') || '{}');
    return jobs.map(j => {
      if (savedStatuses[j.id]) {
        return { ...j, status: savedStatuses[j.id] };
      }
      return j;
    });
  }, [jobs, isLocalServer]);

  // Load stored local config if exists in static mode
  useEffect(() => {
    if (!isLocalServer) {
      const savedConfig = localStorage.getItem('jobradar_static_config');
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (e) {}
      }
    }
  }, [isLocalServer]);

  return (
    <div className="app-container">
      {/* Abstract Glowing shapes */}
      <div className="ambient-background" />
      <div className="ambient-background-2" />

      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel Content */}
      <main className="main-content">
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingPulse}>📡</div>
            <div style={styles.loadingText}>Initialisation de JobRadar...</div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                jobs={displayedJobs} 
                config={config} 
                setActiveTab={setActiveTab} 
              />
            )}
            
            {activeTab === 'radar' && (
              <Radar 
                config={config} 
                onScanComplete={handleScanComplete} 
              />
            )}
            
            {activeTab === 'jobs' && (
              <JobsBoard 
                jobs={displayedJobs} 
                config={config} 
                onUpdateJobStatus={handleUpdateJobStatus} 
              />
            )}
            
            {activeTab === 'config' && (
              <Config 
                config={config} 
                onSaveConfig={handleSaveConfig} 
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: '20px',
    zIndex: 10
  },
  loadingPulse: {
    fontSize: '48px',
    animation: 'spin-slow 6s linear infinite, pulse-slow 2s infinite',
    filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.5))'
  },
  loadingText: {
    fontFamily: 'var(--font-title)',
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    letterSpacing: '0.02em'
  }
};
