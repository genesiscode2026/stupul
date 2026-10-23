import React from 'react';
import { GameState } from '@stupul/engine';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Wheat, 
  Hammer, 
  Coins, 
  Users, 
  Landmark, 
  Droplets, 
  Pickaxe, 
  History, 
  Scale,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

interface TopBarProps {
  state: GameState;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepTick: () => void;
  onOpenGovernance: () => void;
  onOpenPuzzle: () => void;
  onOpenCivicTasks: () => void;
  onOpenTimeline: () => void;
  onOpenAuditLegal: () => void;
  onOpenTutorial: () => void;
}

const STAGE_NAMES = {
  frontier_outpost: 'Avanpost de Frontieră',
  wild_west_settlement: 'Așezare Vestul Sălbatic',
  growing_town: 'Târg în Creștere',
  modern_civilisation: 'Civilizație Prosperă'
};

export const TopBar: React.FC<TopBarProps> = ({
  state,
  isPlaying,
  onTogglePlay,
  onStepTick,
  onOpenGovernance,
  onOpenPuzzle,
  onOpenCivicTasks,
  onOpenTimeline,
  onOpenAuditLegal
}) => {
  return (
    <header className="w-full frontier-panel border-b border-amber-900/40 px-4 py-2 flex flex-wrap items-center justify-between gap-3 z-20">
      {/* Title & Stage */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-title text-base md:text-lg font-black tracking-wider text-amber-300 flex items-center gap-2">
            STUPUL
            <span className="text-xs font-normal px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/40 text-amber-200">
              {STAGE_NAMES[state.stage]}
            </span>
          </h1>
          <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
            <span>{state.settlementName}</span>
            <span>•</span>
            <span className="text-stone-300 font-medium">Ziua / Pasul: {state.tick}</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3 inline" /> Mod Oaspete (Anonim)
            </span>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center gap-1 ml-2 bg-stone-900/80 p-1 rounded border border-stone-700/60">
          <button
            onClick={onTogglePlay}
            className={`p-1.5 rounded transition ${isPlaying ? 'bg-amber-600 text-stone-900' : 'hover:bg-stone-800 text-amber-400'}`}
            title={isPlaying ? 'Pauză' : 'Pornire Simulare'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={onStepTick}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 transition"
            title="Avansează un pas (1 Tick)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Resource Indicators */}
      <div className="flex items-center gap-4 text-xs md:text-sm">
        {/* Food */}
        <div className="flex items-center gap-1.5 bg-stone-950/60 px-2.5 py-1 rounded border border-amber-900/30">
          <Wheat className="w-4 h-4 text-amber-400" />
          <div>
            <span className="font-bold text-amber-200">{state.resources.food}</span>
            <span className="text-[10px] text-stone-500">/{state.resources.maxFoodStorage}</span>
          </div>
        </div>

        {/* Materials */}
        <div className="flex items-center gap-1.5 bg-stone-950/60 px-2.5 py-1 rounded border border-amber-900/30">
          <Hammer className="w-4 h-4 text-orange-400" />
          <div>
            <span className="font-bold text-orange-200">{state.resources.materials}</span>
            <span className="text-[10px] text-stone-500">/{state.resources.maxMaterialsStorage}</span>
          </div>
        </div>

        {/* Virtual Credits */}
        <div 
          className="flex items-center gap-1.5 bg-stone-950/60 px-2.5 py-1 rounded border border-amber-500/40 cursor-help"
          title="Credite Virtuale STUPUL (100% virtuale, neconvertibile în bani reali)"
        >
          <Coins className="w-4 h-4 text-yellow-400" />
          <div>
            <span className="font-bold text-yellow-300">{state.resources.virtualCredits}</span>
            <span className="text-[10px] text-yellow-500/80 ml-1">V-Credits</span>
          </div>
        </div>

        {/* Population & Satisfaction */}
        <div className="flex items-center gap-1.5 bg-stone-950/60 px-2.5 py-1 rounded border border-amber-900/30">
          <Users className="w-4 h-4 text-sky-400" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-stone-100">{state.population.total}</span>
            <span className={`text-[10px] font-semibold px-1 rounded ${
              state.population.satisfaction >= 70 ? 'bg-emerald-950 text-emerald-300' :
              state.population.satisfaction >= 45 ? 'bg-amber-950 text-amber-300' :
              'bg-red-950 text-red-300'
            }`}>
              {state.population.satisfaction}% mulțumire
            </span>
          </div>
        </div>
      </div>

      {/* Modals & Tools Action Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenGovernance}
          className="frontier-button px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5"
          title="Guvernanță, Sfat Civic & Alegeri"
        >
          <Landmark className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Guvernanță</span>
        </button>

        <button
          onClick={onOpenPuzzle}
          className={`frontier-button px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 ${
            state.infrastructurePuzzle.solved ? 'border-sky-500/50 text-sky-200' : 'animate-pulse text-sky-400'
          }`}
          title="Apeduct & Rețea Infrastructură"
        >
          <Droplets className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Apeduct</span>
        </button>

        <button
          onClick={onOpenCivicTasks}
          className="frontier-button px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5"
          title="Muncă & Activități Economice"
        >
          <Pickaxe className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Muncă</span>
        </button>

        <button
          onClick={onOpenTimeline}
          className="frontier-button px-2 py-1.5 rounded text-xs flex items-center"
          title="Jurnal Istoric & Replay"
        >
          <History className="w-3.5 h-3.5 text-stone-300" />
        </button>

        <button
          onClick={onOpenAuditLegal}
          className="frontier-button px-2 py-1.5 rounded text-xs flex items-center"
          title="Audit, Integritate & Redevențe Fondator"
        >
          <Scale className="w-3.5 h-3.5 text-amber-400" />
        </button>

        <button
          onClick={onOpenTutorial}
          className="frontier-button px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1 text-amber-300 border-amber-500/50"
          title="Ghid & Tutorial Interactiv"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Ghid</span>
        </button>
      </div>
    </header>
  );
};
