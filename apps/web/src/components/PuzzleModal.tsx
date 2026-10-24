import React from 'react';
import { GameState, PipeType } from '@stupul/engine';
import { X, Droplets, RotateCw, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.js';

interface PuzzleModalProps {
  state: GameState;
  onClose: () => void;
  onRotateTile: (x: number, y: number) => void;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  state,
  onClose,
  onRotateTile
}) => {
  const { tData } = useLanguage();
  const puzzle = state.infrastructurePuzzle;

  const renderPipeIcon = (type: PipeType, rotation: number, connected: boolean) => {
    const strokeColor = connected ? '#38bdf8' : '#78716c';
    const fillColor = connected ? '#0284c7' : '#44403c';

    return (
      <svg
        viewBox="0 0 40 40"
        className="w-12 h-12 transition-transform duration-200"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <rect width="40" height="40" fill="#1c1917" rx="4" />
        
        {type === 'straight' && (
          <path d="M16 0 H24 V40 H16 Z" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
        )}

        {type === 'corner' && (
          <path d="M16 0 H24 V16 H40 V24 H16 Z" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
        )}

        {type === 'cross' && (
          <path d="M16 0 H24 V16 H40 V24 H24 V40 H16 V24 H0 V16 H16 Z" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
        )}

        {type === 'source' && (
          <g>
            <circle cx="20" cy="20" r="10" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <path d="M20 16 H40 V24 H20 Z" fill="#0284c7" />
            <path d="M16 20 V40 H24 V20 Z" fill="#0284c7" />
          </g>
        )}

        {type === 'reservoir' && (
          <g>
            <rect x="8" y="8" width="24" height="24" rx="3" fill={connected ? '#0284c7' : '#44403c'} stroke={strokeColor} strokeWidth="2" />
            <path d="M16 0 H24 V12 H16 Z" fill={fillColor} />
            <path d="M0 16 H12 V24 H0 Z" fill={fillColor} />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="frontier-panel w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden border border-sky-600/50">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-sky-900/40 bg-stone-950/80">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-400" />
            <h2 className="font-title text-base font-bold text-sky-200">
              {tData.puzzle.title}
            </h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-100 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Puzzle Description & Status */}
        <div className="p-4 space-y-3 text-xs">
          <p className="text-stone-300 leading-relaxed">
            {tData.puzzle.description}
          </p>

          {puzzle.solved ? (
            <div className="bg-sky-950/80 border border-sky-400/60 p-3 rounded flex items-center gap-2.5 text-sky-200 font-bold">
              <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <div>{tData.puzzle.solvedTitle}</div>
                <div className="text-[11px] font-normal text-sky-300/80 mt-0.5">
                  {tData.puzzle.solvedBonus}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-950/40 border border-amber-700/40 p-2.5 rounded text-amber-300 flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{tData.puzzle.rotateHint}</span>
            </div>
          )}

          {/* 4x4 Grid Container */}
          <div className="flex justify-center py-2">
            <div className="grid grid-cols-4 gap-2 bg-stone-950 p-3 rounded-lg border border-stone-800 shadow-inner">
              {puzzle.tiles.map((row, y) =>
                row.map((tile, x) => {
                  const isEnd = tile.type === 'source' || tile.type === 'reservoir';
                  return (
                    <button
                      key={`${x}-${y}`}
                      onClick={() => onRotateTile(x, y)}
                      disabled={isEnd}
                      className={`relative p-1 rounded transition hover:scale-105 active:scale-95 ${
                        tile.connected ? 'ring-1 ring-sky-400/60 shadow-lg shadow-sky-950' : 'opacity-85'
                      } ${isEnd ? 'cursor-default' : 'cursor-pointer hover:bg-stone-800'}`}
                      title={isEnd ? tile.type : `${tData.puzzle.rotateTitle} (${x}, ${y})`}
                    >
                      {renderPipeIcon(tile.type, tile.rotation, tile.connected)}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/60 flex justify-between items-center text-xs">
          <span className="text-stone-400">
            {tData.puzzle.solvesCount} <strong className="text-stone-200">{puzzle.timesSolved}</strong>
          </span>
          <button onClick={onClose} className="frontier-button px-4 py-1.5 rounded font-semibold text-stone-200">
            {tData.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
