import React from 'react';

export default function Dashboard({ jobs, config, setActiveTab }) {
  // 1. Calculate stats
  const totalJobs = jobs.length;
  const bookmarkedJobs = jobs.filter(j => j.status === 'bookmarked' || j.status === 'applied').length;
  
  // Scraped today
  const todayStr = new Date().toISOString().split('T')[0];
  const scrapedToday = jobs.filter(j => j.scrapedDate === todayStr).length;
  
  const totalCategories = config.categories?.length || 0;

  // 2. Job Domain distribution calculation
  const categoryCounts = {};
  config.categories?.forEach(c => {
    categoryCounts[c.id] = { name: c.name, count: 0 };
  });
  
  jobs.forEach(j => {
    if (categoryCounts[j.category]) {
      categoryCounts[j.category].count += 1;
    }
  });

  const categoryChartData = Object.values(categoryCounts).sort((a, b) => b.count - a.count);
  const maxCategoryCount = Math.max(...categoryChartData.map(c => c.count), 1);

  // 3. Country distribution calculation
  const countryCounts = {
    ma: { name: 'Maroc', count: 0, flag: '🇲🇦' },
    fr: { name: 'France', count: 0, flag: '🇫🇷' },
    ca: { name: 'Canada', count: 0, flag: '🇨🇦' }
  };

  jobs.forEach(j => {
    const code = j.country?.toLowerCase();
    if (countryCounts[code]) {
      countryCounts[code].count += 1;
    }
  });

  const countryChartData = Object.values(countryCounts).sort((a, b) => b.count - a.count);
  const maxCountryCount = Math.max(...countryChartData.map(c => c.count), 1);

  // 4. Source platform distribution
  const sourceCounts = {};
  jobs.forEach(j => {
    const src = j.source || 'Autre';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  // 5. Get 4 most recent jobs
  const recentJobs = jobs.slice(0, 4);

  return (
    <div className="animate-fade-in" style={{ position: 'relative', zindex: 2 }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="title-area">
          <h1>Tableau de Bord</h1>
          <p>Statistiques et analyse en temps réel de votre veille d'emploi.</p>
        </div>
        <button className="btn-primary" onClick={() => setActiveTab('radar')}>
          <span>⚡ Scanner maintenant</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div style={styles.statsRow}>
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statIcon}>🔍</div>
          <div>
            <div style={styles.statLabel}>Offres Agrégées</div>
            <div style={styles.statValue}>{totalJobs}</div>
          </div>
        </div>
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statIcon} className="text-purple">⭐️</div>
          <div>
            <div style={styles.statLabel}>Sauvegardées / Postulées</div>
            <div style={styles.statValue}>{bookmarkedJobs}</div>
          </div>
        </div>
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statIcon} className="text-green">📈</div>
          <div>
            <div style={styles.statLabel}>Trouvées Aujourd'hui</div>
            <div style={styles.statValue}>{scrapedToday}</div>
          </div>
        </div>
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statIcon} className="text-indigo">📂</div>
          <div>
            <div style={styles.statLabel}>Domaines Technologiques</div>
            <div style={styles.statValue}>{totalCategories}</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={styles.chartsGrid}>
        {/* Chart 1: Distribution by Domain */}
        <div className="glass-card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Répartition par Domaine Technologique</h3>
          <div style={styles.barChartContainer}>
            {categoryChartData.map((item, idx) => {
              const percentage = Math.round((item.count / totalJobs) * 100) || 0;
              const fillWidth = (item.count / maxCategoryCount) * 100;
              return (
                <div key={idx} style={styles.chartRow}>
                  <div style={styles.chartLabelText}>{item.name}</div>
                  <div style={styles.barWrapper}>
                    <div style={styles.barTrack}>
                      <div 
                        style={{
                          ...styles.barFill,
                          width: `${fillWidth}%`,
                          background: 'linear-gradient(90deg, var(--accent-purple) 0%, var(--accent-indigo) 100%)'
                        }} 
                      />
                    </div>
                    <div style={styles.barCount}>{item.count} ({percentage}%)</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Distribution by Country */}
        <div className="glass-card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Répartition par Pays Cible</h3>
          <div style={styles.barChartContainer}>
            {countryChartData.map((item, idx) => {
              const percentage = Math.round((item.count / totalJobs) * 100) || 0;
              const fillWidth = (item.count / maxCountryCount) * 100;
              return (
                <div key={idx} style={styles.chartRow}>
                  <div style={styles.chartLabelText}>
                    <span style={{ marginRight: '8px' }}>{item.flag}</span>
                    {item.name}
                  </div>
                  <div style={styles.barWrapper}>
                    <div style={styles.barTrack}>
                      <div 
                        style={{
                          ...styles.barFill,
                          width: `${fillWidth}%`,
                          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                        }} 
                      />
                    </div>
                    <div style={styles.barCount}>{item.count} ({percentage}%)</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Columns Layout */}
      <div style={styles.bottomGrid}>
        {/* Column 1: Source Platforms split */}
        <div className="glass-card" style={{ ...styles.chartCard, flex: 1.2 }}>
          <h3 style={styles.chartTitle}>Sources d'Offres d'Emploi</h3>
          <div style={styles.sourcesContainer}>
            {Object.entries(sourceCounts).map(([source, count], idx) => {
              const percentage = Math.round((count / totalJobs) * 100) || 0;
              const sourceColors = {
                linkedin: 'var(--accent-indigo)',
                indeed: 'var(--accent-purple)',
                rekrute: 'var(--accent-yellow)',
                jooble: 'var(--accent-green)',
                adzuna: 'var(--accent-red)'
              };
              const color = sourceColors[source.toLowerCase()] || 'var(--text-secondary)';
              
              return (
                <div key={idx} style={styles.sourceItem}>
                  <div style={styles.sourceMeta}>
                    <div style={{ ...styles.sourceIndicator, backgroundColor: color }} />
                    <span style={styles.sourceName}>{source.toUpperCase()}</span>
                  </div>
                  <div style={styles.sourceStats}>
                    <span style={styles.sourceCount}>{count} offres</span>
                    <span style={styles.sourcePercentage}>{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Recent job alerts */}
        <div className="glass-card" style={{ ...styles.chartCard, flex: 2 }}>
          <h3 style={styles.chartTitle}>Dernières Offres Détectées</h3>
          <div style={styles.recentList}>
            {recentJobs.length === 0 ? (
              <div style={styles.emptyRecent}>Aucune offre disponible. Lancez un scan !</div>
            ) : (
              recentJobs.map((job, idx) => (
                <div key={idx} style={styles.recentItem}>
                  <div style={styles.recentItemMain}>
                    <div style={styles.recentTitle}>{job.title}</div>
                    <div style={styles.recentCompany}>
                      {job.company} • <span style={styles.recentLocation}>{job.location}</span>
                    </div>
                  </div>
                  <div style={styles.recentItemMeta}>
                    <span className="badge badge-gray">{job.source.toUpperCase()}</span>
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="badge badge-purple"
                      style={{ cursor: 'pointer' }}
                    >
                      Postuler
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  statIcon: {
    fontSize: '28px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    width: '54px',
    height: '54px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 0 10px rgba(255,255,255,0.01)'
  },
  statLabel: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '2px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'var(--font-title)'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  chartCard: {
    padding: '28px'
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '24px',
    color: '#fff',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    paddingBottom: '12px'
  },
  barChartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  chartRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  chartLabelText: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-secondary)'
  },
  barWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  barTrack: {
    flex: 1,
    height: '8px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  barCount: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    minWidth: '70px',
    textAlign: 'right'
  },
  bottomGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px'
  },
  sourcesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sourceItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: 'var(--border-radius-sm)'
  },
  sourceMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  sourceIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  sourceName: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  sourceStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  sourceCount: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontWeight: '500'
  },
  sourcePercentage: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--accent-purple)'
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  emptyRecent: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-secondary)'
  },
  recentItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 'var(--border-radius-sm)',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(255,255,255,0.04)',
      borderColor: 'var(--border-color-hover)'
    }
  },
  recentItemMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  recentTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff'
  },
  recentCompany: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  recentLocation: {
    color: 'var(--text-muted)'
  },
  recentItemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};
