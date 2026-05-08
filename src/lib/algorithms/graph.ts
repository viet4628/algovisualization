export type GraphNode = { id: string; x: number; y: number };
export type GraphEdge = { from: string; to: string; weight: number };
export type Graph = { nodes: GraphNode[]; edges: GraphEdge[] };

export type GraphStep = {
  visited: string[];
  current?: string;
  frontier?: string[];
  edge?: [string, string];
  mstEdges?: [string, string][];
  distances?: Record<string, number>;
  description: string;
};

function neighbors(g: Graph, id: string) {
  return g.edges
    .filter((e) => e.from === id || e.to === id)
    .map((e) => ({ to: e.from === id ? e.to : e.from, w: e.weight }));
}

export function bfs(g: Graph, start: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const visited: string[] = [];
  const queue = [start];
  steps.push({ visited: [], frontier: [start], description: `Khởi tạo BFS từ ${start}` });
  while (queue.length) {
    const cur = queue.shift()!;
    if (visited.includes(cur)) continue;
    visited.push(cur);
    steps.push({ visited: [...visited], current: cur, frontier: [...queue], description: `Thăm ${cur}` });
    for (const { to } of neighbors(g, cur)) {
      if (!visited.includes(to) && !queue.includes(to)) {
        queue.push(to);
        steps.push({ visited: [...visited], current: cur, frontier: [...queue], edge: [cur, to], description: `Thêm ${to} vào hàng đợi` });
      }
    }
  }
  steps.push({ visited: [...visited], description: "BFS hoàn tất" });
  return steps;
}

export function dfs(g: Graph, start: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const visited: string[] = [];
  function visit(cur: string, parent?: string) {
    visited.push(cur);
    steps.push({ visited: [...visited], current: cur, edge: parent ? [parent, cur] : undefined, description: `Thăm ${cur}` });
    for (const { to } of neighbors(g, cur)) {
      if (!visited.includes(to)) visit(to, cur);
    }
  }
  steps.push({ visited: [], description: `Khởi tạo DFS từ ${start}` });
  visit(start);
  steps.push({ visited: [...visited], description: "DFS hoàn tất" });
  return steps;
}

export function dijkstra(g: Graph, start: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const dist: Record<string, number> = {};
  for (const n of g.nodes) dist[n.id] = Infinity;
  dist[start] = 0;
  const visited: string[] = [];
  steps.push({ visited: [], distances: { ...dist }, description: `Khởi tạo Dijkstra. d(${start})=0` });
  while (visited.length < g.nodes.length) {
    let u: string | null = null;
    let best = Infinity;
    for (const n of g.nodes) {
      if (!visited.includes(n.id) && dist[n.id] < best) {
        best = dist[n.id];
        u = n.id;
      }
    }
    if (!u) break;
    visited.push(u);
    steps.push({ visited: [...visited], current: u, distances: { ...dist }, description: `Chọn ${u} với d=${dist[u]}` });
    for (const { to, w } of neighbors(g, u)) {
      const nd = dist[u] + w;
      if (nd < dist[to]) {
        dist[to] = nd;
        steps.push({ visited: [...visited], current: u, edge: [u, to], distances: { ...dist }, description: `Cập nhật d(${to}) = ${nd}` });
      }
    }
  }
  steps.push({ visited: [...visited], distances: { ...dist }, description: "Dijkstra hoàn tất" });
  return steps;
}

export function bellmanFord(g: Graph, start: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const dist: Record<string, number> = {};
  for (const n of g.nodes) dist[n.id] = Infinity;
  dist[start] = 0;
  steps.push({ visited: [start], distances: { ...dist }, description: `Khởi tạo Bellman-Ford. d(${start})=0` });
  for (let i = 0; i < g.nodes.length - 1; i++) {
    let updated = false;
    for (const e of g.edges) {
      for (const [u, v] of [[e.from, e.to], [e.to, e.from]] as [string, string][]) {
        if (dist[u] + e.weight < dist[v]) {
          dist[v] = dist[u] + e.weight;
          updated = true;
          steps.push({ visited: g.nodes.filter((n) => dist[n.id] !== Infinity).map((n) => n.id), edge: [u, v], distances: { ...dist }, description: `Vòng ${i + 1}: cập nhật d(${v}) = ${dist[v]}` });
        }
      }
    }
    if (!updated) {
      steps.push({ visited: g.nodes.filter((n) => dist[n.id] !== Infinity).map((n) => n.id), distances: { ...dist }, description: `Vòng ${i + 1}: không cập nhật, dừng sớm` });
      break;
    }
  }
  steps.push({ visited: g.nodes.map((n) => n.id), distances: { ...dist }, description: "Bellman-Ford hoàn tất" });
  return steps;
}

