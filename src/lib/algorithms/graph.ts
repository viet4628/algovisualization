export type GraphNode = { id: string; x: number; y: number };
export type GraphEdge = { from: string; to: string; weight: number };
export type Graph = { nodes: GraphNode[]; edges: GraphEdge[] };

export type GraphStep = {
  visited: string[];
  current?: string;
  frontier?: string[];
  edge?: [string, string];
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
} as const;
