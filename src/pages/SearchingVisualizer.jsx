import React, { useState, useEffect, useRef } from 'react';
import ComplexityTable from '../components/ComplexityTable';
import SearchingAlgorithms from '../algorithms/searching';
import { soundController } from '../utils/sound';

const SearchingInfo = {
  linearSearch: {
    title: "Linear Search",
    description: "Sequentially checks each element of the list from start to end until a match is found or the whole list has been searched.",
    best: "O(1)",
    avg: "O(n)",
    worst: "O(n)",
    space: "O(1)",
    stable: "No"
  },
  binarySearch: {
    title: "Binary Search",
    description: "Finds the position of a target value within a sorted array. It compares the target value to the middle element of the array and cuts the search space in half repeatedly.",
    best: "O(1)",
    avg: "O(log n)",
    worst: "O(log n)",
    space: "O(1)",
    stable: "Yes"
  }
};

class SearchingVisualizerController {
  constructor(id, array, barsContainer, onUpdateStats, getDelayMs, sound, pan = 0) {
    this.id = id;
    this.array = [...array];
    this.bars = barsContainer.children;
    this.maxVal = Math.max(...array);
    this.onUpdateStats = onUpdateStats;
    this.getDelayMs = getDelayMs;
    this.sound = sound;
    this.pan = pan;

    this.comparisons = 0;
    this.checkState = null;
  }

  async check() {
    if (this.checkState) {
      await this.checkState();
    }
  }

