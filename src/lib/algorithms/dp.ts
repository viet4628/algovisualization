export type DPCell = { value: number | string; highlight?: boolean; current?: boolean; final?: boolean };
export type DPStep = {
  table: DPCell[][];
  rowLabels?: string[];
  colLabels?: string[];
  description: string;
  result?: number | string;
};

export function fibonacciDP(n: number): DPStep[] {
  const steps: DPStep[] = [];
  const dp = new Array(n + 1).fill(0);
  dp[0] = 0; dp[1] = 1;
  function snap(i: number, desc: string) {
    steps.push({
      table: [dp.map((v, idx): DPCell => ({ value: v, current: idx === i, final: idx <= i }))],
      colLabels: dp.map((_, idx) => `F(${idx})`),
      description: desc,
    });
  }
  snap(0, "F(0) = 0");
  if (n >= 1) snap(1, "F(1) = 1");
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    snap(i, `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`);
  }
  steps.push({
    table: [dp.map((v): DPCell => ({ value: v, final: true }))],
    colLabels: dp.map((_, idx) => `F(${idx})`),
    description: `Kết quả: F(${n}) = ${dp[n]}`,
    result: dp[n],
  });
  return steps;
}

export function knapsack01(weights: number[], values: number[], capacity: number): DPStep[] {
  const steps: DPStep[] = [];
  const n = weights.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
  function snap(i: number, j: number, desc: string) {
    const table: DPCell[][] = dp.map((row, ri) => row.map((v, ci) => ({
      value: v,
      current: ri === i && ci === j,
      highlight: ri < i || (ri === i && ci < j),
    })));
    steps.push({
      table,
      rowLabels: ["—", ...weights.map((w, idx) => `Vật ${idx + 1} (w=${w}, v=${values[idx]})`)],
      colLabels: Array.from({ length: capacity + 1 }, (_, c) => `c=${c}`),
      description: desc,
    });
  }
  snap(0, 0, "Khởi tạo: 0 vật phẩm → giá trị 0");
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j <= capacity; j++) {
      if (weights[i - 1] <= j) {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - weights[i - 1]] + values[i - 1]);
        snap(i, j, `dp[${i}][${j}] = max(${dp[i - 1][j]}, ${dp[i - 1][j - weights[i - 1]]} + ${values[i - 1]}) = ${dp[i][j]}`);
      } else {
        dp[i][j] = dp[i - 1][j];
        snap(i, j, `Không đủ chỗ → dp[${i}][${j}] = dp[${i - 1}][${j}] = ${dp[i][j]}`);
      }
    }
  }
  steps.push({
    table: dp.map((row) => row.map((v): DPCell => ({ value: v, final: true }))),
    rowLabels: ["—", ...weights.map((w, idx) => `Vật ${idx + 1}`)],
    colLabels: Array.from({ length: capacity + 1 }, (_, c) => `c=${c}`),
    description: `Giá trị tối đa = ${dp[n][capacity]}`,
    result: dp[n][capacity],
  });
  return steps;
}

export function lcs(a: string, b: string): DPStep[] {
  const steps: DPStep[] = [];
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  function snap(i: number, j: number, desc: string) {
    steps.push({
      table: dp.map((row, ri) => row.map((v, ci): DPCell => ({
        value: v,
        current: ri === i && ci === j,
        highlight: ri < i || (ri === i && ci < j),
      }))),
      rowLabels: ["∅", ...a.split("")],
      colLabels: ["∅", ...b.split("")],
      description: desc,
    });
  }
  snap(0, 0, "Khởi tạo bảng 0");
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        snap(i, j, `'${a[i - 1]}' = '${b[j - 1]}' → dp = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}`);
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        snap(i, j, `'${a[i - 1]}' ≠ '${b[j - 1]}' → dp = max(${dp[i - 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}`);
      }
    }
  }
  steps.push({
    table: dp.map((row) => row.map((v): DPCell => ({ value: v, final: true }))),
    rowLabels: ["∅", ...a.split("")],
    colLabels: ["∅", ...b.split("")],
    description: `Độ dài LCS = ${dp[m][n]}`,
    result: dp[m][n],
  });
  return steps;
}

export function coinChange(coins: number[], amount: number): DPStep[] {
  const steps: DPStep[] = [];
  const INF = amount + 1;
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;
  function snap(j: number, desc: string) {
    steps.push({
      table: [dp.map((v, idx): DPCell => ({
        value: v >= INF ? "∞" : v,
        current: idx === j,
        highlight: idx < j,
      }))],
      colLabels: dp.map((_, idx) => `${idx}`),
      description: desc,
    });
  }
  snap(0, "dp[0] = 0 (cần 0 đồng để có 0)");
  for (let j = 1; j <= amount; j++) {
    for (const c of coins) {
      if (c <= j && dp[j - c] + 1 < dp[j]) dp[j] = dp[j - c] + 1;
    }
    snap(j, `dp[${j}] = ${dp[j] >= INF ? "∞ (không thể)" : dp[j]}`);
  }
  const ans = dp[amount] >= INF ? -1 : dp[amount];
  steps.push({
    table: [dp.map((v): DPCell => ({ value: v >= INF ? "∞" : v, final: true }))],
    colLabels: dp.map((_, idx) => `${idx}`),
    description: `Số đồng tối thiểu = ${ans === -1 ? "không thể" : ans}`,
    result: ans,
  });
  return steps;
}

export const dpAlgorithms = {
  fib: { name: "Fibonacci (DP)", complexity: "O(n)", description: "Tính số Fibonacci bằng quy hoạch động bottom-up." },
  knapsack: { name: "0/1 Knapsack", complexity: "O(n·W)", description: "Cái túi 0/1: chọn các vật để cực đại giá trị với giới hạn trọng lượng." },
  lcs: { name: "Longest Common Subsequence", complexity: "O(m·n)", description: "Tìm dãy con chung dài nhất giữa hai chuỗi." },
  coin: { name: "Coin Change", complexity: "O(n·amount)", description: "Số đồng xu tối thiểu để tạo thành một số tiền cho trước." },
} as const;

export type DPKey = keyof typeof dpAlgorithms;
