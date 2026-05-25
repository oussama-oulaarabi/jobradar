import React from 'react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      )
    },
    {
      id: 'radar',
      label: 'Radar Scan',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
      )
    },
    {
      id: 'jobs',
      label: 'Offres d\'Emploi',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    },
    {
      id: 'config',
      label: 'Configuration',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    }
  ];

  return (
    <aside className="sidebar-container" style={styles.sidebar}>
      <div className="sidebar-logo" style={styles.logoArea}>
        <div style={styles.logoIcon}>📡</div>
        <h2 style={styles.logoText}>Job<span>Radar</span></h2>
      </div>

      <nav className="sidebar-menu" style={styles.menu}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              ...styles.menuItem,
              ...(activeTab === item.id ? styles.menuItemActive : {})
            }}
          >
            <span style={{
              ...styles.icon,
              color: activeTab === item.id ? 'var(--accent-purple)' : 'var(--text-secondary)'
            }}>
              {item.icon}
            </span>
            <span style={styles.label}>{item.label}</span>
            {activeTab === item.id && <div style={styles.activeGlowIndicator} />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer" style={styles.footer}>
        <div style={styles.statusDot} />
        <span style={styles.statusText}>Moteur de Veille Actif</span>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logoArea: {
    padding: '30px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid var(--border-color)'
  },
  logoIcon: {
    fontSize: '24px',
    filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))'
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.03em',
    color: '#fff',
    '& span': {
      color: 'var(--accent-purple)'
    }
  },
  menu: {
    flex: 1,
    padding: '32px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    width: '100%',
    padding: '14px 16px',
    background: 'none',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    textAlign: 'left',
    position: 'relative',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  menuItemActive: {
    color: '#fff',
    background: 'rgba(139, 92, 246, 0.08)'
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease'
  },
  label: {
    fontSize: '14px'
  },
  activeGlowIndicator: {
    position: 'absolute',
    left: 0,
    top: '15%',
    height: '70%',
    width: '3px',
    backgroundColor: 'var(--accent-purple)',
    borderRadius: '0 4px 4px 0',
    boxShadow: '0 0 10px var(--accent-purple)'
  },
  footer: {
    padding: '24px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--accent-green)',
    borderRadius: '50%',
    boxShadow: '0 0 8px var(--accent-green)',
    animation: 'pulse-slow 2s infinite'
  },
  statusText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500'
  }
};
