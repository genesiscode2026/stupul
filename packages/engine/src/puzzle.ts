import { InfrastructurePuzzle, PuzzleTile, PipeType } from './types.js';

interface Directions {
  north: boolean;
  east: boolean;
  south: boolean;
  west: boolean;
}

export function getPipeOpenings(type: PipeType, rotation: 0 | 90 | 180 | 270): Directions {
  if (type === 'cross') {
    return { north: true, east: true, south: true, west: true };
  }

  if (type === 'straight') {
    // 0: N-S, 90: E-W, 180: N-S, 270: E-W
    if (rotation === 0 || rotation === 180) {
      return { north: true, east: false, south: true, west: false };
    } else {
      return { north: false, east: true, south: false, west: true };
    }
  }

  if (type === 'corner') {
    // 0: N-E, 90: E-S, 180: S-W, 270: W-N
    if (rotation === 0) return { north: true, east: true, south: false, west: false };
    if (rotation === 90) return { north: false, east: true, south: true, west: false };
    if (rotation === 180) return { north: false, east: false, south: true, west: true };
    return { north: true, east: false, south: false, west: true };
  }

  if (type === 'source') {
    // Source flows East and South
    return { north: false, east: true, south: true, west: false };
  }

  if (type === 'reservoir') {
    // Reservoir accepts from North and West
    return { north: true, east: false, south: false, west: true };
  }

  return { north: false, east: false, south: false, west: false };
}

/**
 * Creates an initial 4x4 infrastructure aqueduct puzzle.
 */
export function createInitialPuzzle(): InfrastructurePuzzle {
  const width = 4;
  const height = 4;
  const tiles: PuzzleTile[][] = [];

  const types: PipeType[][] = [
    ['source', 'straight', 'corner', 'straight'],
    ['straight', 'corner', 'corner', 'straight'],
    ['corner', 'straight', 'cross', 'corner'],
    ['straight', 'corner', 'straight', 'reservoir']
  ];

  // Scrambled initial rotations so player has to solve it
  const rotations: (0 | 90 | 180 | 270)[][] = [
    [0, 0, 90, 0],
    [90, 180, 0, 0],
    [90, 0, 0, 90],
    [0, 180, 90, 0]
  ];

  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = {
        x,
        y,
        type: types[y][x],
        rotation: rotations[y][x],
        connected: false
      };
    }
  }

  const puzzle: InfrastructurePuzzle = {
    width,
    height,
    tiles,
    sourceX: 0,
    sourceY: 0,
    reservoirX: 3,
    reservoirY: 3,
    solved: false,
    timesSolved: 0
  };

  evaluatePuzzleConnectivity(puzzle);
  return puzzle;
}

/**
 * Evaluates water flow connectivity using BFS from (sourceX, sourceY).
 * Returns true if the reservoir is reached and receives flow.
 */
export function evaluatePuzzleConnectivity(puzzle: InfrastructurePuzzle): boolean {
  const { width, height, tiles, sourceX, sourceY, reservoirX, reservoirY } = puzzle;

  // Reset connected flags
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles[y][x].connected = false;
    }
  }

  const queue: [number, number][] = [[sourceX, sourceY]];
  const visited = new Set<string>();
  visited.add(`${sourceX},${sourceY}`);
  tiles[sourceY][sourceX].connected = true;

  let reachedReservoir = false;

  while (queue.length > 0) {
    const [cx, cy] = queue.shift()!;
    const currentTile = tiles[cy][cx];
    const currentOpenings = getPipeOpenings(currentTile.type, currentTile.rotation);

    // Neighbors: North (0, -1), East (1, 0), South (0, 1), West (-1, 0)
    const neighbors: Array<{ nx: number; ny: number; fromDir: 'north' | 'east' | 'south' | 'west'; toDir: 'north' | 'east' | 'south' | 'west' }> = [
      { nx: cx, ny: cy - 1, fromDir: 'north', toDir: 'south' },
      { nx: cx + 1, ny: cy, fromDir: 'east', toDir: 'west' },
      { nx: cx, ny: cy + 1, fromDir: 'south', toDir: 'north' },
      { nx: cx - 1, ny: cy, fromDir: 'west', toDir: 'east' }
    ];

    for (const { nx, ny, fromDir, toDir } of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        if (currentOpenings[fromDir]) {
          const neighborTile = tiles[ny][nx];
          const neighborOpenings = getPipeOpenings(neighborTile.type, neighborTile.rotation);

          if (neighborOpenings[toDir]) {
            const key = `${nx},${ny}`;
            if (!visited.has(key)) {
              visited.add(key);
              neighborTile.connected = true;
              queue.push([nx, ny]);

              if (nx === reservoirX && ny === reservoirY) {
                reachedReservoir = true;
              }
            }
          }
        }
      }
    }
  }

  puzzle.solved = reachedReservoir;
  return reachedReservoir;
}

export function rotateTile(puzzle: InfrastructurePuzzle, x: number, y: number): boolean {
  if (x < 0 || x >= puzzle.width || y < 0 || y >= puzzle.height) {
    return false;
  }
  const tile = puzzle.tiles[y][x];
  if (tile.type === 'source' || tile.type === 'reservoir') {
    return false; // Source and reservoir endpoints are fixed
  }

  tile.rotation = ((tile.rotation + 90) % 360) as 0 | 90 | 180 | 270;
  return evaluatePuzzleConnectivity(puzzle);
}
