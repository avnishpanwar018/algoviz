/**
 * script.js
 * Core application controller, state management, and UI orchestration.
 */

// Educational metadata for sorting algorithms
const AlgorithmInfo = {
  bubbleSort: {
    title: "Bubble Sort",
    description: "A simple comparison-based sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.",
    best: "O(n)",
    avg: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "Yes"
  },
  selectionSort: {
    title: "Selection Sort",
    description: "An in-place comparison-based algorithm that divides the input list into two parts: a sorted sublist at the left and an unsorted sublist at the right. It repeatedly finds the minimum element from the unsorted sublist and moves it to the sorted list.",
    best: "O(n²)",
    avg: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "No"
  },
  insertionSort: {
    title: "Insertion Sort",
    description: "A simple sorting algorithm that builds the final sorted array one item at a time. It takes each element from the unsorted part and inserts it into its correct position within the already sorted part.",
    best: "O(n)",
    avg: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "Yes"
  },
  mergeSort: {
    title: "Merge Sort",
    description: "A divide-and-conquer algorithm that divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves. It uses temporary storage to store elements during the merge process.",
    best: "O(n log n)",
    avg: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
    stable: "Yes"
  },
  quickSort: {
    title: "Quick Sort",
    description: "A divide-and-conquer algorithm that picks an element as a pivot and partitions the given array around the picked pivot. It recursively sorts the sub-arrays before and after the pivot.",
    best: "O(n log n)",
    avg: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
    stable: "No"
  },
  heapSort: {
    title: "Heap Sort",
    description: "A comparison-based sorting algorithm based on a Binary Heap data structure. It divides its input into a sorted and an unsorted region, and it iteratively shrinks the unsorted region by extracting the largest element and moving that to the sorted region.",
    best: "O(n log n)",
    avg: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
    stable: "No"
  }
};

// Global Configuration / State
let currentMode = 'single'; // 'single' or 'dual'
let isSortingRunning = false;
let isPaused = false;
let currentArray = [];

/**
 * SoundController using Web Audio API
 */
class SoundController {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTone(value, maxVal, pan = 0) {
    if (!this.enabled) return;
    this.init();

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      // Normalize value to frequency (160Hz to 1000Hz)
      const minFreq = 160;
      const maxFreq = 1000;
      const freq = minFreq + (value / maxVal) * (maxFreq - minFreq);

      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.type = 'triangle'; // Smooth triangle wave

      // Set stereo panning for separation
      let finalDest = this.ctx.destination;
      if (this.ctx.createStereoPanner) {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(pan, this.ctx.currentTime);
        osc.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(this.ctx.destination);
      } else {
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
      }

      // Quick amplitude envelope to prevent popping/clicking sounds
      const delayMs = getDelayMs();
      const duration = Math.max(0.015, Math.min(0.08, delayMs / 1000));
      
      gainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.003); // Low volume
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("AudioContext playback blocked or failed:", e);
    }
  }
}

const soundController = new SoundController();

/**
 * Visualizer Board Controller
 */
class Visualizer {
  constructor(id, pan = 0) {
    this.id = id;
    this.pan = pan;
    this.container = document.getElementById(`viz-board-${id}`);
    this.array = [];
    this.bars = [];
    this.maxVal = 100;

    // Statistics
    this.comparisons = 0;
    this.swaps = 0;
    this.writes = 0;
    this.startTime = null;
    this.elapsedTime = 0;
    this.timerInterval = null;

    this.isStopped = false;
  }

  resetStats() {
    this.comparisons = 0;
    this.swaps = 0;
    this.writes = 0;
    this.elapsedTime = 0;
    this.stopTimer();
    this.updateStatsUI();
  }

  setArray(arr) {
    this.array = [...arr];
    this.maxVal = Math.max(...this.array);
    this.render();
    this.resetStats();
  }

  render() {
    this.container.innerHTML = '';
    this.bars = [];

    const barsContainer = document.createElement('div');
    barsContainer.className = 'bars-container';

    for (let i = 0; i < this.array.length; i++) {
      const bar = document.createElement('div');
      bar.className = 'array-bar';
      bar.style.height = `${(this.array[i] / this.maxVal) * 92 + 5}%`;
      bar.title = `Index: ${i}, Value: ${this.array[i]}`;
      barsContainer.appendChild(bar);
      this.bars.push(bar);
    }
    this.container.appendChild(barsContainer);
  }

