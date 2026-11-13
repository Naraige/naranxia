let terrainInvalidator = () => {};
let propInvalidator = () => {};
let handlersReady = false;
const pendingInvalidations = [];

export function setTerrainInvalidationHandlers(markTerrain, markProps) {
  terrainInvalidator = markTerrain;
  propInvalidator = markProps;
  handlersReady = true;
  for (const [kind, tx, ty] of pendingInvalidations) {
    (kind === "terrain" ? terrainInvalidator : propInvalidator)(tx, ty);
  }
  pendingInvalidations.length = 0;
}

export function markT(tx, ty) {
  if (!handlersReady) {
    pendingInvalidations.push(["terrain", tx, ty]);
    return;
  }
  terrainInvalidator(tx, ty);
}

export function markP(tx, ty) {
  if (!handlersReady) {
    pendingInvalidations.push(["props", tx, ty]);
    return;
  }
  propInvalidator(tx, ty);
}
