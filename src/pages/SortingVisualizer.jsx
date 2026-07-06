import React, { useState, useEffect, useRef } from 'react';
import ComplexityTable from '../components/ComplexityTable';
import SortingAlgorithms from '../algorithms/sorting';
import { soundController } from '../utils/sound';

const SortingInfo = {
  bubbleSort: {
    title: "Bubble Sort",
    description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    best: "O(n)",
    avg: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "Yes"
  },
  selectionSort: {
    title: "Selection Sort",
    description: "Repeatedly finds the minimum element from the unsorted part and puts it at the beginning.",
    best: "O(n²)",
    avg: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "No"
  },
  insertionSort: {
    title: "Insertion Sort",
    description: "Builds the final sorted array one item at a time by inserting elements into their correct position.",
    best: "O(n)",
    avg: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "Yes"
  },
  mergeSort: {
    title: "Merge Sort",
    description: "Divide-and-conquer algorithm that divides the array in half, recursively sorts them, and merges them.",
    best: "O(n log n)",
    avg: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
    stable: "Yes"
  },
  quickSort: {
    title: "Quick Sort",
    description: "Divide-and-conquer algorithm that picks a pivot and partitions the array around it recursively.",
    best: "O(n log n)",
    avg: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
    stable: "No"
  },
  heapSort: {
    title: "Heap Sort",
    description: "Comparison-based sorting algorithm that visualizes the array as a binary heap, extracting elements one by one.",
    best: "O(n log n)",
    avg: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
    stable: "No"
  }
};

class SortingVisualizerController {
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
    this.swaps = 0;
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

  async compare(i, j) {
    await this.check();
    this.comparisons++;
    this.onUpdateStats(this.comparisons, this.swaps);

    const barI = this.bars[i];
    const barJ = this.bars[j];
    if (barI) barI.classList.add('compare');
    if (barJ) barJ.classList.add('compare');

    this.sound.playTone(this.array[i], this.maxVal, this.getDelayMs(), this.pan);

    await this.delay();

    if (barI) barI.classList.remove('compare');
    if (barJ) barJ.classList.remove('compare');
  }

  async swap(i, j) {
    await this.check();
    this.swaps++;
    this.onUpdateStats(this.comparisons, this.swaps);

    const temp = this.array[i];
    this.array[i] = this.array[j];
    this.array[j] = temp;

    const barI = this.bars[i];
    const barJ = this.bars[j];

    if (barI) {
      barI.classList.add('swap');
      barI.style.height = `${(this.array[i] / this.maxVal) * 92 + 5}%`;
    }
    if (barJ) {
      barJ.classList.add('swap');
      barJ.style.height = `${(this.array[j] / this.maxVal) * 92 + 5}%`;
    }

    this.sound.playTone(this.array[i], this.maxVal, this.getDelayMs(), this.pan);

    await this.delay();

    if (barI) barI.classList.remove('swap');
    if (barJ) barJ.classList.remove('swap');
  }

  async write(i, val) {
    await this.check();
    this.swaps++;
    this.onUpdateStats(this.comparisons, this.swaps);

    this.array[i] = val;
    const bar = this.bars[i];
    if (bar) {
      bar.classList.add('swap');
      bar.style.height = `${(val / this.maxVal) * 92 + 5}%`;
    }

    this.sound.playTone(val, this.maxVal, this.getDelayMs(), this.pan);

    await this.delay();

    if (bar) bar.classList.remove('swap');
  }

  async setPivot(i) {
    const bar = this.bars[i];
    if (bar) bar.classList.add('pivot');
  }

  async clearPivot(i) {
    const bar = this.bars[i];
    if (bar) bar.classList.remove('pivot');
  }

  async markSorted(i) {
    const bar = this.bars[i];
    if (bar) {
      bar.className = 'array-bar sorted';
    }
  }
}