  updateStatsUI() {
    const compEl = document.getElementById(`stats-compare-${this.id}`);
    const swapEl = document.getElementById(`stats-swap-${this.id}`);
    const timeEl = document.getElementById(`stats-time-${this.id}`);

    if (compEl) compEl.textContent = this.comparisons;
    if (swapEl) swapEl.textContent = this.swaps + this.writes;
    if (timeEl) timeEl.textContent = `${(this.elapsedTime / 1000).toFixed(2)}s`;
  }

  startTimer() {
    this.startTime = Date.now() - this.elapsedTime;
    this.timerInterval = setInterval(() => {
      this.elapsedTime = Date.now() - this.startTime;
      this.updateStatsUI();
    }, 10);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  async checkState() {
    if (this.isStopped) {
      throw new Error('SORT_STOPPED');
    }
    while (isPaused) {
      if (this.isStopped) {
        throw new Error('SORT_STOPPED');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  async delay() {
    await this.checkState();
    const ms = getDelayMs();
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  // Visualizer API Hooks called by algorithms.js
  async compare(i, j) {
    await this.checkState();
    this.comparisons++;
    this.updateStatsUI();

    const bar1 = this.bars[i];
    const bar2 = this.bars[j];

    if (bar1) bar1.classList.add('compare');
    if (bar2) bar2.classList.add('compare');

    soundController.playTone(this.array[i], this.maxVal, this.pan);

    await this.delay();

    if (bar1) bar1.classList.remove('compare');
    if (bar2) bar2.classList.remove('compare');
  }

  async swap(i, j) {
    await this.checkState();
    this.swaps++;
    this.updateStatsUI();

    const temp = this.array[i];
    this.array[i] = this.array[j];
    this.array[j] = temp;

    const bar1 = this.bars[i];
    const bar2 = this.bars[j];

    if (bar1) bar1.classList.add('swap');
    if (bar2) bar2.classList.add('swap');

    if (bar1) bar1.style.height = `${(this.array[i] / this.maxVal) * 92 + 5}%`;
    if (bar2) bar2.style.height = `${(this.array[j] / this.maxVal) * 92 + 5}%`;
    
    if (bar1) bar1.title = `Index: ${i}, Value: ${this.array[i]}`;
    if (bar2) bar2.title = `Index: ${j}, Value: ${this.array[j]}`;

    soundController.playTone(this.array[i], this.maxVal, this.pan);

    await this.delay();

    if (bar1) bar1.classList.remove('swap');
    if (bar2) bar2.classList.remove('swap');
  }

  async setVal(i, val) {
    await this.checkState();
    this.writes++;
    this.updateStatsUI();

    this.array[i] = val;

    const bar = this.bars[i];
    if (bar) {
      bar.classList.add('swap');
      bar.style.height = `${(val / this.maxVal) * 92 + 5}%`;
      bar.title = `Index: ${i}, Value: ${val}`;
    }

    soundController.playTone(val, this.maxVal, this.pan);

    await this.delay();

    if (bar) bar.classList.remove('swap');
  }

  async markSorted(i) {
    const bar = this.bars[i];
    if (bar) {
      bar.classList.add('sorted');
      bar.classList.remove('compare', 'swap', 'pivot');
    }
  }

  setPivot(i) {
    const bar = this.bars[i];
    if (bar) {
      bar.classList.add('pivot');
    }
  }

  clearPivot(i) {
    const bar = this.bars[i];
    if (bar) {
      bar.classList.remove('pivot');
    }
  }
}

// Instantiation
const vizA = new Visualizer('a', -0.6); // Left Pan
const vizB = new Visualizer('b', 0.6);  // Right Pan

/**
 * Maps speed slider value (1-100) to actual delay milliseconds.
 * Inverts the scale so high speed slider values mean smaller sleep durations.
 */
function getDelayMs() {
  const speed = parseInt(document.getElementById('speed-slider').value);
  if (speed >= 95) return 1;
  if (speed >= 85) return 5;
  if (speed >= 70) return 20;
  if (speed >= 50) return 60;
  if (speed >= 30) return 150;
  return 850 - (speed * 8);
}

/**
 * Generates array values and populates boards
 */
function generateRandomArray(size) {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 90) + 10);
  }
  return arr;
}

function triggerArrayGeneration() {
  const size = parseInt(document.getElementById('size-slider').value);
  currentArray = generateRandomArray(size);
  vizA.setArray(currentArray);
  if (currentMode === 'dual') {
    vizB.setArray(currentArray);
  }
}

/**
 * Dynamic Educational Text Updates
 */
function updateEduDetails(id, algoKey) {
  const info = AlgorithmInfo[algoKey];
  if (!info) return;

  const card = document.getElementById(`edu-card-${id}`);
  if (!card) return;

  card.querySelector('.edu-title').textContent = `${info.title} Details`;
  card.querySelector('.edu-description').textContent = info.description;
  card.querySelector(`.best-${id}`).textContent = info.best;
  card.querySelector(`.avg-${id}`).textContent = info.avg;
  card.querySelector(`.worst-${id}`).textContent = info.worst;
  card.querySelector(`.space-${id}`).textContent = info.space;
  card.querySelector(`.stable-${id}`).textContent = info.stable;
}

/**
 * Switches views between Single and Dual mode
 */
function setViewMode(mode) {
  if (isSortingRunning) return;
  currentMode = mode;

  const layout = document.getElementById('visualization-layout');
  const eduGrid = document.getElementById('edu-grid');
  const cardB = document.getElementById('viz-card-b');
  const eduB = document.getElementById('edu-card-b');

  const btnSingle = document.getElementById('mode-single');
  const btnDual = document.getElementById('mode-dual');

  if (mode === 'dual') {
    layout.classList.add('dual-mode');
    eduGrid.classList.add('dual-mode');
    cardB.style.display = 'flex';
    eduB.style.display = 'flex';

    btnDual.classList.add('btn-primary');
    btnSingle.classList.remove('btn-primary');

    vizB.setArray(currentArray);
    updateEduDetails('b', document.getElementById('algo-select-b').value);
  } else {
    layout.classList.remove('dual-mode');
    eduGrid.classList.remove('dual-mode');
    cardB.style.display = 'none';
    eduB.style.display = 'none';

    btnSingle.classList.add('btn-primary');
    btnDual.classList.remove('btn-primary');
  }
}

/**
 * Control Buttons State Machine
 */
function updateControlButtons() {
  const generateBtn = document.getElementById('btn-generate');
  const startBtn = document.getElementById('btn-start');
  const pauseBtn = document.getElementById('btn-pause');
  const stopBtn = document.getElementById('btn-stop');
  const sizeSlider = document.getElementById('size-slider');
  const modeSingleBtn = document.getElementById('mode-single');
  const modeDualBtn = document.getElementById('mode-dual');
  const algoSelectA = document.getElementById('algo-select-a');
  const algoSelectB = document.getElementById('algo-select-b');

  if (isSortingRunning) {
    generateBtn.disabled = true;
    sizeSlider.disabled = true;
    startBtn.disabled = true;
    
    stopBtn.disabled = false;
    stopBtn.innerHTML = '<span>✕</span> Stop';

    pauseBtn.disabled = false;
    if (isPaused) {
      pauseBtn.innerHTML = '<span>▶</span> Resume';
      pauseBtn.classList.add('btn-primary');
    } else {
      pauseBtn.innerHTML = '<span>⏸</span> Pause';
      pauseBtn.classList.remove('btn-primary');
    }

    modeSingleBtn.disabled = true;
    modeDualBtn.disabled = true;
    algoSelectA.disabled = true;
    if (algoSelectB) algoSelectB.disabled = true;
  } else {
    generateBtn.disabled = false;
    sizeSlider.disabled = false;
    startBtn.disabled = false;

    stopBtn.disabled = false;
    stopBtn.innerHTML = '<span>↺</span> Reset';

    pauseBtn.disabled = true;
    pauseBtn.innerHTML = '<span>⏸</span> Pause';
    pauseBtn.classList.remove('btn-primary');

    modeSingleBtn.disabled = false;
    modeDualBtn.disabled = false;
    algoSelectA.disabled = false;
    if (algoSelectB) algoSelectB.disabled = false;
  }
}

/**
 * Triggers full sorting execution
 */
async function startSorting() {
  if (isSortingRunning) return;

  isSortingRunning = true;
  isPaused = false;

  vizA.isStopped = false;
  vizA.resetStats();
  vizA.startTimer();

  const algoA = document.getElementById('algo-select-a').value;
  const promiseA = SortingAlgorithms[algoA](vizA)
    .then(() => vizA.stopTimer())
    .catch(err => {
      vizA.stopTimer();
      if (err.message !== 'SORT_STOPPED') throw err;
    });

  const promises = [promiseA];

  if (currentMode === 'dual') {
    vizB.isStopped = false;
    vizB.resetStats();
    vizB.startTimer();

    const algoB = document.getElementById('algo-select-b').value;
    const promiseB = SortingAlgorithms[algoB](vizB)
      .then(() => vizB.stopTimer())
      .catch(err => {
        vizB.stopTimer();
        if (err.message !== 'SORT_STOPPED') throw err;
      });

    promises.push(promiseB);
  }

  updateControlButtons();

  try {
    await Promise.all(promises);
  } catch (e) {
    console.error("Sorting execution encountered an error:", e);
  } finally {
    isSortingRunning = false;
    isPaused = false;
    updateControlButtons();
  }
}

function togglePause() {
  if (!isSortingRunning) return;
  isPaused = !isPaused;
  updateControlButtons();
}

function handleStopReset() {
  if (isSortingRunning) {
    // STOP state
    vizA.isStopped = true;
    vizB.isStopped = true;
    isPaused = false; // Break loop immediately
  } else {
    // RESET state (regenerates arrays with the same configuration)
    triggerArrayGeneration();
  }
}

/**
 * Event Listeners and Setup
 */
document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Setup
  const themeToggle = document.getElementById('theme-toggle');
  
  // Audio context resume on interaction
  document.body.addEventListener('click', () => {
    soundController.init();
  }, { once: true });

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'light') {
      document.body.removeAttribute('data-theme');
      themeToggle.innerHTML = '<span>☀</span> Light Mode';
    } else {
      document.body.setAttribute('data-theme', 'light');
      themeToggle.innerHTML = '<span>🌙</span> Dark Mode';
    }
  });

  // Sound Toggle Setup
  const soundToggle = document.getElementById('sound-toggle');
  soundToggle.addEventListener('click', () => {
    soundController.enabled = !soundController.enabled;
    if (soundController.enabled) {
      soundToggle.classList.add('btn-primary');
      soundToggle.innerHTML = '<span>🔊</span> Sound ON';
      soundController.init();
    } else {
      soundToggle.classList.remove('btn-primary');
      soundToggle.innerHTML = '<span>🔇</span> Sound OFF';
    }
  });

  // Single/Dual mode toggle buttons
  document.getElementById('mode-single').addEventListener('click', () => setViewMode('single'));
  document.getElementById('mode-dual').addEventListener('click', () => setViewMode('dual'));

  // Slider actions
  const sizeSlider = document.getElementById('size-slider');
  const sizeVal = document.getElementById('size-val');
  sizeSlider.addEventListener('input', (e) => {
    sizeVal.textContent = e.target.value;
    if (!isSortingRunning) {
      triggerArrayGeneration();
    }
  });

  const speedSlider = document.getElementById('speed-slider');
  const speedVal = document.getElementById('speed-val');
  speedSlider.addEventListener('input', (e) => {
    speedVal.textContent = `${e.target.value}%`;
  });

  // Dropdown changes
  document.getElementById('algo-select-a').addEventListener('change', (e) => {
    updateEduDetails('a', e.target.value);
  });
  document.getElementById('algo-select-b').addEventListener('change', (e) => {
    updateEduDetails('b', e.target.value);
  });

  // Button Action Click listeners
  document.getElementById('btn-generate').addEventListener('click', triggerArrayGeneration);
  document.getElementById('btn-start').addEventListener('click', startSorting);
  document.getElementById('btn-pause').addEventListener('click', togglePause);
  document.getElementById('btn-stop').addEventListener('click', handleStopReset);

  // Initial State Setup
  triggerArrayGeneration();
  updateEduDetails('a', document.getElementById('algo-select-a').value);
  updateControlButtons();
});
