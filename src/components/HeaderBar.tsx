import React from 'react';

const HeaderBar: React.FC = () => {
  return (
    <div style={styles.headerContainer}>
      {/* Main Header */}
      <header style={styles.header}>
        <div style={styles.content}>
          {/* Logo */}
          <div style={styles.logoWrapper}>
            <svg style={styles.logo} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              {/* Football/stats icon */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="2"/>
              <circle cx="50" cy="50" r="35" fill="none" stroke="#003da5" strokeWidth="1.5"/>
              <line x1="50" y1="15" x2="50" y2="85" stroke="#FF6B35" strokeWidth="2"/>
              <line x1="15" y1="50" x2="85" y2="50" stroke="#1f2937" strokeWidth="1"/>
              <circle cx="50" cy="50" r="4" fill="#003da5"/>
            </svg>
          </div>

          {/* Text */}
          <h1 style={styles.brandText}>FinalScore</h1>
        </div>
      </header>

      {/* Divider Line */}
      <div style={styles.dividerLine}></div>

      {/* Football Pitch Center Line */}
      <div style={styles.pitchLine}></div>
    </div>
  );
};

const styles = {
  headerContainer: {
    width: '100%',
  } as React.CSSProperties,

  header: {
    backgroundColor: '#f5f5f5',
    padding: '20px 0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto',
    paddingX: '24px',
  } as React.CSSProperties,

  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50px',
    height: '50px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, opacity 0.3s ease',
  } as React.CSSProperties,

  logo: {
    width: '50px',
    height: '50px',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'scale(1.1)',
    },
  } as React.CSSProperties,

  brandText: {
    margin: '0',
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: '3px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  } as React.CSSProperties,

  dividerLine: {
    height: '2px',
    backgroundColor: '#e5e7eb',
    width: '100%',
  } as React.CSSProperties,

  pitchLine: {
    height: '1px',
    backgroundColor: '#d1d5db',
    width: '100%',
    position: 'relative' as const,
    backgroundImage: 'repeating-linear-gradient(90deg, #d1d5db 0px, #d1d5db 40px, transparent 40px, transparent 60px)',
  } as React.CSSProperties,
};

export default HeaderBar;
