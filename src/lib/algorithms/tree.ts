export type TreeNode = {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
  id?: string;
};

export type TreeStep = {
  visited: number[];
  current?: number;
  description: string;
};

let counter = 0;
export function buildBST(values: number[]): TreeNode | null {
  counter = 0;
  let root: TreeNode | null = null;
  for (const v of values) root = insertBST(root, v);
  return root;
}

export function insertBST(root: TreeNode | null, value: number): TreeNode {
  if (!root) return { value, left: null, right: null, id: `n${counter++}` };
  if (value < root.value) root.left = insertBST(root.left, value);
  else if (value > root.value) root.right = insertBST(root.right, value);
  return root;
}

export function layoutTree(root: TreeNode | null, width: number, height: number) {
  if (!root) return;
  let x = 0;
  function depth(n: TreeNode): number {
    return 1 + Math.max(n.left ? depth(n.left) : 0, n.right ? depth(n.right) : 0);
  }
  const d = depth(root);
  const yStep = (height - 60) / Math.max(d - 1, 1);
  function inorder(n: TreeNode | null, level: number) {
    if (!n) return;
    inorder(n.left, level + 1);
    n.x = x++;
    n.y = 30 + level * yStep;
    inorder(n.right, level + 1);
  }
  inorder(root, 0);
  let total = 0;
  function count(n: TreeNode | null): number {
    if (!n) return 0;
    return 1 + count(n.left) + count(n.right);
  }
  total = count(root);
  function scale(n: TreeNode | null) {
    if (!n) return;
    n.x = 40 + (n.x! / Math.max(total - 1, 1)) * (width - 80);
    scale(n.left);
    scale(n.right);
  }
  scale(root);
}

export function inorderTraversal(root: TreeNode | null): TreeStep[] {
  const steps: TreeStep[] = [];
  const visited: number[] = [];
  function go(n: TreeNode | null) {
    if (!n) return;
    steps.push({ visited: [...visited], current: n.value, description: `Đi xuống nút ${n.value}, sang trái trước` });
    go(n.left);
    visited.push(n.value);
    steps.push({ visited: [...visited], current: n.value, description: `Thăm ${n.value} (in-order)` });
    go(n.right);
  }
  go(root);
  steps.push({ visited: [...visited], description: "Hoàn tất duyệt in-order" });
  return steps;
}

export function preorderTraversal(root: TreeNode | null): TreeStep[] {
  const steps: TreeStep[] = [];
  const visited: number[] = [];
  function go(n: TreeNode | null) {
    if (!n) return;
    visited.push(n.value);
    steps.push({ visited: [...visited], current: n.value, description: `Thăm ${n.value} (pre-order)` });
    go(n.left);
    go(n.right);
  }
  go(root);
  return steps;
}

export function postorderTraversal(root: TreeNode | null): TreeStep[] {
  const steps: TreeStep[] = [];
  const visited: number[] = [];
  function go(n: TreeNode | null) {
    if (!n) return;
    go(n.left);
    go(n.right);
    visited.push(n.value);
    steps.push({ visited: [...visited], current: n.value, description: `Thăm ${n.value} (post-order)` });
  }
  go(root);
  return steps;
}

export function levelOrderTraversal(root: TreeNode | null): TreeStep[] {
  const steps: TreeStep[] = [];
  const visited: number[] = [];
  if (!root) return steps;
  const queue: TreeNode[] = [root];
  while (queue.length) {
    const n = queue.shift()!;
    visited.push(n.value);
    steps.push({ visited: [...visited], current: n.value, description: `Thăm ${n.value} (BFS theo mức)` });
    if (n.left) queue.push(n.left);
    if (n.right) queue.push(n.right);
  }
  steps.push({ visited: [...visited], description: "Hoàn tất duyệt theo mức" });
  return steps;
}

export function bstSearch(root: TreeNode | null, target = 0): TreeStep[] {
  const steps: TreeStep[] = [];
  const visited: number[] = [];
  function go(n: TreeNode | null) {
    if (!n) {
      steps.push({ visited: [...visited], description: `Không tìm thấy ${target}` });
      return;
    }
    visited.push(n.value);
    steps.push({ visited: [...visited], current: n.value, description: `So sánh ${target} với ${n.value}` });
    if (target === n.value) {
      steps.push({ visited: [...visited], current: n.value, description: `Tìm thấy ${target}!` });
      return;
    }
    go(target < n.value ? n.left : n.right);
  }
  go(root);
  return steps;
}

export function bstInsertAnimation(root: TreeNode | null, value = 0): TreeStep[] {
  const steps: TreeStep[] = [];
  const visited: number[] = [];
  function go(n: TreeNode | null) {
    if (!n) {
      steps.push({ visited: [...visited], description: `Chèn ${value} ở vị trí trống` });
      return;
    }
    visited.push(n.value);
    steps.push({ visited: [...visited], current: n.value, description: `${value} ${value < n.value ? "<" : ">"} ${n.value}, đi sang ${value < n.value ? "trái" : "phải"}` });
    go(value < n.value ? n.left : n.right);
  }
  go(root);
  return steps;
}

export const treeAlgorithms = {
  inorder: { name: "In-order", fn: inorderTraversal, complexity: "O(n)", description: "Trái → Gốc → Phải. Trả về dãy tăng dần với BST." },
  preorder: { name: "Pre-order", fn: preorderTraversal, complexity: "O(n)", description: "Gốc → Trái → Phải. Dùng để sao chép cây." },
  postorder: { name: "Post-order", fn: postorderTraversal, complexity: "O(n)", description: "Trái → Phải → Gốc. Dùng để xóa cây." },
  levelorder: { name: "Level-order (BFS)", fn: levelOrderTraversal, complexity: "O(n)", description: "Duyệt theo từng mức (BFS), dùng hàng đợi." },
  bstSearch: { name: "BST Search", fn: bstSearch, complexity: "O(h)", description: "Tìm kiếm trên cây tìm kiếm nhị phân, đi trái/phải theo so sánh." },
  bstInsert: { name: "BST Insert", fn: bstInsertAnimation, complexity: "O(h)", description: "Mô phỏng tìm vị trí trống để chèn giá trị mới vào BST." },
} as const;
