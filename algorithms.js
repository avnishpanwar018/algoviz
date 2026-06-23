/**
 * algorithms.js
 * Asynchronous implementations of sorting algorithms for visualization.
 * Each algorithm interacts with the Visualizer class via awaited methods:
 * - viz.compare(i, j)
 * - viz.swap(i, j)
 * - viz.setVal(i, val)
 * - viz.markSorted(i)
 * - viz.setPivot(i)
 * - viz.clearPivot(i)
 */

const SortingAlgorithms = {
  /**
   * Bubble Sort
   */
  async bubbleSort(viz) {
    const n = viz.array.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Compare adjacent elements
        await viz.compare(j, j + 1);
        if (viz.array[j] > viz.array[j + 1]) {
          await viz.swap(j, j + 1);
        }
      }
      // The last element is in its final sorted position
      await viz.markSorted(n - i - 1);
    }
    // The first element is also sorted by default now
    await viz.markSorted(0);
  },

  /**
   * Selection Sort
   */
  async selectionSort(viz) {
    const n = viz.array.length;
    for (let i = 0; i < n; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        // Compare current element with the current minimum
        await viz.compare(j, minIdx);
        if (viz.array[j] < viz.array[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        await viz.swap(i, minIdx);
      }
      // Element i is now sorted
      await viz.markSorted(i);
    }
  },

  /**
   * Insertion Sort
   */
  async insertionSort(viz) {
    const n = viz.array.length;
    await viz.markSorted(0);
    for (let i = 1; i < n; i++) {
      let j = i - 1;
      
      // Visually inspect position
      await viz.compare(j, j + 1);
      while (j >= 0 && viz.array[j] > viz.array[j + 1]) {
        await viz.swap(j, j + 1);
        j--;
        if (j >= 0) {
          await viz.compare(j, j + 1);
        }
      }
      
      // Mark all elements up to i as partially sorted/processed
      for (let k = 0; k <= i; k++) {
        await viz.markSorted(k);
      }
    }
    // Re-verify all sorted styles are active at the end
    for (let k = 0; k < n; k++) {
      await viz.markSorted(k);
    }
  },

  /**
   * Merge Sort
   */
  async mergeSort(viz) {
    const n = viz.array.length;
    await SortingAlgorithms._mergeSortHelper(viz, 0, n - 1);
    // Mark everything as sorted
    for (let i = 0; i < n; i++) {
      await viz.markSorted(i);
    }
  },

  async _mergeSortHelper(viz, l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    await SortingAlgorithms._mergeSortHelper(viz, l, m);
    await SortingAlgorithms._mergeSortHelper(viz, m + 1, r);
    await SortingAlgorithms._merge(viz, l, m, r);
  },

  async _merge(viz, l, m, r) {
    const leftArr = viz.array.slice(l, m + 1);
    const rightArr = viz.array.slice(m + 1, r + 1);
    
    let i = 0;
    let j = 0;
    let k = l;
    
    while (i < leftArr.length && j < rightArr.length) {
      // Compare elements from the split sub-arrays
      await viz.compare(l + i, m + 1 + j);
      
      if (leftArr[i] <= rightArr[j]) {
        await viz.setVal(k, leftArr[i]);
        i++;
      } else {
        await viz.setVal(k, rightArr[j]);
        j++;
      }
      k++;
    }
    
    while (i < leftArr.length) {
      await viz.setVal(k, leftArr[i]);
      i++;
      k++;
    }
    
    while (j < rightArr.length) {
      await viz.setVal(k, rightArr[j]);
      j++;
      k++;
    }
  },

  /**
   * Quick Sort
   */
  async quickSort(viz) {
    const n = viz.array.length;
    await SortingAlgorithms._quickSortHelper(viz, 0, n - 1);
    // Finally mark everything sorted
    for (let i = 0; i < n; i++) {
      await viz.markSorted(i);
    }
  },

  async _quickSortHelper(viz, low, high) {
    if (low < high) {
      const pi = await SortingAlgorithms._partition(viz, low, high);
      await SortingAlgorithms._quickSortHelper(viz, low, pi - 1);
      await SortingAlgorithms._quickSortHelper(viz, pi + 1, high);
    } else if (low >= 0 && low < viz.array.length) {
      await viz.markSorted(low);
    }
  },

  async _partition(viz, low, high) {
    let pivot = viz.array[high];
    viz.setPivot(high);
    
    let i = low - 1;
    for (let j = low; j < high; j++) {
      // Compare current element to pivot
      await viz.compare(j, high);
      if (viz.array[j] < pivot) {
        i++;
        await viz.swap(i, j);
      }
    }
    await viz.swap(i + 1, high);
    viz.clearPivot(high);
    
    // The element at i+1 is now in its correct sorted position
    await viz.markSorted(i + 1);
    return i + 1;
  },

  /**
   * Heap Sort
   */
  async heapSort(viz) {
    const n = viz.array.length;
    
    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await SortingAlgorithms._heapify(viz, n, i);
    }
    
    // Extract elements one by one from heap
    for (let i = n - 1; i > 0; i--) {
      // Swap current root to end
      await viz.swap(0, i);
      // Elements sorted from the end of the array
      await viz.markSorted(i);
      
      // Heapify root element to restore max heap on reduced heap
      await SortingAlgorithms._heapify(viz, i, 0);
    }
    await viz.markSorted(0);
  },

  async _heapify(viz, n, i) {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    
    if (l < n) {
      await viz.compare(l, largest);
      if (viz.array[l] > viz.array[largest]) {
        largest = l;
      }
    }
    
    if (r < n) {
      await viz.compare(r, largest);
      if (viz.array[r] > viz.array[largest]) {
        largest = r;
      }
    }
    
    if (largest !== i) {
      await viz.swap(i, largest);
      await SortingAlgorithms._heapify(viz, n, largest);
    }
  }
};
