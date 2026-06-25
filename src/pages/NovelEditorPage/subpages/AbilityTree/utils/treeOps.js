// 能力树的不可变 CRUD 纯函数：均返回新树，不改动原对象。
// 节点 shape：{ id, kind, title, subtitle, desc, attrs, children }

// 先序递归查找，返回命中的节点（含其子树）或 null
export function findNode(node, id) {
  if (!node) return null
  if (node.id === id) return node
  for (const child of node.children ?? []) {
    const hit = findNode(child, id)
    if (hit) return hit
  }
  return null
}

// 返回从根到目标节点的 id 路径（含两端），找不到则 []
export function findPath(node, id, trail = []) {
  if (!node) return []
  const next = [...trail, node.id]
  if (node.id === id) return next
  for (const child of node.children ?? []) {
    const found = findPath(child, id, next)
    if (found.length) return found
  }
  return []
}

// 更新某节点字段（浅合并 patch）
export function updateNode(node, id, patch) {
  if (node.id === id) return { ...node, ...patch }
  return {
    ...node,
    children: (node.children ?? []).map((c) => updateNode(c, id, patch)),
  }
}

// 给 parentId 追加一个子节点
export function addChild(node, parentId, newNode) {
  if (node.id === parentId) {
    return { ...node, children: [...(node.children ?? []), newNode] }
  }
  return {
    ...node,
    children: (node.children ?? []).map((c) => addChild(c, parentId, newNode)),
  }
}

// 删除某节点（含其子树）；不会删除根节点（根无父，filter 不到）
export function removeNode(node, id) {
  return {
    ...node,
    children: (node.children ?? [])
      .filter((c) => c.id !== id)
      .map((c) => removeNode(c, id)),
  }
}

// 删除某节点后，选中态应回退到的目标 id：其父节点；找不到父则回退到根
export function parentIdOf(root, id) {
  const path = findPath(root, id)
  return path.length >= 2 ? path[path.length - 2] : root.id
}
