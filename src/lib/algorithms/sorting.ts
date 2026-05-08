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

export function heapSort(arr: number[]): SortStep[] {
  const a = [...arr];
  const steps: SortStep[] = [{ array: [...a], description: "Mảng ban đầu" }];
  const n = a.length;
  const sorted: number[] = [];
  function heapify(size: number, i: number) {
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < size) {
      steps.push({ array: [...a], compared: [largest, l], sorted: [...sorted], description: `So sánh nút ${largest} với con trái ${l}` });
      if (a[l] > a[largest]) largest = l;
    }
    if (r < size) {
      steps.push({ array: [...a], compared: [largest, r], sorted: [...sorted], description: `So sánh với con phải ${r}` });
      if (a[r] > a[largest]) largest = r;
    }
    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      steps.push({ array: [...a], swapped: [i, largest], sorted: [...sorted], description: `Hoán đổi để duy trì max-heap` });
      heapify(size, largest);
    }
  }
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
  steps.push({ array: [...a], description: "Đã build max-heap" });
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    sorted.unshift(i);
    steps.push({ array: [...a], swapped: [0, i], sorted: [...sorted], description: `Đưa max về cuối, cố định vị trí ${i}` });
    heapify(i, 0);
  }
  sorted.unshift(0);
  steps.push({ array: [...a], sorted, description: "Hoàn tất" });
  return steps;
}

export function shellSort(arr: number[]): SortStep[] {
  const a = [...arr];
  const steps: SortStep[] = [{ array: [...a], description: "Mảng ban đầu" }];
  const n = a.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    steps.push({ array: [...a], description: `Khoảng cách gap = ${gap}` });
    for (let i = gap; i < n; i++) {
      const tmp = a[i];
      let j = i;
      while (j >= gap && a[j - gap] > tmp) {
        steps.push({ array: [...a], compared: [j - gap, j], description: `So sánh a[${j - gap}] và ${tmp}` });
        a[j] = a[j - gap];
        steps.push({ array: [...a], swapped: [j - gap, j], description: `Dịch a[${j - gap}] sang vị trí ${j}` });
        j -= gap;
      }
      a[j] = tmp;
    }
  }
  steps.push({ array: [...a], sorted: a.map((_, i) => i), description: "Hoàn tất" });
  return steps;
}

export function cocktailSort(arr: number[]): SortStep[] {
  const a = [...arr];
  const steps: SortStep[] = [{ array: [...a], description: "Mảng ban đầu" }];
  let lo = 0, hi = a.length - 1, swapped = true;
  const sorted: number[] = [];
  while (swapped) {
    swapped = false;
    for (let i = lo; i < hi; i++) {
      steps.push({ array: [...a], compared: [i, i + 1], sorted: [...sorted], description: `→ So sánh a[${i}], a[${i + 1}]` });
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        steps.push({ array: [...a], swapped: [i, i + 1], sorted: [...sorted], description: `Hoán đổi` });
        swapped = true;
      }
    }
    sorted.push(hi--);
    if (!swapped) break;
    swapped = false;
    for (let i = hi - 1; i >= lo; i--) {
      steps.push({ array: [...a], compared: [i, i + 1], sorted: [...sorted], description: `← So sánh a[${i}], a[${i + 1}]` });
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        steps.push({ array: [...a], swapped: [i, i + 1], sorted: [...sorted], description: `Hoán đổi` });
        swapped = true;
      }
    }
    sorted.push(lo++);
  }
  steps.push({ array: [...a], sorted: a.map((_, i) => i), description: "Hoàn tất" });
  return steps;
}

export function gnomeSort(arr: number[]): SortStep[] {
  const a = [...arr];
  const steps: SortStep[] = [{ array: [...a], description: "Mảng ban đầu" }];
  let i = 0;
  while (i < a.length) {
    if (i === 0) i++;
    else {
      steps.push({ array: [...a], compared: [i - 1, i], description: `So sánh a[${i - 1}], a[${i}]` });
      if (a[i] >= a[i - 1]) i++;
      else {
        [a[i], a[i - 1]] = [a[i - 1], a[i]];
        steps.push({ array: [...a], swapped: [i - 1, i], description: `Hoán đổi và lùi` });
        i--;
      }
    }
  }
  steps.push({ array: [...a], sorted: a.map((_, i) => i), description: "Hoàn tất" });
  return steps;
}

