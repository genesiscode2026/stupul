import React from 'react';
import { X, Pickaxe, Wheat, Trees, Mountain, Landmark, Coins, Shield } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.js';

interface CivicTasksModalProps {
  onClose: () => void;
  onPerformTask: (kind: 'farming' | 'woodcutting' | 'masonry' | 'civic_duty') => void;
}

export const CivicTasksModal: React.FC<CivicTasksModalProps> = ({
  onClose,
  onPerformTask
}) => {
  const { tData } = useLanguage();

  const tasks = [
    {
      id: 'farming' as const,
      title: tData.civicTasks.farmingTitle,
      desc: tData.civicTasks.farmingDesc,
      reward: tData.civicTasks.farmingReward,
      icon: <Wheat className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'woodcutting' as const,
      title: tData.civicTasks.woodcuttingTitle,
      desc: tData.civicTasks.woodcuttingDesc,
      reward: tData.civicTasks.woodcuttingReward,
      icon: <Trees className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'masonry' as const,
      title: tData.civicTasks.masonryTitle,
      desc: tData.civicTasks.masonryDesc,
      reward: tData.civicTasks.masonryReward,
      icon: <Mountain className="w-5 h-5 text-stone-300" />
    },
    {
      id: 'civic_duty' as const,
      title: tData.civicTasks.civicDutyTitle,
      desc: tData.civicTasks.civicDutyDesc,
      reward: tData.civicTasks.civicDutyReward,
      icon: <Landmark className="w-5 h-5 text-sky-400" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="frontier-panel w-full max-w-lg rounded-xl shadow-2xl flex flex-col overflow-hidden border border-amber-600/40">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-amber-900/40 bg-stone-950/80">
          <div className="flex items-center gap-2">
            <Pickaxe className="w-5 h-5 text-amber-400" />
            <h2 className="font-title text-base font-bold text-amber-200">
              {tData.civicTasks.modalTitle}
            </h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-100 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          <div className="bg-stone-950/60 p-2.5 rounded border border-stone-800 text-stone-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {tData.civicTasks.disclaimer}
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {tasks.map(task => (
              <div
                key={task.id}
                className="frontier-panel p-3.5 rounded-lg border border-stone-800 flex items-center justify-between gap-3 hover:border-amber-600/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-stone-950 rounded-lg border border-stone-800">
                    {task.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-100 text-xs">{task.title}</h3>
                    <p className="text-stone-400 text-[11px] mt-0.5">{task.desc}</p>
                    <div className="text-[10px] text-amber-300 font-semibold mt-1">
                      {tData.civicTasks.rewardLabel} {task.reward}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onPerformTask(task.id)}
                  className="frontier-button px-3.5 py-2 rounded text-xs font-bold text-amber-200 whitespace-nowrap flex items-center gap-1 shadow"
                >
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                  {tData.civicTasks.workBtn}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/60 flex justify-end">
          <button onClick={onClose} className="frontier-button px-4 py-1.5 rounded font-semibold text-stone-200 text-xs">
            {tData.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
