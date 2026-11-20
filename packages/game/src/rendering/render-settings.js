/* where a building of this type goes when the cursor is on tile (tx, ty): the block-built buildings (one tile = one block) no longer snap onto a neighbour's grid or merge, so the cursor tile is the corner */
export function snapM(_type, tx, ty) {
  return [tx, ty];
}
