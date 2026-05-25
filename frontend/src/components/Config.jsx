import React, { useState } from 'react';

export default function Config({ config, onSaveConfig }) {
  const [activeSubTab, setActiveSubTab] = useState('categories');
  
  // Local states for inputs
  const [categories, setCategories] = useState(config.categories || []);
  const [countries, setCountries] = useState(config.countries || []);
  const [sources, setSources] = useState(config.sources || []);
  const [telegram, setTelegram] = useState(config.telegram || { enabled: false, botToken: '', chatId: '' });
  
  // Custom keyword inputs per category
  const [newKeywordInputs, setNewKeywordInputs] = useState({});

  // Telegram test state
  const [testStatus, setTestStatus] = useState({ idle: true, loading: false, success: null, message: '' });

  // Save full configuration
  const handleSave = () => {
    const updatedConfig = {
      categories,
      countries,
      sources,
      telegram,
      cron: config.cron || '0 8 * * *'
    };
    onSaveConfig(updatedConfig);
  };

  // Toggle country checkbox
  const handleCountryToggle = (code) => {
    setCountries(countries.map(c => 
      c.code === code ? { ...c, enabled: !c.enabled } : c
    ));
  };

  // Toggle source checkbox
  const handleSourceToggle = (id) => {
    setSources(sources.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  // Update specific source API key
  const handleSourceKeyChange = (id, key, value) => {
    setSources(sources.map(s => 
      s.id === id ? { ...s, [key]: value } : s
    ));
  };

  // Remove tag keyword from category
  const handleRemoveKeyword = (catId, keywordToRemove) => {
    setCategories(categories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          keywords: c.keywords.filter(k => k !== keywordToRemove)
        };
      }
      return c;
    }));
  };

  // Add tag keyword to category
  const handleAddKeyword = (catId) => {
    const input = newKeywordInputs[catId] || '';
    if (!input.trim()) return;

    setCategories(categories.map(c => {
      if (c.id === catId) {
        if (c.keywords.includes(input.trim())) return c; // avoid duplicates
        return {
          ...c,
          keywords: [...c.keywords, input.trim()]
        };
      }
      return c;
    }));

    setNewKeywordInputs({
      ...newKeywordInputs,
      [catId]: ''
    });
  };

  // Test Telegram Bot integration
  const handleTestTelegram = async () => {
    setTestStatus({ idle: false, loading: true, success: null, message: 'Envoi du message de test...' });
    
    try {
      const isLocalServer = window.location.hostname === 'localhost' || window.location.port === '3000';
      
      if (!isLocalServer) {
        // Mock connection test for static Pages demo
        await new Promise(resolve => setTimeout(resolve, 1500));
        setTestStatus({
          idle: false,
          loading: false,
          success: true,
          message: 'Message de test simulé avec succès ! (Vérifiez les secrets dans GitHub Actions).'
        });
      } else {
        // Local server API call
        const response = await fetch('/api/config/telegram-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            botToken: telegram.botToken,
            chatId: telegram.chatId
          })
        });

        const data = await response.json();
        
        if (data.success) {
          setTestStatus({
            idle: false,
            loading: false,
            success: true,
            message: 'Message de test envoyé sur votre Telegram ! Vérifiez votre application.'
          });
        } else {
          setTestStatus({
            idle: false,
            loading: false,
            success: false,
            message: data.error || 'Erreur lors de l\'envoi du message.'
          });
        }
      }
    } catch (e) {
      setTestStatus({
        idle: false,
        loading: false,
        success: false,
        message: `Erreur critique : ${e.message}`
      });
    }
  };

  // Universal CSV/JSON local manual file import parsing
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!Array.isArray(json)) {
          alert('Erreur: Le fichier JSON doit être un tableau d\'offres.');
          return;
        }

        const isLocalServer = window.location.hostname === 'localhost' || window.location.port === '3000';
        
        if (!isLocalServer) {
          alert(`Simulation réussie ! ${json.length} offres importées virtuellement.`);
        } else {
          const response = await fetch('/api/jobs/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobs: json })
          });
          const data = await response.json();
          if (data.success) {
            alert(`Succès ! ${data.count} nouvelles offres importées et enregistrées !`);
          } else {
            alert(`Erreur: ${data.error}`);
          }
        }
      } catch (err) {
        alert('Erreur de lecture du fichier JSON : ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, zIndex: 2 }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="title-area">
          <h1>Configuration</h1>
          <p>Personnalisez vos mots-clés, vos pays de recherche, et configurez votre robot Telegram.</p>
        </div>
        <button className="btn-primary" onClick={handleSave}>
          <span>💾 Enregistrer les réglages</span>
        </button>
      </div>

      {/* Sub tabs Navigation */}
      <div style={styles.tabNavbar}>
        <button 
          onClick={() => setActiveSubTab('categories')} 
          style={{ ...styles.tabLink, ...(activeSubTab === 'categories' ? styles.tabLinkActive : {}) }}
        >
          📂 Domaines & Mots-clés
        </button>
        <button 
          onClick={() => setActiveSubTab('countries')} 
          style={{ ...styles.tabLink, ...(activeSubTab === 'countries' ? styles.tabLinkActive : {}) }}
        >
          🌍 Pays & Sources
        </button>
        <button 
          onClick={() => setActiveSubTab('telegram')} 
          style={{ ...styles.tabLink, ...(activeSubTab === 'telegram' ? styles.tabLinkActive : {}) }}
        >
          🤖 Robot Telegram
        </button>
        <button 
          onClick={() => setActiveSubTab('import')} 
          style={{ ...styles.tabLink, ...(activeSubTab === 'import' ? styles.tabLinkActive : {}) }}
        >
          📥 Importateur
        </button>
      </div>

      {/* Tab Panels */}
      <div style={styles.panelContainer}>
        {/* Panel 1: Categories & Keywords */}
        {activeSubTab === 'categories' && (
          <div style={styles.panelLayout}>
            {categories.map((cat) => (
              <div key={cat.id} className="glass-card" style={styles.catCard}>
                <h3 style={styles.catTitle}>{cat.name}</h3>
                
                <div style={styles.tagsContainer}>
                  {cat.keywords.map((kw, idx) => (
                    <span key={idx} className="badge badge-purple" style={styles.tagBadge}>
                      {kw}
                      <button 
                        style={styles.deleteTagBtn} 
                        onClick={() => handleRemoveKeyword(cat.id, kw)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div style={styles.addTagRow}>
                  <input 
                    type="text" 
                    placeholder="Ajouter un mot-clé..." 
                    value={newKeywordInputs[cat.id] || ''}
                    onChange={(e) => setNewKeywordInputs({ ...newKeywordInputs, [cat.id]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword(cat.id)}
                    style={styles.addTagInput}
                  />
                  <button className="btn-secondary" onClick={() => handleAddKeyword(cat.id)} style={{ padding: '8px 16px' }}>
                    + Ajouter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Panel 2: Countries and platforms API Keys */}
        {activeSubTab === 'countries' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Countries Checkbox List */}
            <div className="glass-card">
              <h3 style={styles.sectionTitle}>1. Pays Cibles</h3>
              <div style={styles.checkboxGrid}>
                {countries.map(c => (
                  <label key={c.code} style={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={c.enabled} 
                      onChange={() => handleCountryToggle(c.code)}
                      style={styles.checkbox}
                    />
                    <span style={styles.checkboxFlag}>
                      {c.code === 'ma' ? '🇲🇦' : c.code === 'fr' ? '🇫🇷' : c.code === 'ca' ? '🇨🇦' : '📍'}
                    </span>
                    {c.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Sources list & key inputs */}
            <div className="glass-card">
              <h3 style={styles.sectionTitle}>2. Plateformes de recherche et Clés API</h3>
              <div style={styles.sourcesList}>
                {sources.map(s => {
                  const hasApiKeys = s.id === 'jooble' || s.id === 'adzuna';
                  return (
                    <div key={s.id} style={styles.sourceConfigRow}>
                      <div style={styles.sourceHeader}>
                        <label style={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            checked={s.enabled} 
                            onChange={() => handleSourceToggle(s.id)}
                            style={styles.checkbox}
                          />
                          <strong>{s.name}</strong>
                        </label>
                        <span className="badge badge-gray">{s.id.toUpperCase()}</span>
                      </div>

                      {s.enabled && hasApiKeys && (
                        <div style={styles.apiKeysInputs}>
                          {s.id === 'jooble' && (
                            <div style={styles.inputGroup}>
                              <label style={styles.subLabel}>Clé d'API Jooble</label>
                              <input 
                                type="password" 
                                placeholder="Saisir la clé API Jooble..."
                                value={s.apiKey || ''}
                                onChange={(e) => handleSourceKeyChange('jooble', 'apiKey', e.target.value)}
                                className="glass-input"
                              />
                            </div>
                          )}
                          {s.id === 'adzuna' && (
                            <div style={styles.apiKeysSubgrid}>
                              <div style={styles.inputGroup}>
                                <label style={styles.subLabel}>Adzuna App ID</label>
                                <input 
                                  type="text" 
                                  placeholder="Saisir l'App ID..."
                                  value={s.appId || ''}
                                  onChange={(e) => handleSourceKeyChange('adzuna', 'appId', e.target.value)}
                                  className="glass-input"
                                />
                              </div>
                              <div style={styles.inputGroup}>
                                <label style={styles.subLabel}>Adzuna App Key</label>
                                <input 
                                  type="password" 
                                  placeholder="Saisir l'App Key..."
                                  value={s.appKey || ''}
                                  onChange={(e) => handleSourceKeyChange('adzuna', 'appKey', e.target.value)}
                                  className="glass-input"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Panel 3: Telegram bot alerts config */}
        {activeSubTab === 'telegram' && (
          <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
            <h3 style={styles.sectionTitle}>Robot Alertes Telegram 🤖</h3>
            <p style={styles.sectionDesc}>
              Recevez les nouvelles offres d'emploi automatiquement chaque jour sur votre smartphone.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
              <label style={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={telegram.enabled} 
                  onChange={(e) => setTelegram({ ...telegram, enabled: e.target.checked })}
                  style={styles.checkbox}
                />
                Activer les notifications Telegram quotidiennes
              </label>

              {telegram.enabled && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={styles.inputGroup}>
                    <label style={styles.subLabel}>1. Token de Bot Telegram (obtenu via @BotFather)</label>
                    <input 
                      type="password" 
                      placeholder="Ex: 123456789:ABCdefGhIJKlmNoPQRsT..."
                      value={telegram.botToken || ''}
                      onChange={(e) => setTelegram({ ...telegram, botToken: e.target.value })}
                      className="glass-input"
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.subLabel}>2. Chat ID du Canal/Groupe/Discussion (obtenu via @userinfobot)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: -100123456789 ou 987654321"
                      value={telegram.chatId || ''}
                      onChange={(e) => setTelegram({ ...telegram, chatId: e.target.value })}
                      className="glass-input"
                    />
                  </div>

                  <div style={styles.testConnectionBox}>
                    <button 
                      className="btn-secondary" 
                      onClick={handleTestTelegram}
                      disabled={testStatus.loading}
                      style={{ cursor: 'pointer' }}
                    >
                      <span>{testStatus.loading ? '⏳ Test en cours...' : '📡 Tester la connexion'}</span>
                    </button>

                    {!testStatus.idle && (
                      <div style={{
                        ...styles.testBadge,
                        backgroundColor: testStatus.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                        borderColor: testStatus.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                        color: testStatus.success ? 'var(--accent-green)' : 'var(--accent-red)'
                      }}>
                        {testStatus.message}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel 4: Manual job CSV/JSON importer */}
        {activeSubTab === 'import' && (
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', textAlign: 'center', padding: '40px' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📥</span>
            <h3 style={styles.sectionTitle}>Importateur Universel</h3>
            <p style={styles.sectionDesc}>
              Téléversez un fichier JSON contenant une liste d'offres d'emploi personnalisées pour les ajouter instantanément à votre tableau de bord.
            </p>

            <div style={styles.uploadArea}>
              <input 
                type="file" 
                accept=".json" 
                onChange={handleFileUpload} 
                id="file-upload" 
                style={styles.fileInput}
              />
              <label htmlFor="file-upload" className="btn-primary" style={{ cursor: 'pointer' }}>
                Choisir un fichier JSON
              </label>
              <span style={styles.uploadDetails}>Format requis : Tableau JSON d'objets [ {`{ title, company, location, country, source, url, description, category }`} ]</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  tabNavbar: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    gap: '4px',
    paddingBottom: '1px'
  },
  tabLink: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '12px 20px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  tabLinkActive: {
    color: '#fff',
    borderColor: 'var(--accent-purple)',
    background: 'rgba(139, 92, 246, 0.03)'
  },
  panelContainer: {
    marginTop: '12px'
  },
  panelLayout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px'
  },
  catCard: {
    padding: '24px'
  },
  catTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    paddingBottom: '8px'
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
    minHeight: '80px',
    alignContent: 'flex-start'
  },
  tagBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px'
  },
  deleteTagBtn: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: '700',
    opacity: 0.7,
    '&:hover': {
      opacity: 1
    }
  },
  addTagRow: {
    display: 'flex',
    gap: '8px'
  },
  addTagInput: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px 12px',
    color: '#fff',
    width: '100%',
    fontSize: '13px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px'
  },
  sectionDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
    marginTop: '20px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: 'var(--text-primary)',
    cursor: 'pointer'
  },
  checkboxFlag: {
    fontSize: '18px'
  },
  checkbox: {
    accentColor: 'var(--accent-purple)',
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  sourcesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '20px'
  },
  sourceConfigRow: {
    padding: '16px',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)'
  },
  sourceHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  apiKeysInputs: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255,255,255,0.03)'
  },
  apiKeysSubgrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  subLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  testConnectionBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '12px'
  },
  testBadge: {
    padding: '10px 16px',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: '500',
    flex: 1
  },
  uploadArea: {
    marginTop: '32px',
    padding: '30px',
    border: '2px dashed rgba(255,255,255,0.08)',
    borderRadius: 'var(--border-radius-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  fileInput: {
    display: 'none'
  },
  uploadDetails: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  }
};
