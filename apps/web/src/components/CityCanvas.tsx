import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, BuildingType, BUILDING_DEFINITIONS } from '@stupul/engine';

interface CityCanvasProps {
  state: GameState;
  selectedCoord: { x: number; y: number } | null;
  onSelectCoord: (coord: { x: number; y: number } | null) => void;
  activeBuildTool: BuildingType | 'claim' | 'demolish' | 'upgrade' | null;
  onBuildOnCell: (x: number, y: number) => void;
}

export const CityCanvas: React.FC<CityCanvasProps> = ({
  state,
  selectedCoord,
  onSelectCoord,
  activeBuildTool,
  onBuildOnCell
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCoord, setHoveredCoord] = useState<{ x: number; y: number } | null>(null);

  // Isometric tile geometry constants
  const baseTileWidth = 64;
  const baseTileHeight = 32;

  // Center view on initial mount
  useEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setOffset({ x: rect.width / 2, y: rect.height / 5 });
    }
  }, []);

  // Converts grid (x, y) to screen isometric (px, py)
  const gridToScreen = useCallback((gx: number, gy: number, z: number, off: { x: number; y: number }) => {
    const tileW = baseTileWidth * z;
    const tileH = baseTileHeight * z;
    const sx = (gx - gy) * (tileW / 2) + off.x;
    const sy = (gx + gy) * (tileH / 2) + off.y;
    return { x: sx, y: sy };
  }, []);

  // Converts screen (px, py) to nearest grid (gx, gy)
  const screenToGrid = useCallback((sx: number, sy: number, z: number, off: { x: number; y: number }) => {
    const tileW = baseTileWidth * z;
    const tileH = baseTileHeight * z;
    const dx = sx - off.x;
    const dy = sy - off.y;
    const gx = Math.floor((dx / (tileW / 2) + dy / (tileH / 2)) / 2);
    const gy = Math.floor((dy / (tileH / 2) - dx / (tileW / 2)) / 2);
    return { x: gx, y: gy };
  }, []);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Background landscape: dark frontier gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height));
      bgGrad.addColorStop(0, '#1c1611');
      bgGrad.addColorStop(1, '#0e0b08');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const tileW = baseTileWidth * zoom;
      const tileH = baseTileHeight * zoom;

      // Draw grid tiles back to front (y from 0 to 15, x from 0 to 15)
      for (let y = 0; y < state.gridHeight; y++) {
        for (let x = 0; x < state.gridWidth; x++) {
          const parcel = state.grid[y][x];
          const pos = gridToScreen(x, y, zoom, offset);

          const isSelected = selectedCoord?.x === x && selectedCoord?.y === y;
          const isHovered = hoveredCoord?.x === x && hoveredCoord?.y === y;

          // 1. Draw base terrain tile
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(pos.x + tileW / 2, pos.y + tileH / 2);
          ctx.lineTo(pos.x, pos.y + tileH);
          ctx.lineTo(pos.x - tileW / 2, pos.y + tileH / 2);
          ctx.closePath();

          // Terrain coloring
          let fillColor = '#486638'; // Grass
          let edgeColor = '#3a542b';

          if (parcel.terrain === 'water') {
            const ripple = Math.sin(time + (x + y)) * 10;
            fillColor = `rgb(40, ${95 + ripple}, 135)`;
            edgeColor = '#1d4863';
          } else if (parcel.terrain === 'dirt') {
            fillColor = '#6e543c';
            edgeColor = '#523d2a';
          } else if (parcel.terrain === 'forest') {
            fillColor = '#324b27';
            edgeColor = '#24381b';
          } else if (parcel.terrain === 'rock') {
            fillColor = '#585955';
            edgeColor = '#434440';
          }

          if (parcel.building === 'road') {
            fillColor = '#7a6b57';
            edgeColor = '#5c4e3d';
          }

          ctx.fillStyle = fillColor;
          ctx.fill();

          ctx.strokeStyle = edgeColor;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Forest details: little stylized pines
          if (parcel.terrain === 'forest' && !parcel.building) {
            ctx.fillStyle = '#1e3315';
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y + tileH * 0.1);
            ctx.lineTo(pos.x + 6 * zoom, pos.y + tileH * 0.6);
            ctx.lineTo(pos.x - 6 * zoom, pos.y + tileH * 0.6);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#28451c';
            ctx.beginPath();
            ctx.moveTo(pos.x - 8 * zoom, pos.y + tileH * 0.25);
            ctx.lineTo(pos.x - 2 * zoom, pos.y + tileH * 0.7);
            ctx.lineTo(pos.x - 14 * zoom, pos.y + tileH * 0.7);
            ctx.closePath();
            ctx.fill();
          }

          // Water ripple shine
          if (parcel.terrain === 'water') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.beginPath();
            ctx.moveTo(pos.x - 8 * zoom, pos.y + tileH * 0.5);
            ctx.lineTo(pos.x + 8 * zoom, pos.y + tileH * 0.5);
            ctx.stroke();
          }

          // 2. Draw building
          if (parcel.building && parcel.building !== 'road') {
            drawBuilding(ctx, pos.x, pos.y + tileH / 2, parcel.building, parcel.level, zoom, time);
          }

          // 3. Selection / Hover highlight
          if (isSelected) {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(pos.x + tileW / 2, pos.y + tileH / 2);
            ctx.lineTo(pos.x, pos.y + tileH);
            ctx.lineTo(pos.x - tileW / 2, pos.y + tileH / 2);
            ctx.closePath();
            ctx.strokeStyle = '#f5c542';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.fillStyle = 'rgba(245, 197, 66, 0.2)';
            ctx.fill();
          } else if (isHovered) {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(pos.x + tileW / 2, pos.y + tileH / 2);
            ctx.lineTo(pos.x, pos.y + tileH);
            ctx.lineTo(pos.x - tileW / 2, pos.y + tileH / 2);
            ctx.closePath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fill();
          }
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, selectedCoord, hoveredCoord, zoom, offset, gridToScreen]);

  // Helper to draw buildings procedurally
  const drawBuilding = (
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    type: BuildingType,
    level: number,
    z: number,
    time: number
  ) => {
    ctx.save();

    if (type === 'town_hall') {
      // Stately wooden 2-story hall with bell tower & flag
      const w = 24 * z;
      const h = 28 * z;
      ctx.fillStyle = '#654321';
      ctx.fillRect(bx - w / 2, by - h, w, h);

      // Roof
      ctx.fillStyle = '#8b0000';
      ctx.beginPath();
      ctx.moveTo(bx, by - h - 14 * z);
      ctx.lineTo(bx + w * 0.7, by - h);
      ctx.lineTo(bx - w * 0.7, by - h);
      ctx.closePath();
      ctx.fill();

      // Tower & Flag
      ctx.fillStyle = '#4a2e12';
      ctx.fillRect(bx - 3 * z, by - h - 22 * z, 6 * z, 10 * z);
      ctx.strokeStyle = '#c59b27';
      ctx.beginPath();
      ctx.moveTo(bx + 3 * z, by - h - 22 * z);
      ctx.lineTo(bx + 12 * z + Math.sin(time * 3) * 2, by - h - 18 * z);
      ctx.lineTo(bx + 3 * z, by - h - 14 * z);
      ctx.fillStyle = '#c59b27';
      ctx.fill();
    } else if (type === 'house') {
      // Log cabin
      const w = 18 * z;
      const h = 14 * z;
      ctx.fillStyle = '#7a5230';
      ctx.fillRect(bx - w / 2, by - h, w, h);

      // Roof
      ctx.fillStyle = '#422a1d';
      ctx.beginPath();
      ctx.moveTo(bx, by - h - 8 * z);
      ctx.lineTo(bx + w * 0.6, by - h);
      ctx.lineTo(bx - w * 0.6, by - h);
      ctx.closePath();
      ctx.fill();

      // Smoke from chimney
      const smokeY = by - h - 12 * z - ((time * 15) % 20);
      ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
      ctx.beginPath();
      ctx.arc(bx + 4 * z + Math.sin(time * 2) * 2, smokeY, 3 * z, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'farm') {
      // Golden wheat field + small red barn
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(bx - 14 * z, by - 6 * z, 28 * z, 10 * z);
      // Small red barn
      ctx.fillStyle = '#8a2b2b';
      ctx.fillRect(bx - 10 * z, by - 16 * z, 12 * z, 10 * z);
      ctx.fillStyle = '#3a1414';
      ctx.beginPath();
      ctx.moveTo(bx - 4 * z, by - 21 * z);
      ctx.lineTo(bx + 3 * z, by - 16 * z);
      ctx.lineTo(bx - 11 * z, by - 16 * z);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'well') {
      // Circular stone well with winch
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.arc(bx, by - 4 * z, 7 * z, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(bx, by - 4 * z, 4 * z, 0, Math.PI * 2);
      ctx.fill();
      // Wooden roof poles
      ctx.strokeStyle = '#5a3825';
      ctx.lineWidth = 2 * z;
      ctx.beginPath();
      ctx.moveTo(bx - 4 * z, by - 4 * z);
      ctx.lineTo(bx, by - 14 * z);
      ctx.lineTo(bx + 4 * z, by - 4 * z);
      ctx.stroke();
    } else if (type === 'school') {
      // Schoolhouse with bell
      const w = 22 * z;
      const h = 18 * z;
      ctx.fillStyle = '#804724';
      ctx.fillRect(bx - w / 2, by - h, w, h);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(bx, by - h - 10 * z);
      ctx.lineTo(bx + w * 0.6, by - h);
      ctx.lineTo(bx - w * 0.6, by - h);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'warehouse') {
      // Big timber barn
      const w = 26 * z;
      const h = 16 * z;
      ctx.fillStyle = '#543d2b';
      ctx.fillRect(bx - w / 2, by - h, w, h);
      ctx.fillStyle = '#382619';
      ctx.beginPath();
      ctx.moveTo(bx, by - h - 7 * z);
      ctx.lineTo(bx + w * 0.55, by - h);
      ctx.lineTo(bx - w * 0.55, by - h);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'workshop') {
      // Smithy
      const w = 20 * z;
      const h = 15 * z;
      ctx.fillStyle = '#4a4036';
      ctx.fillRect(bx - w / 2, by - h, w, h);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(bx - 4 * z, by - 6 * z, 8 * z, 6 * z);
    } else if (type === 'clinic') {
      // Infirmary with white/red cross
      const w = 20 * z;
      const h = 16 * z;
      ctx.fillStyle = '#f1ece1';
      ctx.fillRect(bx - w / 2, by - h, w, h);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(bx - 2 * z, by - 12 * z, 4 * z, 8 * z);
      ctx.fillRect(bx - 4 * z, by - 10 * z, 8 * z, 4 * z);
    } else if (type === 'guard_post') {
      // Watchtower
      ctx.strokeStyle = '#4b382a';
      ctx.lineWidth = 2 * z;
      ctx.beginPath();
      ctx.moveTo(bx - 5 * z, by);
      ctx.lineTo(bx - 3 * z, by - 24 * z);
      ctx.lineTo(bx + 3 * z, by - 24 * z);
      ctx.lineTo(bx + 5 * z, by);
      ctx.stroke();
      ctx.fillStyle = '#6b4d34';
      ctx.fillRect(bx - 7 * z, by - 28 * z, 14 * z, 6 * z);
    }

    // Level indicator dots if level > 1
    if (level > 1) {
      ctx.fillStyle = '#facc15';
      for (let i = 0; i < level; i++) {
        ctx.beginPath();
        ctx.arc(bx - (level - 1) * 3 * z + i * 6 * z, by - 32 * z, 2 * z, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  // Mouse / Touch Event Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const gridPos = screenToGrid(mouseX, mouseY, zoom, offset);
        if (gridPos.x >= 0 && gridPos.x < state.gridWidth && gridPos.y >= 0 && gridPos.y < state.gridHeight) {
          setHoveredCoord(gridPos);
        } else {
          setHoveredCoord(null);
        }
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setIsDragging(false);
      // If drag distance was very small, treat as click
      const dist = Math.hypot(e.clientX - (dragStart.x + offset.x), e.clientY - (dragStart.y + offset.y));
      if (dist < 4 && hoveredCoord) {
        if (activeBuildTool) {
          onBuildOnCell(hoveredCoord.x, hoveredCoord.y);
        } else {
          onSelectCoord(hoveredCoord);
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(2.5, Math.max(0.4, prev * zoomFactor)));
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Floating Zoom & Center Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button
          onClick={() => setZoom(z => Math.min(2.5, z * 1.2))}
          className="frontier-button w-10 h-10 rounded-md font-bold text-lg flex items-center justify-center shadow-lg"
          title="Mărește (Zoom In)"
        >
          +
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.4, z * 0.8))}
          className="frontier-button w-10 h-10 rounded-md font-bold text-lg flex items-center justify-center shadow-lg"
          title="Micșorează (Zoom Out)"
        >
          -
        </button>
        <button
          onClick={() => {
            if (canvasRef.current) {
              const rect = canvasRef.current.getBoundingClientRect();
              setOffset({ x: rect.width / 2, y: rect.height / 5 });
              setZoom(1.0);
            }
          }}
          className="frontier-button w-10 h-10 rounded-md font-bold text-xs flex items-center justify-center shadow-lg"
          title="Recentrare Hartă"
        >
          ⌖
        </button>
      </div>

      {/* Hover info tooltip */}
      {hoveredCoord && (
        <div className="absolute top-20 left-6 pointer-events-none frontier-panel px-3 py-1.5 rounded text-xs text-stone-200">
          Parcela ({hoveredCoord.x}, {hoveredCoord.y}) • {state.grid[hoveredCoord.y][hoveredCoord.x].terrain.toUpperCase()}
          {state.grid[hoveredCoord.y][hoveredCoord.x].building && (
            <span className="text-amber-400 font-semibold ml-1.5">
              • {BUILDING_DEFINITIONS[state.grid[hoveredCoord.y][hoveredCoord.x].building!].name} (Nv. {state.grid[hoveredCoord.y][hoveredCoord.x].level})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
