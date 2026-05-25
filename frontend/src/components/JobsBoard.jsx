import React, { useState } from 'react';

export default function JobsBoard({ jobs, config, onUpdateJobStatus }) {
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleBookmarkToggle = async (job) => {
    const newStatus = job.status === 'bookmarked' ? 'new' : 'bookmarked';
    await onUpdateJobStatus(job.id, newStatus);
    
    // Update selected job preview in real-time
    if (selectedJob && selectedJob.id === job.id) {
      setSelectedJob({ ...selectedJob, status: newStatus });
    }
  };

  const handleAppliedToggle = async (job) => {
    const newStatus = job.status === 'applied' ? 'new' : 'applied';
    await onUpdateJobStatus(job.id, newStatus);
    
    // Update selected job preview in real-time
    if (selectedJob && selectedJob.id === job.id) {
      setSelectedJob({ ...selectedJob, status: newStatus });
    }
  };

  // Filter logic
  const filteredJobs = jobs.filter(job => {
    // 1. Text Search
    const searchSpace = `${job.title} ${job.company} ${job.location} ${job.description}`.toLowerCase();
    const matchesSearch = searchSpace.includes(searchTerm.toLowerCase());

    // 2. Category
    const matchesCategory = filterCategory === 'all' || job.category === filterCategory;

    // 3. Country
    const matchesCountry = filterCountry === 'all' || job.country?.toLowerCase() === filterCountry.toLowerCase();

    // 4. Source
    const matchesSource = filterSource === 'all' || job.source?.toLowerCase() === filterSource.toLowerCase();

    // 5. Status
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'bookmarked' && job.status === 'bookmarked') ||
                          (filterStatus === 'applied' && job.status === 'applied') ||
                          (filterStatus === 'new' && job.status === 'new');

    return matchesSearch && matchesCategory && matchesCountry && matchesSource && matchesStatus;
  });

  const flags = { ma: '🇲🇦', fr: '🇫🇷', ca: '🇨🇦', us: '🇺🇸', gb: '🇬🇧' };
  const countryNames = { ma: 'Maroc', fr: 'France', ca: 'Canada', us: 'États-Unis', gb: 'Royaume-Uni' };

  return (
    <div className="animate-fade-in" style={styles.boardContainer}>
      {/* Page Header */}
      <div className="page-header">
        <div className="title-area">
          <h1>Offres d'Emploi</h1>
          <p>Explorez les {filteredJobs.length} offres filtrées parmi {jobs.length} disponibles.</p>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="glass-card" style={styles.filterCard}>
        <div style={styles.searchRow}>
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>
            <input 
              type="text" 
              placeholder="Rechercher par titre, entreprise, mots-clés..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>
        
        <div style={styles.filterGrid}>
          {/* Tech category */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>Domaine Technologique</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="glass-select"
            >
              <option value="all">Tous les domaines</option>
              {config.categories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>Pays</label>
            <select 
              value={filterCountry} 
              onChange={(e) => setFilterCountry(e.target.value)}
              className="glass-select"
            >
              <option value="all">Tous les pays</option>
              {config.countries?.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Source website */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>Plateforme</label>
            <select 
              value={filterSource} 
              onChange={(e) => setFilterSource(e.target.value)}
              className="glass-select"
            >
              <option value="all">Toutes les plateformes</option>
              {config.sources?.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>Statut de Candidature</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="glass-select"
            >
              <option value="all">Tous les statuts</option>
              <option value="new">Nouveaux</option>
              <option value="bookmarked">Sauvegardés (Favoris)</option>
              <option value="applied">Candidature Envoyée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Board Split Layout */}
      <div style={styles.splitContent}>
        {/* Left Side: Cards list */}
        <div style={styles.cardsColumn}>
          {filteredJobs.length === 0 ? (
            <div className="glass-card" style={styles.emptyCard}>
              <span>📂</span>
              <p>Aucune offre d'emploi ne correspond à vos filtres actuels.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const categoryConfig = config.categories?.find(c => c.id === job.category);
              const categoryName = categoryConfig ? categoryConfig.name : job.category;
              
              const isSelected = selectedJob && selectedJob.id === job.id;
              
              return (
                <div 
                  key={job.id} 
                  className="glass-card animate-fade-in"
                  onClick={() => setSelectedJob(job)}
                  style={{
                    ...styles.jobCard,
                    ...(isSelected ? styles.selectedCard : {})
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.jobTitle}>{job.title}</h3>
                      <div style={styles.companyText}>{job.company}</div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmarkToggle(job);
                      }}
                      style={styles.bookmarkBtn}
                    >
                      <span style={{ fontSize: '18px' }}>
                        {job.status === 'bookmarked' || job.status === 'applied' ? '⭐' : '☆'}
                      </span>
                    </button>
                  </div>
                  
                  <div style={styles.locationText}>
                    📍 {job.location}
                  </div>

                  <div style={styles.badgeRow}>
                    <span className="badge badge-purple">{categoryName}</span>
                    <span className="badge badge-indigo">
                      {flags[job.country?.toLowerCase()] || '📍'} {countryNames[job.country?.toLowerCase()] || job.country}
                    </span>
                    <span className="badge badge-gray">{job.source.toUpperCase()}</span>
                    {job.status === 'applied' && (
                      <span className="badge badge-green">Postulé</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Detailed preview panel */}
        {selectedJob && (
          <div className="glass-card animate-fade-in" style={styles.previewPanel}>
            <div style={styles.previewHeader}>
              <button style={styles.closeBtn} onClick={() => setSelectedJob(null)}>✕ Fermer</button>
              <div style={styles.previewButtons}>
                <button 
                  onClick={() => handleBookmarkToggle(selectedJob)} 
                  style={{
                    ...styles.actionBtn,
                    background: selectedJob.status === 'bookmarked' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)'
                  }}
                >
                  ⭐ {selectedJob.status === 'bookmarked' ? 'Sauvegardé' : 'Favori'}
                </button>
                <button 
                  onClick={() => handleAppliedToggle(selectedJob)} 
                  style={{
                    ...styles.actionBtn,
                    background: selectedJob.status === 'applied' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)'
                  }}
                >
                  🚀 {selectedJob.status === 'applied' ? 'Candidature Validée' : 'Marquer comme postulé'}
                </button>
              </div>
            </div>

            <div style={styles.previewContent}>
              <h2 style={styles.previewTitle}>{selectedJob.title}</h2>
              <div style={styles.previewCompany}>{selectedJob.company}</div>
              
              <div style={styles.previewMeta}>
                <div><strong>📍 Ville :</strong> {selectedJob.location}</div>
                <div><strong>🌍 Pays :</strong> {countryNames[selectedJob.country?.toLowerCase()] || selectedJob.country}</div>
                <div><strong>📅 Détecté le :</strong> {selectedJob.scrapedDate}</div>
                <div><strong>📡 Provenance :</strong> {selectedJob.source.toUpperCase()}</div>
              </div>

              <div style={styles.divider} />

              <div style={styles.previewDescriptionArea}>
                <h4 style={{ marginBottom: '12px', color: '#fff' }}>Description de l'offre</h4>
                <p style={styles.previewDescText}>{selectedJob.description}</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.previewFooter}>
                <a 
                  href={selectedJob.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary"
                  style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                >
                  🚀 Postuler directement sur le site d'origine
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  boardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    flex: 1,
    zIndex: 2,
    position: 'relative'
  },
  filterCard: {
    padding: '20px'
  },
  searchRow: {
    marginBottom: '16px'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '4px 16px',
    width: '100%'
  },
  searchIcon: {
    marginRight: '12px',
    color: 'var(--text-secondary)'
  },
  searchInput: {
    background: 'none',
    border: 'none',
    padding: '8px 0',
    color: '#fff',
    width: '100%',
    fontSize: '14px'
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  splitContent: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    flex: 1
  },
  cardsColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: 'calc(100vh - 350px)',
    overflowY: 'auto',
    paddingRight: '6px'
  },
  emptyCard: {
    padding: '50px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    color: 'var(--text-secondary)',
    '& span': {
      fontSize: '40px'
    }
  },
  jobCard: {
    cursor: 'pointer',
    padding: '20px',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)'
    }
  },
  selectedCard: {
    borderColor: 'var(--accent-purple)',
    boxShadow: '0 0 15px rgba(139, 92, 246, 0.15)',
    background: 'rgba(139, 92, 246, 0.04)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '8px'
  },
  jobTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
    lineHeight: '1.3'
  },
  companyText: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--accent-purple)',
    marginTop: '2px'
  },
  bookmarkBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--accent-purple)',
    padding: '4px'
  },
  locationText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '16px'
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  previewPanel: {
    flex: 1,
    position: 'sticky',
    top: '40px',
    maxHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
    padding: '28px',
    animation: 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    overflowY: 'auto'
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'var(--transition-fast)',
    '&:hover': {
      background: 'rgba(255,255,255,0.08)'
    }
  },
  previewButtons: {
    display: 'flex',
    gap: '8px'
  },
  actionBtn: {
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
    transition: 'var(--transition-fast)'
  },
  previewContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  previewTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#fff',
    lineHeight: '1.2'
  },
  previewCompany: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--accent-purple)',
    marginTop: '4px',
    marginBottom: '20px'
  },
  previewMeta: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '16px',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)'
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    margin: '20px 0'
  },
  previewDescriptionArea: {
    flex: 1,
    overflowY: 'auto'
  },
  previewDescText: {
    fontSize: '14px',
    lineHeight: '1.7',
    color: 'var(--text-secondary)',
    whiteSpace: 'pre-line'
  },
  previewFooter: {
    marginTop: 'auto',
    paddingTop: '20px'
  }
};
