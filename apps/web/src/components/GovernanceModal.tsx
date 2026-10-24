import React, { useState } from 'react';
import { GameState, CityPolicies, FoodRationingMode } from '@stupul/engine';
import { 
  X, 
  Landmark, 
  Users, 
  Code, 
  Vote, 
  Scale, 
  CheckCircle2, 
  Award
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.js';

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
  const { lang, tData } = useLanguage();
  const [activeTab, setActiveTab] = useState<'citizens' | 'contributors' | 'mayor' | 'laws'>('citizens');
  const [userVote, setUserVote] = useState<Record<string, 'yes' | 'no' | 'abstain'>>({});

  // Active civic proposals localized
  const proposals = [
    {
      id: 'prop-1',
      title: lang === 'ro' ? 'Subvenționarea Grânarelor Comunitare' : 'Community Granaries Subsidy',
      description: lang === 'ro' 
        ? 'Alocarea a 20 de credite pe ciclu pentru creșterea stocurilor de hrană în depozite.' 
        : 'Allocating 20 credits per cycle to boost food reserve stocks in granaries.',
      proposer: lang === 'ro' ? 'Ioan Plugarul' : 'John the Farmer',
      yesVotes: 42,
      noVotes: 7,
      status: tData.governance.inVoting
    },
    {
      id: 'prop-2',
      title: lang === 'ro' ? 'Extinderea Rețelei de Drumuri Pietruite' : 'Cobblestone Road Network Expansion',
      description: lang === 'ro' 
        ? 'Construcția obligatorie de drumuri pentru conectarea noilor parcele la primărie.' 
        : 'Mandatory road construction connecting newly claimed parcels to the town hall.',
      proposer: lang === 'ro' ? 'Elena Arhitect' : 'Helen Architect',
      yesVotes: 38,
      noVotes: 12,
      status: tData.governance.inVoting
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
              {tData.governance.modalTitle}
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
            {tData.governance.tabCitizens}
          </button>
          <button
            onClick={() => setActiveTab('contributors')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'contributors' ? 'border-amber-400 text-amber-300' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Code className="w-4 h-4" />
            {tData.governance.tabContributors}
          </button>
          <button
            onClick={() => setActiveTab('mayor')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'mayor' ? 'border-amber-400 text-amber-300' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Vote className="w-4 h-4" />
            {tData.governance.tabMayor}
          </button>
          <button
            onClick={() => setActiveTab('laws')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'laws' ? 'border-amber-400 text-amber-300' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            {tData.governance.tabLaws}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'citizens' && (
            <div className="space-y-4">
              <div className="bg-amber-950/40 p-3 rounded border border-amber-700/30 text-amber-200/90 leading-relaxed">
                <strong>Principiu Constituțional GOV-001:</strong> {tData.governance.govPrinciple}
              </div>

              <div className="space-y-3">
                <h3 className="font-title text-sm font-bold text-stone-200">{tData.governance.activeProposals}</h3>
                {proposals.map(prop => (
                  <div key={prop.id} className="frontier-panel p-4 rounded-lg border border-stone-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-amber-300 text-sm">{prop.title}</h4>
                        <p className="text-stone-400 text-[11px] mt-0.5">{tData.governance.initiatedBy} {prop.proposer}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 rounded text-[10px]">
                        {prop.status}
                      </span>
                    </div>
                    <p className="text-stone-300 leading-relaxed">{prop.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
                      <div className="flex gap-3 text-stone-400">
                        <span className="text-emerald-400 font-bold">{tData.governance.yesLabel} {prop.yesVotes + (userVote[prop.id] === 'yes' ? 1 : 0)}</span>
                        <span className="text-rose-400 font-bold">{tData.governance.noLabel} {prop.noVotes + (userVote[prop.id] === 'no' ? 1 : 0)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setUserVote(v => ({ ...v, [prop.id]: 'yes' }))}
                          className={`frontier-button px-3 py-1 rounded font-bold ${
                            userVote[prop.id] === 'yes' ? 'bg-emerald-700 text-white' : ''
                          }`}
                        >
                          {tData.governance.voteYes}
                        </button>
                        <button
                          onClick={() => setUserVote(v => ({ ...v, [prop.id]: 'no' }))}
                          className={`frontier-button px-3 py-1 rounded font-bold ${
                            userVote[prop.id] === 'no' ? 'bg-rose-700 text-white' : ''
                          }`}
                        >
                          {tData.governance.voteNo}
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
                <strong>GOV-010 & GOV-020:</strong> {tData.governance.contributorsRule}
              </div>

              <div className="space-y-2.5">
                <h3 className="font-title text-sm font-bold text-stone-200">{tData.governance.registryTitle}</h3>
                <div className="space-y-2">
                  <div className="bg-stone-950/50 p-3 rounded border border-stone-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        {lang === 'ro' ? 'Motorul Deterministic 16x16 & Reducătorul Pur' : 'Deterministic 16x16 Engine & Pure Reducer'}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        {lang === 'ro' 
                          ? 'Autor: Antigravity • Evaluator Independent: Lead QA • Rubrică: 100p (Pondere 3x)'
                          : 'Author: Antigravity • Independent Reviewer: Lead QA • Rubric: 100p (3x Weight)'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-600/40 text-amber-300 font-bold">
                        300 {tData.governance.activeMerit}
                      </span>
                      <div className="text-[10px] text-stone-500 mt-1">{tData.governance.acceptedToday}</div>
                    </div>
                  </div>

                  <div className="bg-stone-950/50 p-3 rounded border border-stone-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        {lang === 'ro' ? 'Arhitectura Izometrică Canvas 2D & Stilul Frontieră' : '2D Canvas Isometric Architecture & Frontier Style'}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        {lang === 'ro'
                          ? 'Autor: Senior Visuals • Evaluator Independent: Game Reviewer • Rubrică: 95p (Pondere 2x)'
                          : 'Author: Senior Visuals • Independent Reviewer: Game Reviewer • Rubric: 95p (2x Weight)'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-600/40 text-amber-300 font-bold">
                        190 {tData.governance.activeMerit}
                      </span>
                      <div className="text-[10px] text-stone-500 mt-1">{tData.governance.acceptedToday}</div>
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
                    <h3 className="font-title text-base font-bold text-amber-300">{tData.governance.mayorTitle}</h3>
                    <p className="text-stone-400 text-xs">{tData.governance.mayorSub}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-950 border border-amber-600 text-amber-200 font-semibold text-xs">
                    {tData.governance.mayorActive}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-stone-950/60 p-3 rounded border border-stone-800">
                  <div>
                    <span className="text-stone-400">{tData.governance.holderLabel}</span>
                    <div className="font-bold text-stone-100">{tData.governance.holderVal}</div>
                  </div>
                  <div>
                    <span className="text-stone-400">{tData.governance.durationLabel}</span>
                    <div className="font-bold text-amber-300">30 {lang === 'ro' ? 'de Zile' : 'Days'} ({lang === 'ro' ? 'Pasul' : 'Step'} {state.tick} / 30)</div>
                  </div>
                  <div>
                    <span className="text-stone-400">{tData.governance.civicActLabel}</span>
                    <div className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 inline" /> {tData.governance.civicActVal}
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-400">{tData.governance.recallProc}</span>
                    <div className="text-stone-300 text-[11px]">{tData.governance.recallVal}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'laws' && (
            <div className="space-y-4">
              <h3 className="font-title text-sm font-bold text-stone-200">{tData.governance.policyTuning}</h3>

              {/* Tax Rate Slider */}
              <div className="bg-stone-950/50 p-3.5 rounded border border-stone-800 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-amber-300">{tData.governance.taxRateLabel}</span>
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
                  {tData.governance.taxRateDesc}
                </p>
              </div>

              {/* Food Rationing */}
              <div className="bg-stone-950/50 p-3.5 rounded border border-stone-800 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-amber-300">{tData.governance.foodRationLabel}</span>
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
                      {mode === 'austere' ? tData.governance.austere : mode === 'standard' ? tData.governance.standard : tData.governance.abundant}
                    </button>
                  ))}
                </div>
              </div>

              {/* Education Subsidy */}
              <div className="bg-stone-950/50 p-3.5 rounded border border-stone-800 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-amber-300">{tData.governance.educationLabel}</span>
                  <span className="font-bold text-amber-400">{state.policies.educationSubsidyPercent}% {tData.governance.fromFund}</span>
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
