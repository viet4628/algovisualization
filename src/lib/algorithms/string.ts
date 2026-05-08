export type StringStep = {
  text: string;
  pattern: string;
  textIdx: number;
  patternIdx: number;
  matches: number[];
  status: "comparing" | "match" | "mismatch" | "found" | "done";
  description: string;
  lps?: number[];
  hash?: { textHash: number; patternHash: number };
};

export function naiveSearch(text: string, pattern: string): StringStep[] {
  const steps: StringStep[] = [];
  const matches: number[] = [];
  const n = text.length, m = pattern.length;
  steps.push({ text, pattern, textIdx: 0, patternIdx: 0, matches: [], status: "comparing", description: "Bắt đầu khớp tuần tự" });
  for (let i = 0; i <= n - m; i++) {
    let j = 0;
    while (j < m) {
      steps.push({ text, pattern, textIdx: i + j, patternIdx: j, matches: [...matches], status: text[i + j] === pattern[j] ? "match" : "mismatch", description: `So sánh text[${i + j}]='${text[i + j]}' với pattern[${j}]='${pattern[j]}'` });
      if (text[i + j] !== pattern[j]) break;
      j++;
    }
    if (j === m) {
      matches.push(i);
      steps.push({ text, pattern, textIdx: i, patternIdx: 0, matches: [...matches], status: "found", description: `Khớp toàn bộ tại vị trí ${i}` });
    }
  }
  steps.push({ text, pattern, textIdx: 0, patternIdx: 0, matches, status: "done", description: `Hoàn tất. Tìm thấy ${matches.length} lần` });
  return steps;
}

function buildLPS(pattern: string): number[] {
  const lps = new Array(pattern.length).fill(0);
  let len = 0, i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) { lps[i++] = ++len; }
    else if (len !== 0) len = lps[len - 1];
    else lps[i++] = 0;
  }
  return lps;
}

export function kmpSearch(text: string, pattern: string): StringStep[] {
  const steps: StringStep[] = [];
  const matches: number[] = [];
  const lps = buildLPS(pattern);
  const n = text.length, m = pattern.length;
  steps.push({ text, pattern, textIdx: 0, patternIdx: 0, matches: [], status: "comparing", description: `Đã xây mảng LPS = [${lps.join(",")}]`, lps });
  let i = 0, j = 0;
  while (i < n) {
    steps.push({ text, pattern, textIdx: i, patternIdx: j, matches: [...matches], status: text[i] === pattern[j] ? "match" : "mismatch", description: `So sánh text[${i}]='${text[i]}' với pattern[${j}]='${pattern[j]}'`, lps });
    if (text[i] === pattern[j]) {
      i++; j++;
      if (j === m) {
        matches.push(i - j);
        steps.push({ text, pattern, textIdx: i - j, patternIdx: 0, matches: [...matches], status: "found", description: `Khớp tại ${i - j}, dùng LPS để dịch chuyển`, lps });
        j = lps[j - 1];
      }
    } else {
      if (j !== 0) {
        steps.push({ text, pattern, textIdx: i, patternIdx: j, matches: [...matches], status: "mismatch", description: `Mismatch, dịch j từ ${j} về ${lps[j - 1]} (nhờ LPS)`, lps });
        j = lps[j - 1];
      } else i++;
    }
  }
  steps.push({ text, pattern, textIdx: 0, patternIdx: 0, matches, status: "done", description: `Hoàn tất. Tìm thấy ${matches.length} lần`, lps });
  return steps;
}

export function rabinKarpSearch(text: string, pattern: string): StringStep[] {
  const steps: StringStep[] = [];
  const matches: number[] = [];
  const m = pattern.length, n = text.length;
  const base = 256, mod = 101;
  let patternHash = 0, textHash = 0, h = 1;
  for (let i = 0; i < m - 1; i++) h = (h * base) % mod;
  for (let i = 0; i < m; i++) {
    patternHash = (base * patternHash + pattern.charCodeAt(i)) % mod;
    textHash = (base * textHash + text.charCodeAt(i)) % mod;
  }
  steps.push({ text, pattern, textIdx: 0, patternIdx: 0, matches: [], status: "comparing", description: `Hash pattern = ${patternHash}`, hash: { patternHash, textHash } });
  for (let i = 0; i <= n - m; i++) {
    steps.push({ text, pattern, textIdx: i, patternIdx: 0, matches: [...matches], status: textHash === patternHash ? "match" : "mismatch", description: `Hash text[${i}..${i + m - 1}] = ${textHash}, pattern = ${patternHash}`, hash: { patternHash, textHash } });
    if (textHash === patternHash) {
      let j = 0;
      for (; j < m; j++) if (text[i + j] !== pattern[j]) break;
      if (j === m) {
        matches.push(i);
        steps.push({ text, pattern, textIdx: i, patternIdx: 0, matches: [...matches], status: "found", description: `Hash khớp + xác minh kí tự → match tại ${i}`, hash: { patternHash, textHash } });
      } else {
        steps.push({ text, pattern, textIdx: i, patternIdx: j, matches: [...matches], status: "mismatch", description: `Hash trùng nhưng kí tự không khớp (collision)`, hash: { patternHash, textHash } });
      }
    }
    if (i < n - m) {
      textHash = (base * (textHash - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % mod;
      if (textHash < 0) textHash += mod;
    }
  }
  steps.push({ text, pattern, textIdx: 0, patternIdx: 0, matches, status: "done", description: `Hoàn tất. Tìm thấy ${matches.length} lần` });
  return steps;
}

export const stringAlgorithms = {
  naive: { name: "Naive Search", fn: naiveSearch, complexity: "O(n·m)", description: "So khớp tuần tự pattern tại mỗi vị trí của text." },
  kmp: { name: "KMP", fn: kmpSearch, complexity: "O(n+m)", description: "Knuth-Morris-Pratt: tránh so sánh lại nhờ mảng LPS (longest proper prefix-suffix)." },
  rabinKarp: { name: "Rabin-Karp", fn: rabinKarpSearch, complexity: "O(n+m) trung bình", description: "Dùng hash trượt (rolling hash) để so khớp nhanh các cửa sổ." },
} as const;

export type StringKey = keyof typeof stringAlgorithms;
