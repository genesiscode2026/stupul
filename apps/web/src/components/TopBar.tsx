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
  HelpCircle,
  Share2,
  Globe
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.js';

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
  onOpenWorkshop?: () => void;
  onShareCity?: () => void;
  isMultiplayerConnected?: boolean;
  actorId?: string;
  isCitizen?: boolean;
  onBecomeCitizen?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  state,
  isPlaying,
  onTogglePlay,
  onStepTick,
  onOpenGovernance,
  onOpenPuzzle,
  onOpenCivicTasks,
  onOpenTimeline,
  onOpenAuditLegal,
  onOpenTutorial,
  onOpenWorkshop,
  onShareCity,
  isMultiplayerConnected = false,
  actorId,
  isCitizen = false,
  onBecomeCitizen,
}) => {
  const { lang, toggleLang, tData } = useLanguage();

  const stageName = tData.topbar.stages[state.stage] || state.stage;

  return (
    <header className="w-full frontier-panel border-b border-amber-900/40 px-4 py-2 flex flex-wrap items-center justify-between gap-3 z-20">
      {/* Title & Stage */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-title text-base md:text-lg font-black tracking-wider text-amber-300 flex items-center gap-2">
            STUPUL
            <span className="text-xs font-normal px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/40 text-amber-200">
              {stageName}
            </span>
          </h1>
          <div className="text-[11px] text-stone-400 flex items-center gap-1.5 flex-wrap">
            <span>{state.settlementName}</span>
            <span>•</span>
            <span className="text-stone-300 font-medium">{tData.common.dayStep} {state.tick}</span>
            <span>•</span>
            <span className={`flex items-center gap-1 font-medium ${isMultiplayerConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span className={`w-2 h-2 rounded-full ${isMultiplayerConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isMultiplayerConnected ? 'Multiplayer Live' : 'Mod Solo / Offline'}
            </span>
            <span>•</span>
            {isCitizen ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40" title={actorId}>
                <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                <span>Cetățean ({actorId ? actorId.slice(0, 14) : 'activ'})</span>
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-medium bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800/40" title={actorId}>
                  Mod Oaspete (Demo)
                </span>
                {onBecomeCitizen && (
                  <button
                    onClick={onBecomeCitizen}
                    className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] shadow transition"
                    title="Activează identitatea persistentă de Cetățean pentru a construi în orașul comun (Gratuit, Zero PII)"
                  >
                    Devino Cetățean
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center gap-1 ml-2 bg-stone-900/80 p-1 rounded border border-stone-700/60">
          <button
            onClick={onTogglePlay}
            className={`p-1.5 rounded transition ${isPlaying ? 'bg-amber-600 text-stone-900' : 'hover:bg-stone-800 text-amber-400'}`}
            title={isPlaying ? tData.topbar.pause : tData.topbar.play}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={onStepTick}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 transition"
            title={tData.topbar.step}
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
          title={tData.common.vCreditsTitle}
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
              {state.population.satisfaction}% {tData.common.satisfaction}
            </span>
          </div>
        </div>
      </div>

      {/* Modals & Tools Action Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Language Switcher Button */}
        <button
          onClick={toggleLang}
          className="frontier-button px-2.5 py-1.5 rounded text-xs font-bold text-amber-300 border-amber-500/60 flex items-center gap-1 hover:border-amber-400 transition shadow"
          title={lang === 'ro' ? 'Switch to English (🇬🇧 EN)' : 'Comută în Română (🇷🇴 RO)'}
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'ro' ? 'RO 🇷🇴' : 'EN 🇬🇧'}</span>
        </button>

        <button
          onClick={onOpenGovernance}
          className="frontier-button px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5"
          title="Guvernanță, Sfat Civic & Alegeri"
        >
          <Landmark className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{tData.topbar.governance}</span>
        </button>

        <button
          onClick={onOpenPuzzle}
          className={`frontier-button px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 ${
            state.infrastructurePuzzle.solved ? 'border-sky-500/50 text-sky-200' : 'animate-pulse text-sky-400'
          }`}
          title="Apeduct & Rețea Infrastructură"
        >
          <Droplets className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">{tData.topbar.aqueduct}</span>
        </button>

        <button
          onClick={onOpenCivicTasks}
          className="frontier-button px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5"
          title="Muncă & Activități Economice"
        >
          <Pickaxe className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">{tData.topbar.work}</span>
        </button>

        {onOpenWorkshop && (
          <button
            onClick={onOpenWorkshop}
            className="frontier-button px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 text-amber-300 border-amber-600/40"
            title="Atelierul Comunității (Community Workshop) — Propuneri & Merit"
          >
            <Hammer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{tData.topbar.workshop}</span>
          </button>
        )}

        {onShareCity && (
          <button
            onClick={onShareCity}
            className="frontier-button px-2 py-1.5 rounded text-xs flex items-center text-amber-300"
            title={tData.topbar.shareCity}
          >
            <Share2 className="w-3.5 h-3.5 text-amber-300" />
          </button>
        )}

        <button
          onClick={onOpenTimeline}
          className="frontier-button px-2 py-1.5 rounded text-xs flex items-center"
          title={tData.topbar.timeline}
        >
          <History className="w-3.5 h-3.5 text-stone-300" />
        </button>

        <button
          onClick={onOpenAuditLegal}
          className="frontier-button px-2 py-1.5 rounded text-xs flex items-center"
          title={tData.topbar.audit}
        >
          <Scale className="w-3.5 h-3.5 text-amber-400" />
        </button>

        <button
          onClick={onOpenTutorial}
          className="frontier-button px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1 text-amber-300 border-amber-500/50"
          title={tData.topbar.guide}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{tData.topbar.guide}</span>
        </button>
      </div>
    </header>
  );
};