export default function SortingVisualizer({ 
  currentMode, 
  isRunning, 
  setIsRunning,
  isPaused,
  setIsPaused
}) {
  const [size, setSize] = useState(60);
  const [speed, setSpeed] = useState(75);
  const [array, setArray] = useState([]);

  // Selections
  const [algoA, setAlgoA] = useState('quickSort');
  const [algoB, setAlgoB] = useState('heapSort');

  // Stats States
  const [statsA, setStatsA] = useState({ compares: 0, swaps: 0, time: 0 });
  const [statsB, setStatsB] = useState({ compares: 0, swaps: 0, time: 0 });

  // DOM Container Refs
  const barsContainerARef = useRef(null);
  const barsContainerBRef = useRef(null);

  // Flow State Refs
  const runStateRef = useRef({ isStopped: false, isPaused: false });
  const timerIntervalRef = useRef(null);
  const lastTickTimeRef = useRef(0);

  // Sync state values to ref for checker access
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
  };

  const resetStats = () => {
    setStatsA({ compares: 0, swaps: 0, time: 0 });
    setStatsB({ compares: 0, swaps: 0, time: 0 });
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
      throw new Error('SORT_STOPPED');
    }
    while (runStateRef.current.isPaused) {
      if (runStateRef.current.isStopped) {
        throw new Error('SORT_STOPPED');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const startVisualization = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setIsPaused(false);
    runStateRef.current.isStopped = false;
    runStateRef.current.isPaused = false;

    resetStats();
    startTimer();

    // Reset height to default mapped sizes before starting
    const maxVal = Math.max(...array);
    if (barsContainerARef.current) {
      Array.from(barsContainerARef.current.children).forEach((bar, idx) => {
        bar.style.height = `${(array[idx] / maxVal) * 92 + 5}%`;
        bar.className = 'array-bar';
      });
    }
    if (barsContainerBRef.current) {
      Array.from(barsContainerBRef.current.children).forEach((bar, idx) => {
        bar.style.height = `${(array[idx] / maxVal) * 92 + 5}%`;
        bar.className = 'array-bar';
      });
    }

    const ctrlA = new SortingVisualizerController(
      'a',
      array,
      barsContainerARef.current,
      (compares, swaps) => setStatsA(prev => ({ ...prev, compares, swaps })),
      getDelayMs,
      soundController,
      -0.6 // Left pan
    );
    ctrlA.checkState = checkState;

    const promiseA = SortingAlgorithms[algoA](ctrlA)
      .catch(err => {
        if (err.message !== 'SORT_STOPPED') throw err;
      });

    const promises = [promiseA];

    if (currentMode === 'dual') {
      const ctrlB = new SortingVisualizerController(
        'b',
        array,
        barsContainerBRef.current,
        (compares, swaps) => setStatsB(prev => ({ ...prev, compares, swaps })),
        getDelayMs,
        soundController,
        0.6 // Right pan
      );
      ctrlB.checkState = checkState;

      const promiseB = SortingAlgorithms[algoB](ctrlB)
        .catch(err => {
          if (err.message !== 'SORT_STOPPED') throw err;
        });

      promises.push(promiseB);
    }

    try {
      await Promise.all(promises);
    } catch (e) {
      console.error("Sorting visualizer error:", e);
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

          {/* Action buttons */}
          <div className="control-group action-buttons">
            <button className="btn" onClick={generateArray} disabled={isRunning}>
              <span>✦</span> Generate Array
            </button>
            <button className="btn btn-primary" onClick={startVisualization} disabled={isRunning}>
              <span>▶</span> Visualize
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
                <option value="bubbleSort">Bubble Sort</option>
                <option value="selectionSort">Selection Sort</option>
                <option value="insertionSort">Insertion Sort</option>
                <option value="mergeSort">Merge Sort</option>
                <option value="quickSort">Quick Sort</option>
                <option value="heapSort">Heap Sort</option>
              </select>
            </div>

            <div className="viz-board-wrapper">
              <div className="stats-hud">
                <div className="stat-pill">
                  <span className="stat-label">Compares:</span>
                  <span className="stat-value">{statsA.compares}</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-label">Swaps/Writes:</span>
                  <span className="stat-value">{statsA.swaps}</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-label">Time:</span>
                  <span className="stat-value">{statsA.time.toFixed(2)}s</span>
                </div>
              </div>

              <div ref={barsContainerARef} className="bars-container">
                {array.map((val, idx) => (
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
                  <option value="bubbleSort">Bubble Sort</option>
                  <option value="selectionSort">Selection Sort</option>
                  <option value="insertionSort">Insertion Sort</option>
                  <option value="mergeSort">Merge Sort</option>
                  <option value="quickSort">Quick Sort</option>
                  <option value="heapSort">Heap Sort</option>
                </select>
              </div>

              <div className="viz-board-wrapper">
                <div className="stats-hud">
                  <div className="stat-pill">
                    <span className="stat-label">Compares:</span>
                    <span className="stat-value">{statsB.compares}</span>
                  </div>
                  <div className="stat-pill">
                    <span className="stat-label">Swaps/Writes:</span>
                    <span className="stat-value">{statsB.swaps}</span>
                  </div>
                  <div className="stat-pill">
                    <span className="stat-label">Time:</span>
                    <span className="stat-value">{statsB.time.toFixed(2)}s</span>
                  </div>
                </div>

                <div ref={barsContainerBRef} className="bars-container">
                  {array.map((val, idx) => (
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
          <ComplexityTable id="a" algoKey={algoA} infoMap={SortingInfo} type="sorting" />
          {currentMode === 'dual' && (
            <ComplexityTable id="b" algoKey={algoB} infoMap={SortingInfo} type="sorting" />
          )}
        </div>
      </main>
    </>
  );
}
