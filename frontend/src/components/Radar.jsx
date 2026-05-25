import React, { useState, useEffect, useRef } from 'react';

export default function Radar({ config, onScanComplete }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('Prêt à analyser');
  const [logs, setLogs] = useState([
    '[SYSTEM] JobRadar opérationnel et prêt à analyser.',
    '[SYSTEM] Attente du déclenchement manuel ou planifié...'
  ]);
  const [dots, setDots] = useState([]);
  const consoleEndRef = useRef(null);

  // Scroll to bottom of console automatically when new logs arrive
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Generate glowing radar dots when scanning
  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(() => {
        // Generate random coordinates inside a circle (radius 100)
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 90; // max radius 90%
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        const newDot = {
          id: Math.random(),
          top: `calc(50% + ${y}px)`,
          left: `calc(50% + ${x}px)`,
          color: Math.random() > 0.4 ? 'var(--accent-purple)' : 'var(--accent-green)'
        };

        setDots(prev => [...prev.slice(-8), newDot]); // keep last 8 dots max
      }, 400);
    } else {
      setDots([]);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString('fr-FR');
    let prefix = `[${time}] `;
    if (type === 'system') prefix += '⚙️ ';
    if (type === 'success') prefix += '✅ ';
    if (type === 'warning') prefix += '⚠️ ';
    if (type === 'error') prefix += '❌ ';
    
    setLogs(prev => [...prev, `${prefix}${message}`]);
  };

  const triggerScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setLogs([]);
    setDots([]);
    addLog('Initialisation du moteur de recherche JobRadar...', 'system');
    setScanStatus('Initialisation...');

    try {
      addLog('Lecture de la configuration utilisateur...', 'system');
      
      const activeCountries = config.countries.filter(c => c.enabled).map(c => c.name);
      addLog(`Pays cibles activés : ${activeCountries.join(', ')}`, 'info');

      // Check if we are running in local server mode or static mode
      // For static mode (GitHub Pages), the server is not running, so we simulate the scan to let them experience the UI
      const isLocalServer = window.location.hostname === 'localhost' || window.location.port === '3000';
      
      if (!isLocalServer) {
        // Serverless Static Mode (Demo/Simulated Scan)
        addLog('Mode statique GitHub détecté. Lancement d\'une simulation de scan ultra-réaliste...', 'warning');
        addLog('Note: Sur GitHub Actions, ce scan s\'exécute réellement en tâche de fond chaque jour et vous alerte sur Telegram !', 'info');
        
        const sources = config.sources.filter(s => s.enabled).map(s => s.id);
        const categories = config.categories;

        for (const source of sources) {
          setScanStatus(`Scraping ${source.toUpperCase()}...`);
          addLog(`Déconnexion temporaire Cloudflare contournée pour ${source.toUpperCase()}...`, 'info');
          
          for (const cat of categories) {
            await new Promise(resolve => setTimeout(resolve, 800));
            addLog(`[${source.toUpperCase()}] Scan terminé pour ${cat.name} : ${2 + Math.floor(Math.random() * 4)} offres trouvées.`, 'success');
          }
        }

        setScanStatus('Enregistrement...');
        addLog('Sauvegarde des offres dans la base de données statique jobs.json...', 'system');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        addLog('Dédoublonnement complété.', 'success');
        addLog('Envoi de la notification journalière sur Telegram...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1000));
        addLog('Alerte Telegram envoyée avec succès !', 'success');
        
        setIsScanning(false);
        setScanStatus('Scan terminé !');
        addLog('Scan terminé avec succès ! Consultez l\'onglet "Offres d\'Emploi" pour voir les résultats.', 'success');
        
        if (onScanComplete) onScanComplete(null);
      } else {
        // Local Server Mode (Real Scan via REST API)
        addLog('Connexion au serveur Express local...', 'info');
        setScanStatus('Recherche en cours...');

        const response = await fetch('/api/search/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        
        if (data.success) {
          // Print logs returned by the backend
          data.logs.forEach(log => {
            if (log.startsWith('❌')) addLog(log.slice(2), 'error');
            else if (log.startsWith('✅')) addLog(log.slice(2), 'success');
            else if (log.startsWith('⚠️')) addLog(log.slice(2), 'warning');
            else addLog(log);
          });

          addLog(`Recherche achevée ! ${data.scrapedCount} offres analysées, ${data.newlyAddedCount} NOUVELLES offres ajoutées.`, 'success');
          setIsScanning(false);
          setScanStatus('Scan terminé !');
          
          if (onScanComplete) onScanComplete(data.addedJobs);
        } else {
          addLog(data.error || 'Erreur lors du scan.', 'error');
          setIsScanning(false);
          setScanStatus('Échec du scan');
        }
      }
    } catch (error) {
      addLog(`Erreur critique de connexion : ${error.message}`, 'error');
      setIsScanning(false);
      setScanStatus('Échec de la connexion');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1, zIndex: 2 }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="title-area">
          <h1>Radar de Veille</h1>
          <p>Scannez en temps réel les plateformes d'emploi du monde entier.</p>
        </div>
      </div>

      <div style={styles.radarLayout}>
        {/* Left Column: Visual Radar Circle */}
        <div className="glass-card" style={styles.radarCard}>
          <div style={styles.radarScreen}>
            {/* Concentric rings */}
            <div style={{ ...styles.ring, width: '90%', height: '90%' }} />
            <div style={{ ...styles.ring, width: '70%', height: '70%' }} />
            <div style={{ ...styles.ring, width: '50%', height: '50%' }} />
            <div style={{ ...styles.ring, width: '30%', height: '30%' }} />
            <div style={{ ...styles.ring, width: '10%', height: '10%' }} />
            
            {/* Grid Crosslines */}
            <div style={styles.crosslineV} />
            <div style={styles.crosslineH} />

            {/* Rotating Sweep Beam */}
            {isScanning && <div style={styles.radarSweep} />}

            {/* Pulsing Target Dots */}
            {dots.map(dot => (
              <div 
                key={dot.id} 
                style={{ 
                  ...styles.radarDot, 
                  top: dot.top, 
                  left: dot.left, 
                  backgroundColor: dot.color,
                  boxShadow: `0 0 12px ${dot.color}` 
                }} 
              />
            ))}

            {/* Center Hub */}
            <div style={styles.radarCenter}>
              <span style={styles.centerText}>{scanStatus}</span>
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={triggerScan} 
            disabled={isScanning}
            style={styles.scanButton}
          >
            <span>{isScanning ? 'Scan en cours...' : '📡 Démarrer le Scan'}</span>
          </button>
        </div>

        {/* Right Column: Console Logs */}
        <div className="glass-card" style={styles.consoleCard}>
          <div style={styles.consoleHeader}>
            <div style={styles.consoleTitle}>
              <span style={styles.consoleDot} />
              Console de Sortie du Moteur
            </div>
            <span style={styles.consoleStatus}>{isScanning ? 'MOTEUR ACTIF' : 'MOTEUR EN VEILLE'}</span>
          </div>
          <div style={styles.consoleBody}>
            {logs.map((log, idx) => {
              let color = 'var(--text-secondary)';
              if (log.includes('✅') || log.includes('success')) color = 'var(--accent-green)';
              if (log.includes('⚠️') || log.includes('warning')) color = 'var(--accent-yellow)';
              if (log.includes('❌') || log.includes('error')) color = 'var(--accent-red)';
              if (log.includes('⚙️') || log.includes('system')) color = '#fff';
              
              return (
                <div key={idx} style={{ ...styles.logLine, color }}>
                  {log}
                </div>
              );
            })}
            <div ref={consoleEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  radarLayout: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '30px',
    flex: 1
  },
  radarCard: {
    flex: 1,
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  },
  radarScreen: {
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    backgroundColor: '#050508',
    border: '2px solid rgba(139, 92, 246, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 30px rgba(139, 92, 246, 0.15), 0 0 15px rgba(0,0,0,0.5)',
    marginBottom: '32px'
  },
  ring: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    border: '1px solid rgba(139, 92, 246, 0.08)',
    borderRadius: '50%'
  },
  crosslineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: '1px',
    backgroundColor: 'rgba(139, 92, 246, 0.08)'
  },
  crosslineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: '1px',
    backgroundColor: 'rgba(139, 92, 246, 0.08)'
  },
  radarSweep: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'conic-gradient(from 0deg at 50% 50%, rgba(139, 92, 246, 0.4) 0deg, rgba(139, 92, 246, 0) 90deg)',
    animation: 'sweep 3.5s linear infinite',
    borderRadius: '50%',
    transformOrigin: 'center'
  },
  radarDot: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    animation: 'radar-pulse 1.8s ease-out infinite'
  },
  radarCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#0a0a0f',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '6px 12px',
    boxShadow: '0 0 10px rgba(0,0,0,0.8)',
    zIndex: 5
  },
  centerText: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap'
  },
  scanButton: {
    width: '220px'
  },
  consoleCard: {
    flex: 1.5,
    minWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    background: '#040406',
    border: '1px solid var(--border-color)',
    padding: 0
  },
  consoleHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.01)'
  },
  consoleTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  consoleDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-purple)',
    boxShadow: '0 0 6px var(--accent-purple)'
  },
  consoleStatus: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--accent-purple)',
    letterSpacing: '0.05em'
  },
  consoleBody: {
    flex: 1,
    padding: '20px',
    fontFamily: 'var(--font-code)',
    fontSize: '12px',
    lineHeight: '1.8',
    overflowY: 'auto',
    maxHeight: '400px',
    minHeight: '300px'
  },
  logLine: {
    marginBottom: '8px',
    wordBreak: 'break-all'
  }
};
