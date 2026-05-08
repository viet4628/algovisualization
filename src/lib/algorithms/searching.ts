export type SearchStep = {
  array: number[];
  current?: number;
  range?: [number, number];
  found?: number;
  description: string;
};

export function linearSearch(arr: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = [{ array: arr, description: `Tìm ${target} bằng tuyến tính` }];
  for (let i = 0; i < arr.length; i++) {
    steps.push({ array: arr, current: i, description: `Kiểm tra a[${i}]=${arr[i]}` });
    if (arr[i] === target) {
      steps.push({ array: arr, current: i, found: i, description: `Tìm thấy tại vị trí ${i}` });
      return steps;
    }
  }
  steps.push({ array: arr, description: `Không tìm thấy ${target}` });
  return steps;
}

export function binarySearch(arr: number[], target: number): SearchStep[] {
  const sorted = [...arr].sort((x, y) => x - y);
  const steps: SearchStep[] = [{ array: sorted, description: `Mảng đã sắp xếp. Tìm ${target}` }];
  let lo = 0, hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({ array: sorted, current: mid, range: [lo, hi], description: `lo=${lo}, hi=${hi}, mid=${mid}, a[${mid}]=${sorted[mid]}` });
    if (sorted[mid] === target) {
      steps.push({ array: sorted, current: mid, found: mid, description: `Tìm thấy ${target} tại ${mid}` });
      return steps;
    } else if (sorted[mid] < target) {
      lo = mid + 1;
      steps.push({ array: sorted, range: [lo, hi], description: `${sorted[mid]} < ${target}, tìm nửa phải` });
    } else {
      hi = mid - 1;
      steps.push({ array: sorted, range: [lo, hi], description: `${sorted[mid]} > ${target}, tìm nửa trái` });
    }
  }
  steps.push({ array: sorted, description: `Không tìm thấy ${target}` });
  return steps;
}

export function jumpSearch(arr: number[], target: number): SearchStep[] {
  const sorted = [...arr].sort((x, y) => x - y);
  const n = sorted.length;
  const step = Math.floor(Math.sqrt(n));
  const steps: SearchStep[] = [{ array: sorted, description: `Mảng đã sắp xếp. Bước nhảy = ⌊√${n}⌋ = ${step}` }];
  let prev = 0, cur = step;
  while (cur < n && sorted[Math.min(cur, n) - 1] < target) {
    steps.push({ array: sorted, current: Math.min(cur, n) - 1, range: [prev, Math.min(cur, n) - 1], description: `Nhảy đến ${Math.min(cur, n) - 1}, giá trị ${sorted[Math.min(cur, n) - 1]} < ${target}` });
    prev = cur;
    cur += step;
  }
  for (let i = prev; i < Math.min(cur, n); i++) {
    steps.push({ array: sorted, current: i, range: [prev, Math.min(cur, n) - 1], description: `Quét tuyến tính trong khối: a[${i}]=${sorted[i]}` });
    if (sorted[i] === target) {
      steps.push({ array: sorted, current: i, found: i, description: `Tìm thấy tại ${i}` });
      return steps;
    }
  }
  steps.push({ array: sorted, description: `Không tìm thấy ${target}` });
  return steps;
}

export function interpolationSearch(arr: number[], target: number): SearchStep[] {
  const sorted = [...arr].sort((x, y) => x - y);
  const steps: SearchStep[] = [{ array: sorted, description: `Mảng đã sắp xếp. Tìm ${target} bằng nội suy` }];
  let lo = 0, hi = sorted.length - 1;
  while (lo <= hi && target >= sorted[lo] && target <= sorted[hi]) {
    if (lo === hi) {
      if (sorted[lo] === target) steps.push({ array: sorted, current: lo, found: lo, description: `Tìm thấy ${target} tại ${lo}` });
      else steps.push({ array: sorted, description: `Không tìm thấy` });
      return steps;
    }
    const pos = lo + Math.floor(((target - sorted[lo]) * (hi - lo)) / (sorted[hi] - sorted[lo]));
    steps.push({ array: sorted, current: pos, range: [lo, hi], description: `Ước lượng vị trí pos=${pos}, a[${pos}]=${sorted[pos]}` });
    if (sorted[pos] === target) {
      steps.push({ array: sorted, current: pos, found: pos, description: `Tìm thấy ${target} tại ${pos}` });
      return steps;
    }
    if (sorted[pos] < target) lo = pos + 1;
    else hi = pos - 1;
  }
  steps.push({ array: sorted, description: `Không tìm thấy ${target}` });
  return steps;
}

