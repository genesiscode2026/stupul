import React, { useState } from 'react';
import { GameState } from '@stupul/engine';
import { exportSnapshotToJson, validateAndImportSnapshot } from '@stupul/shared';
import { calculateRoyalties } from '@stupul/domain';
import { 
  X, 
  Scale, 
  Download, 
  Upload, 
  Hash, 
  Calculator,
  Lock
} from 'lucide-react';

interface AuditLegalModalProps {
  state: GameState;
  onClose: () => void;
  onImportState: (newState: GameState) => void;
}

export const AuditLegalModal: React.FC<AuditLegalModalProps> = ({
  state,
  onClose,
  onImportState
}) => {
  const [testGross, setTestGross] = useState<number>(100000);
  const [testTax, setTestTax] = useState<number>(10000);
  const [testRefunds, setTestRefunds] = useState<number>(2000);
  const [testFees, setTestFees] = useState<number>(1000);
  const [importError, setImportError] = useState<string | null>(null);

  const royaltyResult = calculateRoyalties({
    gross: testGross,
    collectedTax: testTax,
    refunds: testRefunds,
    refundedChargebacks: 0,
    directProcessorFees: testFees
  });

  const handleExport = () => {
    const jsonStr = exportSnapshotToJson(state);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stupul_snapshot_tick_${state.tick}_${state.stateHash.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const res = validateAndImportSnapshot(content);
      if (res.success && res.state) {
        onImportState(res.state);
        setImportError(null);
        alert('Snapshot încărcat cu succes! Integritatea stării a fost validată.');
      } else {
        setImportError(res.error || 'Eroare necunoscută la validare');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="frontier-panel w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden border border-amber-600/40 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/40 bg-stone-950/80">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h2 className="font-title text-base font-bold text-amber-200">
              Audit, Integritate & Redevențe Fondator (GENESIS v1.1)
            </h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-100 p-1.5 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Canonical Hash & Determinism */}
          <div className="frontier-panel p-3.5 rounded-lg border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-amber-400" />
                Hash Canonic SHA-256 de Integritate:
              </span>
              <span className="text-[10px] text-stone-400">Verificabil pe orice mașină</span>
            </div>
            <div className="p-2 bg-stone-950 rounded border border-stone-800 font-mono text-[11px] text-amber-400/90 break-all select-all">
              {state.stateHash}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleExport}
                className="frontier-button px-3 py-1.5 rounded font-semibold text-stone-200 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                Descarcă Snapshot JSON
              </button>
              <label className="frontier-button px-3 py-1.5 rounded font-semibold text-stone-200 flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                Încarcă Snapshot JSON
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            {importError && (
              <div className="p-2 bg-rose-950/80 border border-rose-700 text-rose-300 rounded text-[11px] mt-2">
                {importError}
              </div>
            )}
          </div>

          {/* Founder Royalty Model Simulator */}
          <div className="frontier-panel p-4 rounded-lg border border-amber-900/40 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
                <Calculator className="w-4 h-4 text-amber-400" />
                Modelul Contractual al Redevenței de 5% (LEG-001)
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-600/40 text-amber-300 font-bold text-[10px]">
                5% FIX DIN NET ELIGIBIL
              </span>
            </div>

            <p className="text-stone-300 text-[11px] leading-relaxed">
              Formula contractuală: <strong>Încasări Brute</strong> minus <strong>Taxe/TVA</strong>, <strong>Rambursări</strong> și <strong>Comisioane Directe de Procesare</strong>. Cheltuielile generale, salariile și marketingul <strong>NU</strong> reduc baza eligibilă (anti-deturnare).
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
              <div className="bg-stone-950/60 p-2 rounded border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Încasări Brute (€)</span>
                <input
                  type="number"
                  value={testGross}
                  onChange={e => setTestGross(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-stone-900 border border-stone-700 rounded px-1.5 py-0.5 text-center font-bold text-stone-100 text-xs mt-1"
                />
              </div>
              <div className="bg-stone-950/60 p-2 rounded border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Taxe / TVA (€)</span>
                <input
                  type="number"
                  value={testTax}
                  onChange={e => setTestTax(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-stone-900 border border-stone-700 rounded px-1.5 py-0.5 text-center font-bold text-stone-100 text-xs mt-1"
                />
              </div>
              <div className="bg-stone-950/60 p-2 rounded border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Rambursări (€)</span>
                <input
                  type="number"
                  value={testRefunds}
                  onChange={e => setTestRefunds(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-stone-900 border border-stone-700 rounded px-1.5 py-0.5 text-center font-bold text-stone-100 text-xs mt-1"
                />
              </div>
              <div className="bg-stone-950/60 p-2 rounded border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Taxe Procesator (€)</span>
                <input
                  type="number"
                  value={testFees}
                  onChange={e => setTestFees(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-stone-900 border border-stone-700 rounded px-1.5 py-0.5 text-center font-bold text-stone-100 text-xs mt-1"
                />
              </div>
            </div>

            <div className="bg-stone-950 p-3 rounded border border-amber-600/40 flex justify-between items-center text-xs">
              <div>
                <span className="text-stone-400">Bază Netă Eligibilă: </span>
                <strong className="text-stone-100">{royaltyResult.eligible.toLocaleString()} €</strong>
              </div>
              <div className="text-right">
                <span className="text-stone-400">Redevență Fondator (5%): </span>
                <strong className="text-amber-400 text-sm">{royaltyResult.founderRoyaltyGross.toLocaleString()} €</strong>
              </div>
            </div>
          </div>

          {/* Legal Gate Status */}
          <div className="frontier-panel p-3.5 rounded-lg border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-rose-400" />
                Statut Legal Gates (Fail-Closed):
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 font-bold text-[10px]">
                MONETIZARE STRICT BLOCATĂ
              </span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Conform LEG-T05 și regulilor GENESIS v1.1, nicio funcție de plată reală sau monedă tranzacționabilă nu poate fi activată fără îndeplinirea cumulativă a tuturor celor 6 porți legale (Operator verificat, Licență 5% semnată, Aviz Avocat IP/Fiscal, GDPR, etc.).
            </p>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950/60 flex justify-end">
          <button onClick={onClose} className="frontier-button px-4 py-1.5 rounded font-semibold text-stone-200 text-xs">
            Închide
          </button>
        </div>
      </div>
    </div>
  );
};
