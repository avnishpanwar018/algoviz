/**
 * script.js
 * Searching controller, state management, and UI orchestration.
 */

// Educational metadata for searching algorithms
const AlgorithmInfo = {
  linearSearch: {
    title: "Linear Search",
    description: "Sequentially checks each element of the list from start to end until a match is found or the whole list has been searched.",
    best: "O(1)",
    avg: "O(n)",
    worst: "O(n)",
    space: "O(1)",
    stable: "Yes" // Stability usually applies to sorting, but we display stability for symmetry
  },
  binarySearch: {
    title: "Binary Search",
    description: "Finds the position of a target value within a sorted array. It compares the target value to the middle element of the array and cuts the search space in half repeatedly.",
    best: "O(1)",
    avg: "O(log n)",
    worst: "O(log n)",
    space: "O(1)",
    stable: "N/A"
  }
};

// Global Configuration / State
let currentMode = 'single'; // 'single' or 'dual'
let isSortingRunning = false; // flag reused for execution run state
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
      osc.type = 'triangle';

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

      const delayMs = getDelayMs();
      const duration = Math.max(0.015, Math.min(0.08, delayMs / 1000));
      
      gainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.003);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("AudioContext playback blocked:", e);
    }
  }

  playSuccessChime(pan = 0) {
    if (!this.enabled) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 arpeggio
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        if (this.ctx.createStereoPanner) {
          const panner = this.ctx.createStereoPanner();
          panner.pan.setValueAtTime(pan, now);
          osc.connect(gainNode);
          gainNode.connect(panner);
          panner.connect(this.ctx.destination);
        } else {
          osc.connect(gainNode);
          gainNode.connect(this.ctx.destination);
        }

        gainNode.gain.setValueAtTime(0.0001, now + idx * 0.08);
        gainNode.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.2);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  playFailureChime(pan = 0) {
    if (!this.enabled) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const notes = [311.13, 261.63]; // Eb4, C4 sad descending interval
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        if (this.ctx.createStereoPanner) {
          const panner = this.ctx.createStereoPanner();
          panner.pan.setValueAtTime(pan, now);
          osc.connect(gainNode);
          gainNode.connect(panner);
          panner.connect(this.ctx.destination);
        } else {
          osc.connect(gainNode);
          gainNode.connect(this.ctx.destination);
        }

        gainNode.gain.setValueAtTime(0.0001, now + idx * 0.12);
        gainNode.gain.linearRampToValueAtTime(0.08, now + idx * 0.12 + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.35);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    } catch (e) {
      console.warn(e);
    }
  }
}

const soundController = new SoundController();

/**
 * Visualizer Board Controller for Searching
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
    this.startTime = null;
    this.elapsedTime = 0;
    this.timerInterval = null;

    this.isStopped = false;
  }

  resetStats() {
    this.comparisons = 0;
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

  instantSort() {
    this.array.sort((a, b) => a - b);
    this.render();
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
    const timeEl = document.getElementById(`stats-time-${this.id}`);

    if (compEl) compEl.textContent = this.comparisons;
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
      throw new Error('SEARCH_STOPPED');
    }
    while (isPaused) {
      if (this.isStopped) {
        throw new Error('SEARCH_STOPPED');
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
  async compare(i) {
    await this.checkState();
    this.comparisons++;
    this.updateStatsUI();

    const bar = this.bars[i];
    if (bar) bar.classList.add('compare');

    soundController.playTone(this.array[i], this.maxVal, this.pan);

    await this.delay();

    if (bar) bar.classList.remove('compare');
  }

  async markDiscarded(i) {
    const bar = this.bars[i];
    if (bar) {
      bar.classList.add('discarded');
      bar.classList.remove('compare', 'found');
    }
  }

  async markFound(i) {
    const bar = this.bars[i];
    if (bar) {
      bar.classList.add('found');
      bar.classList.remove('compare', 'discarded');
    }
    soundController.playSuccessChime(this.pan);
  }

  playFailureChime() {
    soundController.playFailureChime(this.pan);
  }
}

// Instantiation
const vizA = new Visualizer('a', -0.6); // Left Pan
const vizB = new Visualizer('b', 0.6);  // Right Pan

/**
 * Maps speed slider value (1-100) to actual delay milliseconds.
 */
