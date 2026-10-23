import React from 'react';
import { X, History, Scroll, Clock } from 'lucide-react';

interface TimelineModalProps {
  events: string[];
  currentTick: number;
  onClose: () => void;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({
  events,
  currentTick,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="frontier-panel w-full max-w-lg rounded-xl shadow-2xl flex flex-col overflow-hidden border border-amber-700/40 max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-amber-900/40 bg-stone-950/80">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="font-title text-base font-bold text-amber-200">
              Jurnalul Istoric al Orașului (Append-Only)
            </h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-100 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-2 text-xs">
          <div className="bg-stone-950/60 p-2.5 rounded border border-stone-800 text-stone-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Istoric determinist imutabil (STP-007, STP-100). Pasul curent: <strong>{currentTick}</strong>.
            </span>
          </div>

          <div className="space-y-1.5 pt-2">
            {events.slice().reverse().map((ev, idx) => (
              <div
                key={idx}
                className="bg-stone-950/40 p-2.5 rounded border border-stone-800/80 flex items-start gap-2.5 text-stone-300"
              >
                <Scroll className="w-4 h-4 text-amber-500/80 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{ev}</span>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center py-8 text-stone-500">
                Niciun eveniment înregistrat încă.
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/60 flex justify-end">
          <button onClick={onClose} className="frontier-button px-4 py-1.5 rounded font-semibold text-stone-200 text-xs">
            Închide
          </button>
        </div>
      </div>
    </div>
  );
};
