import React, { useState } from 'react';
import { GameState, CityPolicies, FoodRationingMode } from '@stupul/engine';
import { 
  X, 
  Landmark, 
  Users, 
  Code, 
  Vote, 
  Scale, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  Award
} from 'lucide-react';

interface GovernanceModalProps {
  state: GameState;
  onClose: () => void;
  onUpdatePolicy: (key: keyof CityPolicies, value: any) => void;
}

export const GovernanceModal: React.FC<GovernanceModalProps> = ({
  state,
  onClose,
  onUpdatePolicy
}) => {
  const [activeTab, setActiveTab] = useState<'citizens' | 'contributors' | 'mayor' | 'laws'>('citizens');
  const [userVote, setUserVote] = useState<Record<string, 'yes' | 'no' | 'abstain'>>({});

  // Sample active civic proposals
  const proposals = [
    {
      id: 'prop-1',
      title: 'Subvenționarea Grânarelor Comunitare',
      description: 'Alocarea a 20 de credite pe ciclu pentru creșterea stocurilor de hrană în depozite.',
      proposer: 'Ioan Plugarul',
      yesVotes: 42,
      noVotes: 7,
      status: 'În votare'
    },
    {
      id: 'prop-2',
      title: 'Extinderea Rețelei de Drumuri Pietruite',
      description: 'Construcția obligatorie de drumuri pentru conectarea noilor parcele la primărie.',
      proposer: 'Elena Arhitect',
      yesVotes: 38,
      noVotes: 12,
      status: 'În votare'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="frontier-panel w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-amber-600/40">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/50 bg-stone-950/80">
          <div className="flex items-center gap-2.5">
            <Landmark className="w-5 h-5 text-amber-400" />
            <h2 className="font-title text-lg font-bold text-amber-200">
              Guvernanța Democratică a STUPUL
            </h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-100 p-1.5 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-900/60 px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('citizens')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'citizens' ? 'border-amber-400 text-amber-300' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Camera Cetățenilor (1 om = 1 vot)
          </button>
          <button
            onClick={() => setActiveTab('contributors')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'contributors' ? 'border-amber-400 text-amber-300' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Code className="w-4 h-4" />
            Camera Contributorilor (Merit 90z)
          </button>
          <button
            onClick={() => setActiveTab('mayor')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'mayor' ? 'border-amber-400 text-amber-300' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Vote className="w-4 h-4" />
            Primar & Alegeri
          </button>
          <button
            onClick={() => setActiveTab('laws')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'laws' ? 'border-amber-400 text-amber-300' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            Legi & Politici Publice
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'citizens' && (
            <div className="space-y-4">
              <div className="bg-amber-950/40 p-3 rounded border border-amber-700/30 text-amber-200/90 leading-relaxed">
                <strong>Principiu Constituțional GOV-001:</strong> Fiecare cetățean are exact 1 vot egal. Bogăția în joc, parcelele deținute sau numărul de acțiuni în firma comercială conferă <strong>0 voturi în plus</strong>.
              </div>

              <div className="space-y-3">
                <h3 className="font-title text-sm font-bold text-stone-200">Propuneri Civice Active</h3>
                {proposals.map(prop => (
                  <div key={prop.id} className="frontier-panel p-4 rounded-lg border border-stone-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-amber-300 text-sm">{prop.title}</h4>
                        <p className="text-stone-400 text-[11px] mt-0.5">Inițiat de: {prop.proposer}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 rounded text-[10px]">
                        {prop.status}
                      </span>
                    </div>
                    <p className="text-stone-300 leading-relaxed">{prop.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
                      <div className="flex gap-3 text-stone-400">
                        <span className="text-emerald-400 font-bold">DA: {prop.yesVotes + (userVote[prop.id] === 'yes' ? 1 : 0)}</span>
                        <span className="text-rose-400 font-bold">NU: {prop.noVotes + (userVote[prop.id] === 'no' ? 1 : 0)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setUserVote(v => ({ ...v, [prop.id]: 'yes' }))}
                          className={`frontier-button px-3 py-1 rounded font-bold ${
                            userVote[prop.id] === 'yes' ? 'bg-emerald-700 text-white' : ''
                          }`}
                        >
                          Votează DA
                        </button>
                        <button
                          onClick={() => setUserVote(v => ({ ...v, [prop.id]: 'no' }))}
                          className={`frontier-button px-3 py-1 rounded font-bold ${
                            userVote[prop.id] === 'no' ? 'bg-rose-700 text-white' : ''
                          }`}
                        >
                          Votează NU
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contributors' && (
            <div className="space-y-4">
              <div className="bg-stone-950/60 p-3 rounded border border-stone-800 leading-relaxed text-stone-300">
                <strong>GOV-010 & GOV-020:</strong> Reputația și meritul se acordă exclusiv pentru contribuții testate și validate independent. Meritul scade la jumătate după 45 de zile și expiră complet la 90 de zile. Niciun contributor nu poate deține peste 5% din votul camerei.
              </div>

              <div className="space-y-2.5">
                <h3 className="font-title text-sm font-bold text-stone-200">Registrul Contribuțiilor Validate</h3>
                <div className="space-y-2">
                  <div className="bg-stone-950/50 p-3 rounded border border-stone-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        Motorul Deterministic 16x16 & Reducătorul Pur
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Autor: Antigravity • Evaluator Independent: Lead QA • Rubrică: 100p (Pondere 3x)
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-600/40 text-amber-300 font-bold">
                        300 Merit Activ
                      </span>
                      <div className="text-[10px] text-stone-500 mt-1">Acceptat: Astăzi (100% greutate)</div>
                    </div>
                  </div>

                  <div className="bg-stone-950/50 p-3 rounded border border-stone-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        Arhitectura Izometrică Canvas 2D & Stilul Frontieră
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Autor: Senior Visuals • Evaluator Independent: Game Reviewer • Rubrică: 95p (Pondere 2x)
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-600/40 text-amber-300 font-bold">
                        190 Merit Activ
                      </span>
                      <div className="text-[10px] text-stone-500 mt-1">Acceptat: Astăzi (100% greutate)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mayor' && (
            <div className="space-y-4">
              <div className="frontier-panel p-4 rounded-lg border border-amber-700/40 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-title text-base font-bold text-amber-300">Primarul Așezării</h3>
                    <p className="text-stone-400 text-xs">Mandat civic temporar (GOV-030)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-950 border border-amber-600 text-amber-200 font-semibold text-xs">
                    Activ • Mandatul 1 din max 2
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-stone-950/60 p-3 rounded border border-stone-800">
                  <div>
                    <span className="text-stone-400">Titular Mandat:</span>
                    <div className="font-bold text-stone-100">Sfatul Cetățenilor / Primar Ales</div>
                  </div>
                  <div>
                    <span className="text-stone-400">Durată Mandat:</span>
                    <div className="font-bold text-amber-300">30 de Zile (Pasul {state.tick} / 30)</div>
                  </div>
                  <div>
                    <span className="text-stone-400">Activitate Civică:</span>
                    <div className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 inline" /> Livrări verificate la zi
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-400">Procedură Revocare:</span>
                    <div className="text-stone-300 text-[11px]">30z inactivitate + 7z remediere</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'laws' && (
            <div className="space-y-4">
              <h3 className="font-title text-sm font-bold text-stone-200">Reglajul Politicilor Publice</h3>

              {/* Tax Rate Slider */}
              <div className="bg-stone-950/50 p-3.5 rounded border border-stone-800 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-amber-300">Impozit Virtual pe Cifra Economică:</span>
                  <span className="font-bold text-amber-400">{state.policies.taxRatePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={state.policies.taxRatePercent}
                  onChange={e => onUpdatePolicy('taxRatePercent', parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <p className="text-[11px] text-stone-400">
                  Generează credite virtuale la bugetul orașului. Dacă depășește 20%, scade satisfacția cetățenilor.
                </p>
              </div>

              {/* Food Rationing */}
              <div className="bg-stone-950/50 p-3.5 rounded border border-stone-800 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-amber-300">Regimul Rațiilor de Hrană:</span>
                  <span className="font-bold text-amber-400 capitalize">{state.policies.foodRationing}</span>
                </div>
                <div className="flex gap-2">
                  {(['austere', 'standard', 'abundant'] as FoodRationingMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => onUpdatePolicy('foodRationing', mode)}
                      className={`frontier-button flex-1 py-1.5 rounded font-semibold capitalize ${
                        state.policies.foodRationing === mode ? 'bg-amber-600 text-stone-900 border-amber-400' : ''
                      }`}
                    >
                      {mode === 'austere' ? 'Auster (0.7x)' : mode === 'standard' ? 'Standard (1.0x)' : 'Abundent (1.4x)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Education Subsidy */}
              <div className="bg-stone-950/50 p-3.5 rounded border border-stone-800 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-amber-300">Subvenție Școli & Educație:</span>
                  <span className="font-bold text-amber-400">{state.policies.educationSubsidyPercent}% din fond</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={state.policies.educationSubsidyPercent}
                  onChange={e => onUpdatePolicy('educationSubsidyPercent', parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
