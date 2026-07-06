import React from 'react';

/**
 * Header Component
 * Contains navigation, mode switching, sound toggles, and theme controller.
 */
export default function Header({ 
  view, 
  setView, 
  currentMode, 
  setViewMode, 
  soundEnabled, 
  setSoundEnabled, 
  theme, 
  toggleTheme,
  isRunning
}) {
  const getHeaderTitle = () => {
    if (view === 'sorting') return 'AlgoViz Sorting';
    if (view === 'searching') return 'AlgoViz Searching';
    return 'AlgoViz';
  };

  const getHeaderIcon = () => {
    if (view === 'sorting') return '📊';
    if (view === 'searching') return '🔍';
    return '✨';
  };

  return (
    <header>
      <div className="logo-container">
        {view !== 'landing' && (
          <button 
            onClick={() => setView('landing')} 
            className="btn btn-toggle btn-back" 
            style={{ textDecoration: 'none' }}
            disabled={isRunning}
          >
            <span>🏠</span> <span className="home-text">Home</span>
          </button>
        )}
        <div className="logo-icon">{getHeaderIcon()}</div>
        <div>
          <h1>{getHeaderTitle()}</h1>
        </div>
      </div>
      
      <div className="global-settings">
        {view !== 'landing' && (
          <>
            <div className="btn-group">
              <button 
                id="mode-single" 
                className={`btn btn-toggle ${currentMode === 'single' ? 'btn-primary' : ''}`}
                onClick={() => setViewMode('single')}
                disabled={isRunning}
              >
                Single Mode
              </button>
              <button 
                id="mode-dual" 
                className={`btn btn-toggle ${currentMode === 'dual' ? 'btn-primary' : ''}`}
                onClick={() => setViewMode('dual')}
                disabled={isRunning}
              >
                Comparison Mode
              </button>
            </div>
            <button 
              id="sound-toggle" 
              className={`btn btn-toggle ${soundEnabled ? 'btn-primary' : ''}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              <span>{soundEnabled ? '🔊' : '🔇'}</span> <span className="sound-toggle-text">Sound {soundEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </>
        )}
        <button id="theme-toggle" className="btn btn-toggle" onClick={toggleTheme}>
          <span>{theme === 'light' ? '🌙' : '☀'}</span> <span className="theme-toggle-text">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>
    </header>
  );
}