export function countingSort(arr: number[]): SortStep[] {
  const a = [...arr];
  const steps: SortStep[] = [{ array: [...a], description: "Mảng ban đầu" }];
  const max = Math.max(...a);
  const count = new Array(max + 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    count[a[i]]++;
    steps.push({ array: [...a], compared: [i, i], description: `Đếm: count[${a[i]}] = ${count[a[i]]}` });
  }
  const out = [...a];
  let idx = 0;
  for (let v = 0; v <= max; v++) {
    while (count[v]-- > 0) {
      out[idx] = v;
      steps.push({ array: [...out], swapped: [idx, idx], description: `Đặt giá trị ${v} vào vị trí ${idx}` });
      idx++;
    }
  }
  steps.push({ array: out, sorted: out.map((_, i) => i), description: "Hoàn tất" });
  return steps;
}

export function radixSort(arr: number[]): SortStep[] {
  const a = [...arr];
  const steps: SortStep[] = [{ array: [...a], description: "Mảng ban đầu" }];
  const max = Math.max(...a);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const out = new Array(a.length).fill(0);
    const count = new Array(10).fill(0);
    for (let i = 0; i < a.length; i++) count[Math.floor(a[i] / exp) % 10]++;
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = a.length - 1; i >= 0; i--) {
      const d = Math.floor(a[i] / exp) % 10;
      out[--count[d]] = a[i];
    }
    for (let i = 0; i < a.length; i++) a[i] = out[i];
    steps.push({ array: [...a], description: `Đã sắp xếp theo chữ số hàng ${exp}` });
  }
  steps.push({ array: [...a], sorted: a.map((_, i) => i), description: "Hoàn tất" });
  return steps;
}

export const sortingAlgorithms = {
  bubble: { name: "Bubble Sort", fn: bubbleSort, complexity: "O(n²)", description: "So sánh và hoán đổi các phần tử kề nhau, lặp đi lặp lại đến khi mảng được sắp xếp." },
  selection: { name: "Selection Sort", fn: selectionSort, complexity: "O(n²)", description: "Lặp lại tìm phần tử nhỏ nhất từ phần chưa sắp xếp và đặt vào đầu." },
  insertion: { name: "Insertion Sort", fn: insertionSort, complexity: "O(n²)", description: "Xây dựng mảng đã sắp xếp từng phần tử một, mỗi phần tử được chèn đúng vị trí." },
  quick: { name: "Quick Sort", fn: quickSort, complexity: "O(n log n)", description: "Chọn pivot, phân hoạch mảng quanh pivot rồi đệ quy hai nửa." },
  merge: { name: "Merge Sort", fn: mergeSort, complexity: "O(n log n)", description: "Chia mảng làm đôi, sắp xếp đệ quy rồi hợp nhất hai phần đã sắp xếp." },
  heap: { name: "Heap Sort", fn: heapSort, complexity: "O(n log n)", description: "Xây dựng max-heap rồi liên tục lấy phần tử lớn nhất ra cuối." },
  shell: { name: "Shell Sort", fn: shellSort, complexity: "O(n^1.3)", description: "Insertion sort cải tiến với khoảng cách (gap) giảm dần." },
  cocktail: { name: "Cocktail Sort", fn: cocktailSort, complexity: "O(n²)", description: "Bubble sort hai chiều, quét xuôi và ngược trên mỗi vòng." },
  gnome: { name: "Gnome Sort", fn: gnomeSort, complexity: "O(n²)", description: "So sánh phần tử với phần tử trước, hoán đổi và lùi nếu cần." },
  counting: { name: "Counting Sort", fn: countingSort, complexity: "O(n+k)", description: "Đếm số lần xuất hiện rồi tái tạo mảng. Phù hợp số nguyên có giới hạn." },
  radix: { name: "Radix Sort", fn: radixSort, complexity: "O(d·n)", description: "Sắp xếp số nguyên theo từng chữ số, từ thấp đến cao (LSD)." },
} as const;

export type SortingKey = keyof typeof sortingAlgorithms;
