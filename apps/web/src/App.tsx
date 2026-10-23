import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GameState, 
  createInitialState, 
  reduce, 
  EngineCommand, 
  BuildingType,
  CityPolicies 
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

const storage = new OfflineStorage();

export const App: React.FC = () => {
  // Initialize state from offline storage or initial seed
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = storage.loadLocal();
    return saved || createInitialState(42, 'Avanpostul Văii');
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedCoord, setSelectedCoord] = useState<{ x: number; y: number } | null>(null);
  const [activeBuildTool, setActiveBuildTool] = useState<BuildTool>(null);
  const [eventsHistory, setEventsHistory] = useState<string[]>([
    'Avanpostul de Frontieră a fost întemeiat pe malul râului.',
    'Primele 100 de suflete s-au așezat în vale.'
  ]);

  // Modal open states
  const [isGovernanceOpen, setIsGovernanceOpen] = useState<boolean>(false);
  const [isPuzzleOpen, setIsPuzzleOpen] = useState<boolean>(false);
  const [isCivicTasksOpen, setIsCivicTasksOpen] = useState<boolean>(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false);
  const [isAuditLegalOpen, setIsAuditLegalOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('stupul_tutorial_seen');
    } catch {
      return false;
    }
  });

  // Auto-save on state change
  useEffect(() => {
    storage.saveLocal(gameState);
  }, [gameState]);

  // Command dispatcher through pure reducer
  const dispatchCommand = useCallback((cmd: EngineCommand) => {
    setGameState(prev => {
      const res = reduce(prev, cmd);
      if (res.success) {
        if (res.eventsEmitted.length > 0) {
          setEventsHistory(h => [...h, ...res.eventsEmitted].slice(-100));
        }
        return res.nextState;
      } else {
        if (res.error) {
          alert(res.error);
        }
        return prev;
      }
    });
  }, []);

  // Tick step
  const handleStepTick = useCallback(() => {
    dispatchCommand({ type: 'TICK' });
  }, [dispatchCommand]);

  // Simulation timer loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      handleStepTick();
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying, handleStepTick]);

  // Cell click handler with active tool
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

  return (
    <div className="relative w-screen h-screen flex flex-col bg-stone-950 text-stone-100 overflow-hidden">
      {/* Top Navigation & Status Bar */}
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
      />

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
          onOpenPuzzle={() => {
            setIsTutorialOpen(false);
            setIsPuzzleOpen(true);
          }}
          onOpenGovernance={() => {
            setIsTutorialOpen(false);
            setIsGovernanceOpen(true);
          }}
        />
      )}
    </div>
  );
};
