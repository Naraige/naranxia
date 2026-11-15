let prepareRect;

export function setTerrainRectPreparer(handler) {
  prepareRect = handler;
}

export function prepareTerrainRect(x0, y0, width, height) {
  if (!prepareRect) {
    throw new Error(
      "Terrain rectangle preparation was requested before initializeTerrain(); initialize terrain before pathfinding.",
    );
  }
  return prepareRect(x0, y0, width, height);
}
