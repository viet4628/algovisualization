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

export const searchingAlgorithms = {
  linear: { name: "Linear Search", fn: linearSearch, complexity: "O(n)", description: "Duyệt tuần tự từng phần tử cho đến khi tìm thấy giá trị mục tiêu." },
  binary: { name: "Binary Search", fn: binarySearch, complexity: "O(log n)", description: "Yêu cầu mảng đã sắp xếp. Liên tục chia đôi phạm vi tìm kiếm." },
} as const;