export function prim(g: Graph, start: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const inMst: string[] = [start];
  const mstEdges: [string, string][] = [];
  steps.push({ visited: [...inMst], mstEdges: [], description: `Khởi tạo Prim từ ${start}` });
  while (inMst.length < g.nodes.length) {
    let best: GraphEdge | null = null;
    for (const e of g.edges) {
      const a = inMst.includes(e.from), b = inMst.includes(e.to);
      if (a !== b && (!best || e.weight < best.weight)) best = e;
    }
    if (!best) break;
    const next = inMst.includes(best.from) ? best.to : best.from;
    inMst.push(next);
    mstEdges.push([best.from, best.to]);
    steps.push({ visited: [...inMst], current: next, edge: [best.from, best.to], mstEdges: [...mstEdges], description: `Thêm cạnh ${best.from}-${best.to} (w=${best.weight}) vào MST` });
  }
  steps.push({ visited: [...inMst], mstEdges, description: "Prim hoàn tất" });
  return steps;
}

export function kruskal(g: Graph, _start: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const parent: Record<string, string> = {};
  for (const n of g.nodes) parent[n.id] = n.id;
  function find(x: string): string { return parent[x] === x ? x : (parent[x] = find(parent[x])); }
  const sorted = [...g.edges].sort((a, b) => a.weight - b.weight);
  const mstEdges: [string, string][] = [];
  const visited = new Set<string>();
  steps.push({ visited: [], mstEdges: [], description: "Sắp xếp các cạnh theo trọng số tăng dần" });
  for (const e of sorted) {
    const ru = find(e.from), rv = find(e.to);
    if (ru !== rv) {
      parent[ru] = rv;
      mstEdges.push([e.from, e.to]);
      visited.add(e.from); visited.add(e.to);
      steps.push({ visited: [...visited], edge: [e.from, e.to], mstEdges: [...mstEdges], description: `Thêm cạnh ${e.from}-${e.to} (w=${e.weight})` });
    } else {
      steps.push({ visited: [...visited], edge: [e.from, e.to], mstEdges: [...mstEdges], description: `Bỏ qua cạnh ${e.from}-${e.to} (tạo chu trình)` });
    }
  }
  steps.push({ visited: [...visited], mstEdges, description: "Kruskal hoàn tất" });
  return steps;
}

export function topologicalSort(g: Graph, _start: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const visited: string[] = [];
  const order: string[] = [];
  // Treat edges as directed from -> to
  function adj(id: string) { return g.edges.filter((e) => e.from === id).map((e) => e.to); }
  function dfs(u: string) {
    visited.push(u);
    steps.push({ visited: [...visited], current: u, description: `DFS thăm ${u}` });
    for (const v of adj(u)) {
      if (!visited.includes(v)) dfs(v);
    }
    order.unshift(u);
    steps.push({ visited: [...visited], current: u, description: `Hoàn tất ${u}, đưa vào đầu thứ tự` });
  }
  for (const n of g.nodes) if (!visited.includes(n.id)) dfs(n.id);
  steps.push({ visited: [...visited], description: `Thứ tự topo: ${order.join(" → ")}` });
  return steps;
}

export const sampleGraph: Graph = {
  nodes: [
    { id: "A", x: 100, y: 100 },
    { id: "B", x: 280, y: 60 },
    { id: "C", x: 460, y: 110 },
    { id: "D", x: 160, y: 250 },
    { id: "E", x: 360, y: 260 },
    { id: "F", x: 540, y: 290 },
  ],
  edges: [
    { from: "A", to: "B", weight: 4 },
    { from: "A", to: "D", weight: 2 },
    { from: "B", to: "C", weight: 3 },
    { from: "B", to: "E", weight: 5 },
    { from: "C", to: "F", weight: 2 },
    { from: "D", to: "E", weight: 6 },
    { from: "E", to: "F", weight: 1 },
  ],
};

export const graphAlgorithms = {
  bfs: { name: "BFS", fn: bfs, complexity: "O(V+E)", description: "Duyệt theo chiều rộng, dùng hàng đợi. Tìm đường ngắn nhất theo số cạnh." },
  dfs: { name: "DFS", fn: dfs, complexity: "O(V+E)", description: "Duyệt theo chiều sâu, dùng đệ quy/ngăn xếp." },
  dijkstra: { name: "Dijkstra", fn: dijkstra, complexity: "O((V+E)log V)", description: "Tìm đường đi ngắn nhất từ một nguồn trên đồ thị có trọng số không âm." },
  bellmanFord: { name: "Bellman-Ford", fn: bellmanFord, complexity: "O(V·E)", description: "Đường đi ngắn nhất, hỗ trợ cạnh trọng số âm." },
  prim: { name: "Prim's MST", fn: prim, complexity: "O(E log V)", description: "Cây khung nhỏ nhất bằng cách mở rộng từ một đỉnh, luôn chọn cạnh nhỏ nhất ra ngoài MST." },
  kruskal: { name: "Kruskal's MST", fn: kruskal, complexity: "O(E log E)", description: "Cây khung nhỏ nhất bằng cách sắp xếp cạnh và dùng Union-Find tránh chu trình." },
  topo: { name: "Topological Sort", fn: topologicalSort, complexity: "O(V+E)", description: "Sắp xếp tô-pô đỉnh trên đồ thị có hướng không chu trình (DAG)." },
} as const;