export function exponentialSearch(arr: number[], target: number): SearchStep[] {
  const sorted = [...arr].sort((x, y) => x - y);
  const n = sorted.length;
  const steps: SearchStep[] = [{ array: sorted, description: `Mảng đã sắp xếp. Tìm khoảng chứa ${target}` }];
  if (sorted[0] === target) {
    steps.push({ array: sorted, current: 0, found: 0, description: `Tìm thấy tại 0` });
    return steps;
  }
  let i = 1;
  while (i < n && sorted[i] <= target) {
    steps.push({ array: sorted, current: i, description: `Mở rộng i=${i}, a[${i}]=${sorted[i]}` });
    i *= 2;
  }
  const lo = i / 2, hi = Math.min(i, n - 1);
  steps.push({ array: sorted, range: [lo, hi], description: `Khoanh vùng [${lo}..${hi}], chuyển binary search` });
  let l = lo, h = hi;
  while (l <= h) {
    const m = Math.floor((l + h) / 2);
    steps.push({ array: sorted, current: m, range: [l, h], description: `mid=${m}, a[${m}]=${sorted[m]}` });
    if (sorted[m] === target) {
      steps.push({ array: sorted, current: m, found: m, description: `Tìm thấy tại ${m}` });
      return steps;
    }
    if (sorted[m] < target) l = m + 1;
    else h = m - 1;
  }
  steps.push({ array: sorted, description: `Không tìm thấy` });
  return steps;
}

export function ternarySearch(arr: number[], target: number): SearchStep[] {
  const sorted = [...arr].sort((x, y) => x - y);
  const steps: SearchStep[] = [{ array: sorted, description: `Mảng đã sắp xếp. Tìm tam phân ${target}` }];
  let lo = 0, hi = sorted.length - 1;
  while (lo <= hi) {
    const m1 = lo + Math.floor((hi - lo) / 3);
    const m2 = hi - Math.floor((hi - lo) / 3);
    steps.push({ array: sorted, current: m1, range: [lo, hi], description: `m1=${m1} (a=${sorted[m1]}), m2=${m2} (a=${sorted[m2]})` });
    if (sorted[m1] === target) {
      steps.push({ array: sorted, current: m1, found: m1, description: `Tìm thấy tại ${m1}` });
      return steps;
    }
    if (sorted[m2] === target) {
      steps.push({ array: sorted, current: m2, found: m2, description: `Tìm thấy tại ${m2}` });
      return steps;
    }
    if (target < sorted[m1]) hi = m1 - 1;
    else if (target > sorted[m2]) lo = m2 + 1;
    else { lo = m1 + 1; hi = m2 - 1; }
  }
  steps.push({ array: sorted, description: `Không tìm thấy ${target}` });
  return steps;
}

export const searchingAlgorithms = {
  linear: { name: "Linear Search", fn: linearSearch, complexity: "O(n)", description: "Duyệt tuần tự từng phần tử cho đến khi tìm thấy giá trị mục tiêu." },
  binary: { name: "Binary Search", fn: binarySearch, complexity: "O(log n)", description: "Yêu cầu mảng đã sắp xếp. Liên tục chia đôi phạm vi tìm kiếm." },
  jump: { name: "Jump Search", fn: jumpSearch, complexity: "O(√n)", description: "Nhảy theo bước √n để khoanh vùng rồi quét tuyến tính." },
  interpolation: { name: "Interpolation Search", fn: interpolationSearch, complexity: "O(log log n)", description: "Ước lượng vị trí dựa trên giá trị, hiệu quả cho dữ liệu phân bố đều." },
  exponential: { name: "Exponential Search", fn: exponentialSearch, complexity: "O(log n)", description: "Mở rộng phạm vi theo cấp số nhân rồi binary search." },
  ternary: { name: "Ternary Search", fn: ternarySearch, complexity: "O(log₃ n)", description: "Chia phạm vi làm ba phần thay vì hai như binary search." },
} as const;