  async delay() {
    await this.check();
    const ms = this.getDelayMs();
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  async compare(i) {
    await this.check();
    this.comparisons++;
    this.onUpdateStats(this.comparisons);

    const bar = this.bars[i];
    if (bar) bar.classList.add('compare');

    this.sound.playTone(this.array[i], this.maxVal, this.getDelayMs(), this.pan);

    await this.delay();

    if (bar) bar.classList.remove('compare');
  }

  async markDiscarded(i) {
    const bar = this.bars[i];
    if (bar) {
      bar.className = 'array-bar discarded';
    }
  }

  async markFound(i) {
    const bar = this.bars[i];
    if (bar) {
      bar.className = 'array-bar found';
    }
    this.sound.playSuccessChime(this.pan);
  }

  playFailureChime() {
    this.sound.playFailureChime(this.pan);
  }
}

export default function SearchingVisualizer({
  currentMode,
  isRunning,
  setIsRunning,
  isPaused,
  setIsPaused
}) {
  const [size, setSize] = useState(60);
  const [speed, setSpeed] = useState(75);
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState(45);

  // Selections
  const [algoA, setAlgoA] = useState('linearSearch');
  const [algoB, setAlgoB] = useState('binarySearch');

  // Stats States
  const [statsA, setStatsA] = useState({ compares: 0, time: 0 });
  const [statsB, setStatsB] = useState({ compares: 0, time: 0 });

  // DOM Container Refs
  const barsContainerARef = useRef(null);
  const barsContainerBRef = useRef(null);

  // Flow State Refs
  const runStateRef = useRef({ isStopped: false, isPaused: false });
  const timerIntervalRef = useRef(null);
  const lastTickTimeRef = useRef(0);

  // Sync state values to ref
  useEffect(() => {
    runStateRef.current.isPaused = isPaused;
  }, [isPaused]);

  // Generate array on size change
  useEffect(() => {
    generateArray();
  }, [size]);

  const generateArray = () => {
    if (isRunning) return;
    const arr = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 90) + 10);
    }
    setArray(arr);
    resetStats();

    // Select random element from new array as target
    const randomIdx = Math.floor(Math.random() * arr.length);
    setTarget(arr[randomIdx]);
  };

  const pickRandomTarget = () => {
    if (isRunning || array.length === 0) return;
    const randomIdx = Math.floor(Math.random() * array.length);
    setTarget(array[randomIdx]);
  };

  const resetStats = () => {
    setStatsA({ compares: 0, time: 0 });
    setStatsB({ compares: 0, time: 0 });
    stopTimer();

    // Clean up DOM classes
    if (barsContainerARef.current) {
      Array.from(barsContainerARef.current.children).forEach(bar => {
        bar.className = 'array-bar';
      });
    }
    if (barsContainerBRef.current) {
      Array.from(barsContainerBRef.current.children).forEach(bar => {
        bar.className = 'array-bar';
      });
    }
  };

  const getDelayMs = () => {
    if (speed >= 95) return 2;
    if (speed >= 85) return 10;
    if (speed >= 70) return 35;
    if (speed >= 50) return 90;
    if (speed >= 30) return 200;
    return 900 - (speed * 8);
  };

  const startTimer = () => {
    lastTickTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = now;

      if (!runStateRef.current.isPaused) {
        setStatsA(prev => ({ ...prev, time: prev.time + delta }));
        if (currentMode === 'dual') {
          setStatsB(prev => ({ ...prev, time: prev.time + delta }));
        }
      }
    }, 10);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const checkState = async () => {
    if (runStateRef.current.isStopped) {
      throw new Error('SEARCH_STOPPED');
    }
    while (runStateRef.current.isPaused) {
      if (runStateRef.current.isStopped) {
        throw new Error('SEARCH_STOPPED');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const getVisualArray = (algoKey) => {
    if (algoKey === 'binarySearch') {
      return [...array].sort((a, b) => a - b);
    }
    return array;
  };

  const startVisualization = async () => {
    if (isRunning) return;

    const numTarget = parseInt(target);
    if (isNaN(numTarget)) {
      alert("Please enter a valid numeric target!");
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    runStateRef.current.isStopped = false;
    runStateRef.current.isPaused = false;

    resetStats();
    startTimer();

    // Clear bar animation classes
    if (barsContainerARef.current) {
      Array.from(barsContainerARef.current.children).forEach(bar => {
        bar.className = 'array-bar';
      });
    }
    if (barsContainerBRef.current) {
      Array.from(barsContainerBRef.current.children).forEach(bar => {
        bar.className = 'array-bar';
      });
    }

    const visualArrayA = getVisualArray(algoA);
    const ctrlA = new SearchingVisualizerController(
      'a',
      visualArrayA,
      barsContainerARef.current,
      (compares) => setStatsA(prev => ({ ...prev, compares })),
      getDelayMs,
      soundController,
      -0.6 // Left pan
    );
    ctrlA.checkState = checkState;

    const promiseA = SearchingAlgorithms[algoA](ctrlA, numTarget)
      .catch(err => {
        if (err.message !== 'SEARCH_STOPPED') throw err;
      });

    const promises = [promiseA];

    if (currentMode === 'dual') {
      const visualArrayB = getVisualArray(algoB);
      const ctrlB = new SearchingVisualizerController(
        'b',
        visualArrayB,
        barsContainerBRef.current,
        (compares) => setStatsB(prev => ({ ...prev, compares })),
        getDelayMs,
        soundController,
        0.6 // Right pan
      );
      ctrlB.checkState = checkState;

      const promiseB = SearchingAlgorithms[algoB](ctrlB, numTarget)
        .catch(err => {
          if (err.message !== 'SEARCH_STOPPED') throw err;
        });

      promises.push(promiseB);
    }

    try {
      await Promise.all(promises);
    } catch (e) {
      console.error("Searching visualizer error:", e);
    } finally {
      stopTimer();
      setIsRunning(false);
      setIsPaused(false);
    }
  };

  const handleStopReset = () => {
    if (isRunning) {
      runStateRef.current.isStopped = true;
      setIsPaused(false);
    } else {
      generateArray();
    }
  };

  const maxVal = array.length ? Math.max(...array) : 100;
  const visualArrayA = getVisualArray(algoA);
  const visualArrayB = getVisualArray(algoB);

  return (
    <>
      {/* Controls Container */}
      <section className="controls-container">
        <div className="controls-grid">
          {/* Size slider */}
          <div className="control-group">
            <span className="control-label">
              Array Size <span className="control-val">{size}</span>
            </span>
            <input 
              type="range" 
              min="10" 
              max="150" 
              value={size} 
              onChange={(e) => setSize(parseInt(e.target.value))}
              disabled={isRunning}
            />
          </div>

          {/* Speed slider */}
          <div className="control-group">
            <span className="control-label">
              Speed <span className="control-val">{speed}%</span>
            </span>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={speed} 
              onChange={(e) => setSpeed(parseInt(e.target.value))}
            />
          </div>

          {/* Target Selector */}
          <div className="control-group">
            <span className="control-label">Search Target</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <input 
                type="number" 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={isRunning}
                style={{ 
                  flex: 1, 
                  padding: '0.6rem 0.5rem', 
                  borderRadius: '0.5rem', 
                  background: 'var(--btn-bg)', 
                  border: '1px solid var(--btn-border)', 
                  color: 'var(--text-primary)', 
                  outline: 'none', 
                  textAlign: 'center', 
                  fontFamily: 'var(--font-mono)', 
                  fontWeight: 700 
                }}
              />
              <button 
                className="btn" 
                onClick={pickRandomTarget} 
                disabled={isRunning}
                title="Pick Random Element from Array"
              >
                🎯 Random
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="control-group action-buttons">
            <button className="btn" onClick={generateArray} disabled={isRunning}>
              <span>✦</span> Generate Array
            </button>
            <button className="btn btn-primary" onClick={startVisualization} disabled={isRunning}>
              <span>▶</span> Search
            </button>
            <button className="btn" onClick={() => setIsPaused(!isPaused)} disabled={!isRunning}>
              <span>{isPaused ? '▶' : '⏸'}</span> {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button className="btn btn-danger" onClick={handleStopReset}>
              <span>{isRunning ? '✕' : '↺'}</span> {isRunning ? 'Stop' : 'Reset'}
            </button>
          </div>
        </div>
      </section>

      {/* Main visual layout */}
      <main>
        <div id="visualization-layout" className={`visualization-layout ${currentMode === 'dual' ? 'dual-mode' : ''}`}>
          {/* Card A */}
          <div className="viz-card">
            <div className="viz-card-header">
              <span className="viz-card-badge">Visualizer A</span>
              <select 
                value={algoA} 
                onChange={(e) => setAlgoA(e.target.value)}
                disabled={isRunning}
              >
                <option value="linearSearch">Linear Search</option>
                <option value="binarySearch">Binary Search</option>
              </select>
            </div>

            <div className="viz-board-wrapper">
              <div className="stats-hud">
                <div className="stat-pill">
                  <span className="stat-label">Compares:</span>
                  <span className="stat-value">{statsA.compares}</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-label">Time:</span>
                  <span className="stat-value">{statsA.time.toFixed(2)}s</span>
                </div>
              </div>

              <div ref={barsContainerARef} className="bars-container">
                {visualArrayA.map((val, idx) => (
                  <div 
                    key={idx}
                    className="array-bar"
                    style={{ height: `${(val / maxVal) * 92 + 5}%` }}
                    title={`Index: ${idx}, Value: ${val}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Card B */}
          {currentMode === 'dual' && (
            <div className="viz-card">
              <div className="viz-card-header">
                <span className="viz-card-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                  Visualizer B
                </span>
                <select 
                  value={algoB} 
                  onChange={(e) => setAlgoB(e.target.value)}
                  disabled={isRunning}
                >
                  <option value="linearSearch">Linear Search</option>
                  <option value="binarySearch">Binary Search</option>
                </select>
              </div>

              <div className="viz-board-wrapper">
                <div className="stats-hud">
                  <div className="stat-pill">
                    <span className="stat-label">Compares:</span>
                    <span className="stat-value">{statsB.compares}</span>
                  </div>
                  <div className="stat-pill">
                    <span className="stat-label">Time:</span>
                    <span className="stat-value">{statsB.time.toFixed(2)}s</span>
                  </div>
                </div>

                <div ref={barsContainerBRef} className="bars-container">
                  {visualArrayB.map((val, idx) => (
                    <div 
                      key={idx}
                      className="array-bar"
                      style={{ height: `${(val / maxVal) * 92 + 5}%` }}
                      title={`Index: ${idx}, Value: ${val}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Complexity Cards */}
        <div id="edu-grid" className={`edu-grid ${currentMode === 'dual' ? 'dual-mode' : ''}`}>
          <ComplexityTable id="a" algoKey={algoA} infoMap={SearchingInfo} type="searching" />
          {currentMode === 'dual' && (
            <ComplexityTable id="b" algoKey={algoB} infoMap={SearchingInfo} type="searching" />
          )}
        </div>
      </main>
    </>
  );
}
