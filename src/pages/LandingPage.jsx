import React from 'react';

/**
 * LandingPage Component
 * Displays searching visualizer and sorting visualizer category selector cards.
 */
export default function LandingPage({ setView }) {
  return (
    <main className="landing-container">
      <h2 className="hero-title">Interactive Algorithm Visualizer</h2>
      <p className="hero-subtitle">
        Step inside sorting and searching execution. Observe, hear, and understand complexities in real-time through glassmorphic HUD boards and custom audio synthesis.
      </p>
      
      {/* Visualizer Modules Selection Grid */}
      <section className="landing-grid">
        {/* Searching Card */}
        <a 
          href="#" 
          className="landing-card" 
          onClick={(e) => { 
            e.preventDefault(); 
            setView('searching'); 
          }}
        >
          <div className="landing-card-icon">🔍</div>
          <h3 className="landing-card-title">Searching Visualizer</h3>
          <p className="landing-card-text">
            Track element searching visually. Select custom search targets and observe Binary Search prune sorted array segments logarithmically.
          </p>
          <ul className="landing-card-features">
            <li>Linear Search &amp; Binary Search animations</li>
            <li>Interactive Target number selector &amp; Random targets</li>
            <li>Auto-sorting arrays for Binary Search runs</li>
            <li>Success ascending and failure descending audio chimes</li>
          </ul>
          <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
            Open Searching Visualizer
          </button>
        </a>

        {/* Sorting Card */}
        <a 
          href="#" 
          className="landing-card" 
          onClick={(e) => { 
            e.preventDefault(); 
            setView('sorting'); 
          }}
        >
          <div className="landing-card-icon">📊</div>
          <h3 className="landing-card-title">Sorting Visualizer</h3>
          <p className="landing-card-text">
            Compare 6 sorting algorithms side-by-side on random identical arrays. Watch elements swap, pivot, and lock into sorted positions.
          </p>
          <ul className="landing-card-features">
            <li>Bubble, Selection, and Insertion Sorts</li>
            <li>Quick, Merge, and Heap Sorts</li>
            <li>Dual Comparison (side-by-side) Mode</li>
            <li>Real-time compares, swaps, and execution timers</li>
          </ul>
          <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
            Open Sorting Visualizer
          </button>
        </a>
      </section>
    </main>
  );
}
