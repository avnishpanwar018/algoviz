/**
 * algorithms.js
 * Asynchronous implementations of searching algorithms for visualization.
 * Each algorithm interacts with the Visualizer class via awaited methods:
 * - viz.compare(i)
 * - viz.markDiscarded(i)
 * - viz.markFound(i)
 * - viz.delay()
 * - viz.playFailureChime()
 */

const SearchingAlgorithms = {
  /**
   * Linear Search
   * Scans elements one by one from left to right.
   */
  async linearSearch(viz, target) {
    const n = viz.array.length;
    for (let i = 0; i < n; i++) {
      // Highlight the element currently being inspected
      await viz.compare(i);
      
      if (viz.array[i] === target) {
        await viz.markFound(i);
        return i; // Found!
      } else {
        await viz.markDiscarded(i);
      }
    }
    
    // If not found after scanning the entire array
    viz.playFailureChime();
    return -1;
  },

  /**
   * Binary Search
   * Narrows down the search interval by half each time on a sorted array.
   */
  async binarySearch(viz, target) {
    const n = viz.array.length;
    let low = 0;
    let high = n - 1;

    // Discard initial highlights if any
    for (let k = 0; k < n; k++) {
      viz.bars[k].className = 'array-bar';
    }

    while (low <= high) {
      // Visual range update: mark any elements outside [low, high] as discarded
      for (let k = 0; k < n; k++) {
        if (k < low || k > high) {
          viz.bars[k].classList.add('discarded');
        }
      }

      const mid = Math.floor((low + high) / 2);
      
      // Compare the middle element
      await viz.compare(mid);

      if (viz.array[mid] === target) {
        // Discard all other elements visually
        for (let k = 0; k < n; k++) {
          if (k !== mid) {
            viz.bars[k].classList.add('discarded');
          }
        }
        await viz.markFound(mid);
        return mid; // Target found
      }

      if (viz.array[mid] < target) {
        // Target is larger, so it is in the right half. Discard left half.
        for (let k = low; k <= mid; k++) {
          viz.bars[k].classList.add('discarded');
        }
        low = mid + 1;
      } else {
        // Target is smaller, so it is in the left half. Discard right half.
        for (let k = mid; k <= high; k++) {
          viz.bars[k].classList.add('discarded');
        }
        high = mid - 1;
      }

      await viz.delay(); // Simple step delay to let range updates settle visually
    }

    // Target not found: discard remaining elements
    for (let k = 0; k < n; k++) {
      viz.bars[k].classList.add('discarded');
    }
    viz.playFailureChime();
    return -1;
  }
};
