# 📊 AlgoViz — Algorithm Visualizer

A professional, visually stunning multi-page algorithm visualizer with real-time animations, Web Audio API synthesis, side-by-side comparison mode, and complete educational HUD boards for both **Sorting** and **Searching** algorithms.

![Made with](https://img.shields.io/badge/AlgoViz-Algorithm%20Visualizer-blueviolet?style=for-the-badge)

---

## ✨ Features

### 🔍 Searching Visualizer Module
- **Supported Algorithms** — Linear Search and Binary Search
- **Auto-Sorting Sync** — Binary Search automatically sorts the visualizer array instantly before running to demonstrate search ranges correctly. Selecting Linear Search restores the original unsorted array.
- **Interactive Target Selector** — Type in a custom numerical target to search for, or click the `🎯 Random` button to pick a target directly from the array.
- **Search Range Dimming** — Elements excluded from the search bounds fade dynamically to `12%` opacity, emphasizing the shrinking search space (perfect for Binary Search).
- **Ascending/Descending Chimes** — Play a custom 4-tone ascending success arpeggio when the target is found, and a sad 2-tone descending failure chime when a target is missing.

### 📊 Sorting Visualizer Module
- **Supported Algorithms** — Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort, and Heap Sort.
- **Visual Swaps & Pivots** — Color-coded elements highlight comparisons (yellow), swaps (red), pivots (blue), and sorted states (green).
- **Real-Time Statistics** — Live counter tracking exact compares, swaps/writes, and execution times.

### ⚡ Global Interactions
- **Premium Landing Page** — Glassmorphic hub allowing users to select either the Sorting or Searching modules.
- **Dual Comparison Mode** — Run two different algorithms side-by-side on identical generated arrays (Sorting or Searching) to compare execution speed and complexity in real-time.
- **Global Sliders** — Customize Array Size (10–150 elements) and Speed (from slow-motion steps up to near-instant runs).
- **Audio synthesis** — Dynamic pitch-mapped feedback using Web Audio API where note frequencies are proportional to the array heights. Supports Left/Right stereo-panning in comparison mode.
- **Dark/Light Mode** — Sleek glassmorphic dark interface by default, with an elegant light theme switch.

---

## 🗂️ Project Structure

```
algoviz/
│
├── index.html                   # Root landing page (Navigation Hub)
├── style.css                    # Shared global stylesheet (Glassmorphism design system)
│
├── searching/                   # Searching Module
│   ├── index.html               # Searching UI structure
│   ├── script.js                # Searching event controller and UI orchestrator
│   └── algorithms.js            # Searching algorithms (Linear, Binary)
│
└── sorting/                     # Sorting Module
    ├── index.html               # Sorting UI structure
    ├── script.js                # Sorting event controller and UI orchestrator
    └── algorithms.js            # Sorting algorithms (Bubble, Selection, etc.)
```

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser supporting Web Audio API and CSS Grid/Flexbox (Chrome, Firefox, Safari, Edge).
- No package installs or complex developer dependencies are needed!

### Installation & Launch

1. **Clone the repository**
   ```bash
   git clone https://github.com/avnishpanwar018/algoviz.git
   cd algoviz
   ```

2. **Start a local HTTP server** (highly recommended for Audio Context features to run smoothly):
   ```bash
   # Using Python (Built-in)
   python -m http.server 8000

   # Using Node.js/npx
   npx http-server -p 8000
   ```

3. **Open browser** and visit `http://localhost:8000`.

---

## 📊 Supported Algorithms

### Searching
| Algorithm | Best | Average | Worst | Space | Requires Sorted Array |
|-----------|------|---------|-------|-------|-----------------------|
| **Linear Search** | O(1) | O(n) | O(n) | O(1) | ❌ No |
| **Binary Search** | O(1) | O(log n) | O(log n) | O(1) | ✅ Yes |

### Sorting
| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| **Bubble Sort** | O(n) | O(n²) | O(n²) | O(1) | ✅ Yes |
| **Selection Sort** | O(n²) | O(n²) | O(n²) | O(1) | ❌ No |
| **Insertion Sort** | O(n) | O(n²) | O(n²) | O(1) | ✅ Yes |
| **Merge Sort** | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ Yes |
| **Quick Sort** | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ No |
| **Heap Sort** | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ No |

---

## 🎨 Color Legend

### Searching Colors
- 🟡 **Yellow** | Element being compared to target
- 🔘 **Dimmed (12% Opacity)** | Discarded elements (excluded from search space)
- 🔵 **Cyan Glow** | Target element found!

### Sorting Colors
- 🟡 **Yellow** | Elements being compared
- 🔴 **Red** | Elements being swapped or written
- 🔵 **Blue** | Current pivot element (Quick Sort)
- 🟢 **Green** | Element in its final sorted position

---

<p align="center">
  <strong>AlgoViz</strong> — Visualize. Compare. Learn.
</p>