function getDelayMs() {
  const speed = parseInt(document.getElementById('speed-slider').value);
  if (speed >= 95) return 2;
  if (speed >= 85) return 10;
  if (speed >= 70) return 35;
  if (speed >= 50) return 90;
  if (speed >= 30) return 200;
  return 900 - (speed * 8);
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
  if (document.getElementById('algo-select-a').value === 'binarySearch') {
    vizA.instantSort();
  }
  if (currentMode === 'dual') {
    vizB.setArray(currentArray);
    if (document.getElementById('algo-select-b').value === 'binarySearch') {
      vizB.instantSort();
    }
  }

  // Pick a random element from the newly generated array as the search target
  const randomIdx = Math.floor(Math.random() * currentArray.length);
  const targetVal = currentArray[randomIdx];
  document.getElementById('target-input').value = targetVal;
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
    if (document.getElementById('algo-select-b').value === 'binarySearch') {
      vizB.instantSort();
    }
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
  const targetInput = document.getElementById('target-input');
  const btnRandomTarget = document.getElementById('btn-random-target');

  if (isSortingRunning) {
    generateBtn.disabled = true;
    sizeSlider.disabled = true;
    startBtn.disabled = true;
    targetInput.disabled = true;
    if (btnRandomTarget) btnRandomTarget.disabled = true;
    
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
    targetInput.disabled = false;
    if (btnRandomTarget) btnRandomTarget.disabled = false;

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
 * Triggers full searching execution
 */
async function startSearching() {
  if (isSortingRunning) return;

  const targetInput = document.getElementById('target-input');
  const target = parseInt(targetInput.value);
  if (isNaN(target)) {
    alert("Please enter a valid numeric target!");
    return;
  }

  isSortingRunning = true;
  isPaused = false;

  vizA.isStopped = false;
  vizA.resetStats();
  
  const algoA = document.getElementById('algo-select-a').value;
  
  // Binary Search requires array to be sorted
  if (algoA === 'binarySearch') {
    vizA.instantSort();
  } else {
    vizA.render(); // Ensure clean bars
  }
  
  vizA.startTimer();
  
  const promiseA = SearchingAlgorithms[algoA](vizA, target)
    .then(() => vizA.stopTimer())
    .catch(err => {
      vizA.stopTimer();
      if (err.message !== 'SEARCH_STOPPED') throw err;
    });

  const promises = [promiseA];

  if (currentMode === 'dual') {
    vizB.isStopped = false;
    vizB.resetStats();
    
    const algoB = document.getElementById('algo-select-b').value;
    
    if (algoB === 'binarySearch') {
      vizB.instantSort();
    } else {
      vizB.render(); // Ensure clean bars
    }
    
    vizB.startTimer();

    const promiseB = SearchingAlgorithms[algoB](vizB, target)
      .then(() => vizB.stopTimer())
      .catch(err => {
        vizB.stopTimer();
        if (err.message !== 'SEARCH_STOPPED') throw err;
      });

    promises.push(promiseB);
  }

  updateControlButtons();

  try {
    await Promise.all(promises);
  } catch (e) {
    console.error("Searching execution encountered an error:", e);
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
    vizA.isStopped = true;
    vizB.isStopped = true;
    isPaused = false;
  } else {
    triggerArrayGeneration();
  }
}

/**
 * Event Listeners and Setup
 */
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  
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

  document.getElementById('mode-single').addEventListener('click', () => setViewMode('single'));
  document.getElementById('mode-dual').addEventListener('click', () => setViewMode('dual'));

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

  // Pick random target click
  document.getElementById('btn-random-target').addEventListener('click', () => {
    if (isSortingRunning || currentArray.length === 0) return;
    const randomIdx = Math.floor(Math.random() * currentArray.length);
    document.getElementById('target-input').value = currentArray[randomIdx];
  });

  document.getElementById('algo-select-a').addEventListener('change', (e) => {
    const algo = e.target.value;
    updateEduDetails('a', algo);
    if (algo === 'binarySearch' && !isSortingRunning) {
      vizA.instantSort();
    } else if (!isSortingRunning) {
      vizA.setArray(currentArray);
    }
  });
  document.getElementById('algo-select-b').addEventListener('change', (e) => {
    const algo = e.target.value;
    updateEduDetails('b', algo);
    if (algo === 'binarySearch' && !isSortingRunning) {
      vizB.instantSort();
    } else if (!isSortingRunning) {
      vizB.setArray(currentArray);
    }
  });

  document.getElementById('btn-generate').addEventListener('click', triggerArrayGeneration);
  document.getElementById('btn-start').addEventListener('click', startSearching);
  document.getElementById('btn-pause').addEventListener('click', togglePause);
  document.getElementById('btn-stop').addEventListener('click', handleStopReset);

  triggerArrayGeneration();
  updateEduDetails('a', document.getElementById('algo-select-a').value);
  updateControlButtons();
});
