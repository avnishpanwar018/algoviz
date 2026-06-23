# 📊 AlgoViz — Algorithm Visualizer

A professional, visually stunning sorting algorithm visualizer with real-time animations, audio synthesis, and side-by-side comparison mode.

![Made with](https://img.shields.io/badge/AlgoViz-Algorithm%20Visualizer-blueviolet?style=for-the-badge)

---

## ✨ Features

### 🎯 Core Visualization
- **6 Sorting Algorithms** — Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort, and Heap Sort
- **Real-time Bar Animations** — Color-coded bars indicate comparisons (yellow), swaps (red), pivots (blue), and sorted elements (green)
- **Live Statistics HUD** — Track comparisons, swaps/writes, and elapsed time in real-time

### ⚡ Interactive Controls
- **Array Size Slider** — Dynamically adjust the number of elements (10–150)
- **Speed Slider** — Control animation speed from slow-motion to near-instant
- **Pause / Resume** — Freeze and resume the sorting process at any point
- **Stop / Reset** — Halt a running sort or regenerate a fresh random array

### 🔀 Comparison Mode
- **Single Mode** — Visualize one algorithm at a time
- **Dual (Comparison) Mode** — Run two different algorithms side-by-side on the same initial array to compare performance in real-time

### 🔊 Audio Synthesis
- **Web Audio API** — Pitch-mapped sound effects where each bar's value is mapped to a frequency (160 Hz – 1000 Hz)
- **Stereo Panning** — In comparison mode, Visualizer A pans left and Visualizer B pans right for spatial audio separation
- Toggle sound on/off with one click

### 🎨 Theming
- **Dark Mode** (default) — Sleek glassmorphism design with purple accent colors
- **Light Mode** — Clean, bright interface with adapted color palette
- Smooth theme transitions

### 📚 Educational Details
- **Algorithm Description** — Detailed explanation of how each algorithm works
- **Complexity Table** — Best, Average, and Worst-case time complexity, space complexity, and stability for every algorithm
- Automatically updates when you switch algorithms

---

## 🗂️ Project Structure

```
algoviz/
├── index.html        # Main HTML structure and layout
├── style.css         # Complete styling with dark/light themes
├── script.js         # UI controller, state management, and Visualizer class
├── algorithms.js     # Async sorting algorithm implementations
└── README.md         # You are here
```

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- No build tools, frameworks, or dependencies required

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/avnishpanwar018/algoviz.git
   cd algoviz
   ```

2. **Open `index.html`** in your browser
   ```bash
   # Option 1: Direct file open
   open index.html          # macOS
   start index.html         # Windows

   # Option 2: Use a local server (recommended for audio features)
   npx serve .
   ```

That's it — no `npm install`, no build step.

---

## 🎮 How to Use

| Step | Action |
|------|--------|
| 1 | Adjust **Array Size** and **Speed** using the sliders |
| 2 | Select a sorting algorithm from the dropdown |
| 3 | Click **✦ Generate Array** to create a new random dataset |
| 4 | Click **▶ Visualize** to start the sort animation |
| 5 | Use **⏸ Pause** / **▶ Resume** to control playback |
| 6 | Click **✕ Stop** to halt, or **↺ Reset** to regenerate |
| 7 | Toggle **Comparison Mode** to run two algorithms side-by-side |
| 8 | Enable **Sound** for audio feedback during sorting |
| 9 | Switch between **Dark** and **Light** themes |

---

## 📊 Supported Algorithms

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ Yes |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | ❌ No |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ Yes |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ Yes |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ No |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ No |

---

## 🎨 Color Legend

| Color | Meaning |
|-------|---------|
| 🟡 **Yellow** | Elements being compared |
| 🔴 **Red** | Elements being swapped or written |
| 🔵 **Blue** | Current pivot element (Quick Sort) |
| 🟢 **Green** | Element is in its final sorted position |
| 🟣 **Purple** | Default unsorted element |

---

<p align="center">
  <strong>AlgoViz</strong> — Visualize. Compare. Learn.
</p>
