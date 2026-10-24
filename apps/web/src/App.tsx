import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  GameState, 
  createInitialState, 
  reduce, 
  EngineCommand, 
  BuildingType,
} from '@stupul/engine';
import { OfflineStorage } from '@stupul/shared';
import { CityCanvas } from './components/CityCanvas.js';
import { TopBar } from './components/TopBar.js';
import { BuildToolbar, BuildTool } from './components/BuildToolbar.js';
import { ParcelInspector } from './components/ParcelInspector.js';
import { GovernanceModal } from './components/GovernanceModal.js';
import { PuzzleModal } from './components/PuzzleModal.js';
import { CivicTasksModal } from './components/CivicTasksModal.js';
import { TimelineModal } from './components/TimelineModal.js';
import { AuditLegalModal } from './components/AuditLegalModal.js';
import { TutorialModal } from './components/TutorialModal.js';
import { CommunityWorkshopModal } from './components/CommunityWorkshopModal.js';
import { useLanguage } from './i18n/LanguageContext.js';

const storage = new OfflineStorage();

interface Toast {
  message: string;
  kind: 'success' | 'error' | 'info';
}

export const App: React.FC = () => {
  const { tData } = useLanguage();

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = storage.loadLocal();
    return saved || createInitialState(42, 'Avanpostul Văii');
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedCoord, setSelectedCoord] = useState<{ x: number; y: number } | null>(null);
  const [activeBuildTool, setActiveBuildTool] = useState<BuildTool>(null);
  const [eventsHistory, setEventsHistory] = useState<string[]>(() => [
    tData.timeline.initialEvent1,
    tData.timeline.initialEvent2
  ]);
  const [toast, setToast] = useState<Toast | null>(null);

  const [isGovernanceOpen, setIsGovernanceOpen] = useState<boolean>(false);
  const [isPuzzleOpen, setIsPuzzleOpen] = useState<boolean>(false);
  const [isCivicTasksOpen, setIsCivicTasksOpen] = useState<boolean>(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false);
  const [isAuditLegalOpen, setIsAuditLegalOpen] = useState<boolean>(false);
  const [isWorkshopOpen, setIsWorkshopOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('stupul_tutorial_seen');
    } catch {
      return false;
    }
  });

  const gameStateRef = useRef<GameState>(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    storage.saveLocal(gameState);
  }, [gameState]);

  const showToast = useCallback((message: string, kind: Toast['kind'] = 'info') => {
    setToast({ message, kind });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const mission = useMemo(() => {
    let houses = 0;
    let farms = 0;
    for (let y = 0; y < gameState.gridHeight; y++) {
      for (let x = 0; x < gameState.gridWidth; x++) {
        const parcel = gameState.grid[y][x];
        if (parcel.building === 'house') houses += parcel.level || 1;
        else if (parcel.building === 'farm') farms += parcel.level || 1;
      }
    }
    const housingCapacity = houses * 25;

    if (gameState.infrastructurePuzzle.solved) {
      return { title: tData.mission.growingTitle, hint: tData.mission.growingHint };
    }
    if (housingCapacity >= 125 && farms >= 1) {
      return { title: tData.mission.helpTitle, hint: tData.mission.aqueductHint };
    }
    if (housingCapacity >= 125) {
      return { title: tData.mission.helpTitle, hint: tData.mission.farmHint };
    }
    return { title: tData.mission.helpTitle, hint: tData.mission.houseHint };
  }, [gameState, tData]);

  const dispatchCommand = useCallback((cmd: EngineCommand) => {
    const res = reduce(gameStateRef.current, cmd);
    if (res.success) {
      gameStateRef.current = res.nextState;
      setGameState(res.nextState);
      if (res.eventsEmitted.length > 0) {
        setEventsHistory(h => [...h, ...res.eventsEmitted].slice(-100));
        showToast(res.eventsEmitted[res.eventsEmitted.length - 1], 'success');
      }
    } else if (res.error) {
      showToast(res.error, 'error');
    }
  }, [showToast]);

  const handleStepTick = useCallback(() => {
    dispatchCommand({ type: 'TICK' });
  }, [dispatchCommand]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      handleStepTick();
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying, handleStepTick]);

  const handleBuildOnCell = (x: number, y: number) => {
    if (!activeBuildTool) return;

    if (activeBuildTool === 'claim') {
      dispatchCommand({ type: 'CLAIM_PARCEL', x, y, actorId: 'cetatean_local' });
    } else if (activeBuildTool === 'upgrade') {
      dispatchCommand({ type: 'UPGRADE_BUILDING', x, y, actorId: 'cetatean_local' });
    } else if (activeBuildTool === 'demolish') {
      dispatchCommand({ type: 'DEMOLISH_BUILDING', x, y, actorId: 'cetatean_local' });
    } else {
      dispatchCommand({
        type: 'CONSTRUCT_BUILDING',
        x,
        y,
        buildingType: activeBuildTool as BuildingType,
        actorId: 'cetatean_local'
      });
    }
  };

  const selectedParcel = selectedCoord 
    ? gameState.grid[selectedCoord.y][selectedCoord.x] 
    : null;

  const handleShareCity = useCallback(() => {
    const url = `${window.location.origin}/?visit=1&tick=${gameState.tick}&stage=${gameState.stage}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast(tData.topbar.shareSuccess, 'success');
      }).catch(() => {
        showToast(`${tData.topbar.shareInfo} ${url}`, 'info');
      });
    } else {
      showToast(`${tData.topbar.shareInfo} ${url}`, 'info');
    }
  }, [gameState.tick, gameState.stage, showToast, tData]);

  return (
    <div className="relative w-screen h-screen flex flex-col bg-stone-950 text-stone-100 overflow-hidden">
      <TopBar
        state={gameState}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(p => !p)}
        onStepTick={handleStepTick}
        onOpenGovernance={() => setIsGovernanceOpen(true)}
        onOpenPuzzle={() => setIsPuzzleOpen(true)}
        onOpenCivicTasks={() => setIsCivicTasksOpen(true)}
        onOpenTimeline={() => setIsTimelineOpen(true)}
        onOpenAuditLegal={() => setIsAuditLegalOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenWorkshop={() => setIsWorkshopOpen(true)}
        onShareCity={handleShareCity}
      />

      {/* Mission / Objective Banner */}
      <div className="w-full px-4 py-1.5 bg-gradient-to-r from-amber-950/90 via-stone-900/90 to-amber-950/90 border-b border-amber-800/40 flex items-center gap-2.5 z-10">
        <span className="text-amber-400 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">{tData.mission.missionLabel}</span>
        <span className="font-title text-amber-100 text-sm font-semibold whitespace-nowrap">{mission.title}</span>
        <span className="text-stone-300 text-xs truncate hidden sm:inline">— {mission.hint}</span>
      </div>

      {/* Main Interactive Map Viewport */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <CityCanvas
          state={gameState}
          selectedCoord={selectedCoord}
          onSelectCoord={setSelectedCoord}
          activeBuildTool={activeBuildTool}
          onBuildOnCell={handleBuildOnCell}
        />

        {/* Selected Parcel Inspector Panel */}
        <ParcelInspector
          parcel={selectedParcel}
          onClose={() => setSelectedCoord(null)}
          onClaim={(x, y) => dispatchCommand({ type: 'CLAIM_PARCEL', x, y, actorId: 'cetatean_local' })}
          onBuild={(x, y, type) => dispatchCommand({ type: 'CONSTRUCT_BUILDING', x, y, buildingType: type, actorId: 'cetatean_local' })}
          onUpgrade={(x, y) => dispatchCommand({ type: 'UPGRADE_BUILDING', x, y, actorId: 'cetatean_local' })}
          onDemolish={(x, y) => dispatchCommand({ type: 'DEMOLISH_BUILDING', x, y, actorId: 'cetatean_local' })}
          availableMaterials={gameState.resources.materials}
          availableCredits={gameState.resources.virtualCredits}
        />

        {/* Build Toolbar */}
        <BuildToolbar
          activeTool={activeBuildTool}
          onSelectTool={setActiveBuildTool}
          availableMaterials={gameState.resources.materials}
          availableCredits={gameState.resources.virtualCredits}
        />
      </main>

      {/* Modals */}
      {isGovernanceOpen && (
        <GovernanceModal
          state={gameState}
          onClose={() => setIsGovernanceOpen(false)}
          onUpdatePolicy={(key, val) => dispatchCommand({ type: 'SET_POLICY', policyKey: key, value: val, actorId: 'cetatean_local' })}
        />
      )}

      {isPuzzleOpen && (
        <PuzzleModal
          state={gameState}
          onClose={() => setIsPuzzleOpen(false)}
          onRotateTile={(x, y) => dispatchCommand({ type: 'ROTATE_PUZZLE_TILE', x, y, actorId: 'cetatean_local' })}
        />
      )}

      {isCivicTasksOpen && (
        <CivicTasksModal
          onClose={() => setIsCivicTasksOpen(false)}
          onPerformTask={kind => dispatchCommand({ type: 'WORK_CIVIC_TASK', actorId: 'cetatean_local', taskKind: kind })}
        />
      )}

      {isTimelineOpen && (
        <TimelineModal
          events={eventsHistory}
          currentTick={gameState.tick}
          onClose={() => setIsTimelineOpen(false)}
        />
      )}

      {isAuditLegalOpen && (
        <AuditLegalModal
          state={gameState}
          onClose={() => setIsAuditLegalOpen(false)}
          onImportState={setGameState}
        />
      )}

      {isTutorialOpen && (
        <TutorialModal
          onClose={() => {
            setIsTutorialOpen(false);
            try {
              localStorage.setItem('stupul_tutorial_seen', '1');
            } catch {}
          }}
          onStart={() => {
            setIsPlaying(true);
            showToast('Simularea orașului a pornit. Construiește prima ta Casă!', 'success');
          }}
        />
      )}

      {isWorkshopOpen && (
        <CommunityWorkshopModal
          isOpen={isWorkshopOpen}
          onClose={() => setIsWorkshopOpen(false)}
        />
      )}

      {/* Toast feedback */}
      {toast && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg border text-sm font-semibold shadow-xl max-w-[90vw] text-center transition-opacity ${
          toast.kind === 'error'
            ? 'bg-red-950/95 border-red-600/60 text-red-100'
            : toast.kind === 'success'
              ? 'bg-emerald-950/95 border-emerald-600/60 text-emerald-100'
              : 'bg-stone-900/95 border-amber-600/50 text-amber-100'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};
