import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import SortingVisualizer from './pages/SortingVisualizer';
import SearchingVisualizer from './pages/SearchingVisualizer';
import { soundController } from './utils/sound';

export default function App() {
  const [view, setView] = useState('landing');
  const [currentMode, setViewMode] = useState('single');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [theme, setTheme] = useState('dark');
  
  // Shared visualizer states
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Sync sound controller setting
  useEffect(() => {
    soundController.enabled = soundEnabled;
  }, [soundEnabled]);

  // Sync DOM theme state
  useEffect(() => {
    if (theme === 'light') {
      document.body.setAttribute('data-theme', 'light');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [theme]);

  // Reset pause state when switching views
  useEffect(() => {
    setIsPaused(false);
    setIsRunning(false);
  }, [view, currentMode]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        view={view}
        setView={setView}
        currentMode={currentMode}
        setViewMode={setViewMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        theme={theme}
        toggleTheme={toggleTheme}
        isRunning={isRunning}
      />

      {view === 'landing' && <LandingPage setView={setView} />}
      
      {view === 'sorting' && (
        <SortingVisualizer 
          currentMode={currentMode}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
        />
      )}
      
      {view === 'searching' && (
        <SearchingVisualizer 
          currentMode={currentMode}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
        />
      )}

      <footer>
        <p><strong>AlgoViz</strong> — Algorithm Visualizer</p>
        <p>Compare searching and sorting algorithms side-by-side on uniform random inputs. Enable Sound for pitch-mapped audio effects.</p>
      </footer>
    </div>
  );
}
