export type SortStep = {
  array: number[];
  compared?: [number, number];
  swapped?: [number, number];
  pivot?: number;
  sorted?: number[];
  description: string;
};

export function bubbleSort(arr: number[]): SortStep[] {
  const a = [...arr];
  const steps: SortStep[] = [{ array: [...a], description: "Mảng ban đầu" }];
  const n = a.length;
  const sorted: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ array: [...a], compared: [j, j + 1], sorted: [...sorted], description: `So sánh a[${j}]=${a[j]} và a[${j + 1}]=${a[j + 1]}` });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ array: [...a], swapped: [j, j + 1], sorted: [...sorted], description: `Hoán đổi a[${j}] ↔ a[${j + 1}]` });
      }
    }
    sorted.unshift(n - i - 1);
  }
  sorted.unshift(0);
  steps.push({ array: [...a], sorted, description: "Hoàn tất sắp xếp" });
  return steps;
}

export function selectionSort(arr: number[]): SortStep[] {
  const a = [...arr];
  const steps: SortStep[] = [{ array: [...a], description: "Mảng ban đầu" }];
  const n = a.length;
  const sorted: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      steps.push({ array: [...a], compared: [min, j], sorted: [...sorted], description: `Tìm min: so sánh a[${min}]=${a[min]} với a[${j}]=${a[j]}` });
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      steps.push({ array: [...a], swapped: [i, min], sorted: [...sorted], description: `Hoán đổi a[${i}] ↔ a[${min}]` });
    }
    sorted.push(i);
  }
  sorted.push(n - 1);
  steps.push({ array: [...a], sorted, description: "Hoàn tất" });
  return steps;
}

export function insertionSort(arr: number[]): SortStep[] {
  const a = [...arr];
  const steps: SortStep[] = [{ array: [...a], description: "Mảng ban đầu" }];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    steps.push({ array: [...a], compared: [i, j], description: `Chèn a[${i}]=${key}` });
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      steps.push({ array: [...a], swapped: [j, j + 1], description: `Dịch a[${j}]=${a[j]} sang phải` });
      j--;
    }
    a[j + 1] = key;
    steps.push({ array: [...a], description: `Đặt ${key} vào vị trí ${j + 1}` });
  }
  steps.push({ array: [...a], sorted: a.map((_, i) => i), description: "Hoàn tất" });
  return steps;
}

export function quickSort(arr: number[]): SortStep[] {
  const a = [...arr];
  const steps: SortStep[] = [{ array: [...a], description: "Mảng ban đầu" }];
  const sorted = new Set<number>();
  function qs(lo: number, hi: number) {
    if (lo >= hi) {
      if (lo === hi) sorted.add(lo);
      return;
    }
    const pivot = a[hi];
    steps.push({ array: [...a], pivot: hi, sorted: [...sorted], description: `Chọn pivot a[${hi}]=${pivot}` });
    let i = lo;
    for (let j = lo; j < hi; j++) {
      steps.push({ array: [...a], compared: [j, hi], pivot: hi, sorted: [...sorted], description: `So sánh a[${j}]=${a[j]} với pivot ${pivot}` });
      if (a[j] < pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        if (i !== j) steps.push({ array: [...a], swapped: [i, j], pivot: hi, sorted: [...sorted], description: `Hoán đổi a[${i}] ↔ a[${j}]` });
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    steps.push({ array: [...a], swapped: [i, hi], sorted: [...sorted], description: `Đặt pivot vào vị trí ${i}` });
    sorted.add(i);
    qs(lo, i - 1);
    qs(i + 1, hi);
  }
  qs(0, a.length - 1);
  steps.push({ array: [...a], sorted: a.map((_, i) => i), description: "Hoàn tất" });
  return steps;
}

export function mergeSort(arr: number[]): SortStep[] {
  const a = [...arr];
  const steps: SortStep[] = [{ array: [...a], description: "Mảng ban đầu" }];
  function ms(lo: number, hi: number) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    ms(lo, mid);
    ms(mid + 1, hi);
    const merged: number[] = [];
    let i = lo, j = mid + 1;
    while (i <= mid && j <= hi) {
      steps.push({ array: [...a], compared: [i, j], description: `Hợp nhất: so sánh a[${i}]=${a[i]} và a[${j}]=${a[j]}` });
      if (a[i] <= a[j]) merged.push(a[i++]);
      else merged.push(a[j++]);
    }
    while (i <= mid) merged.push(a[i++]);
    while (j <= hi) merged.push(a[j++]);
    for (let k = 0; k < merged.length; k++) a[lo + k] = merged[k];
    steps.push({ array: [...a], description: `Đã hợp nhất [${lo}..${hi}]` });
  }
  ms(0, a.length - 1);
  steps.push({ array: [...a], sorted: a.map((_, i) => i), description: "Hoàn tất" });
  return steps;
}

export const sortingAlgorithms = {
  bubble: { name: "Bubble Sort", fn: bubbleSort, complexity: "O(n²)", description: "So sánh và hoán đổi các phần tử kề nhau, lặp đi lặp lại đến khi mảng được sắp xếp." },
  selection: { name: "Selection Sort", fn: selectionSort, complexity: "O(n²)", description: "Lặp lại tìm phần tử nhỏ nhất từ phần chưa sắp xếp và đặt vào đầu." },
  insertion: { name: "Insertion Sort", fn: insertionSort, complexity: "O(n²)", description: "Xây dựng mảng đã sắp xếp từng phần tử một, mỗi phần tử được chèn đúng vị trí." },
  quick: { name: "Quick Sort", fn: quickSort, complexity: "O(n log n)", description: "Chọn pivot, phân hoạch mảng quanh pivot rồi đệ quy hai nửa." },
  merge: { name: "Merge Sort", fn: mergeSort, complexity: "O(n log n)", description: "Chia mảng làm đôi, sắp xếp đệ quy rồi hợp nhất hai phần đã sắp xếp." },
} as const;

export type SortingKey = keyof typeof sortingAlgorithms;
