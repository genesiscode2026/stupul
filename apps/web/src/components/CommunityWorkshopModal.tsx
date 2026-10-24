import React, { useState } from 'react';
import { 
  Hammer, 
  X, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  GitPullRequest, 
  Award, 
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.js';

interface CommunityWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProposalItem {
  id: string;
  title: string;
  desc: string;
  category: string;
  author: string;
  votesUp: number;
  votesDown: number;
  status: 'submitted' | 'approved';
}

export const CommunityWorkshopModal: React.FC<CommunityWorkshopModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { lang, tData } = useLanguage();
  const [activeTab, setActiveTab] = useState<'proposals' | 'projects' | 'merit'>('proposals');

  const initialProposals: ProposalItem[] = [
    {
      id: 'prop-101',
      title: lang === 'ro' ? 'Conducte subterane de argilă pentru cartierul de Est' : 'Underground clay pipes for the East district',
      desc: lang === 'ro' 
        ? 'Reducerea pierderilor de apă prin evaporare și creșterea debitului apeductului cu 20%.' 
        : 'Reducing water evaporation loss and increasing aqueduct flow rate by 20%.',
      category: lang === 'ro' ? 'Infrastructură' : 'Infrastructure',
      author: 'PionierulMarius',
      votesUp: 18,
      votesDown: 2,
      status: 'submitted',
    },
    {
      id: 'prop-102',
      title: lang === 'ro' ? 'Atelier comunitar de olărit și cărămidărie' : 'Community pottery & brick kiln workshop',
      desc: lang === 'ro'
        ? 'Producerea de materiale rezistente din depozitele de argilă ale văii.'
        : 'Producing durable construction materials from valley clay deposits.',
      category: lang === 'ro' ? 'Economie' : 'Economy',
      author: 'ElenaCivic',
      votesUp: 24,
      votesDown: 1,
      status: 'approved',
    },
    {
      id: 'prop-103',
      title: lang === 'ro' ? 'Sistem de iluminat stradal cu opaițe și ulei de in' : 'Street lighting system using oil lamps',
      desc: lang === 'ro'
        ? 'Crește siguranța nocturnă a cetățenilor și fericirea așezării cu +5%.'
        : 'Boosts citizen night safety and settlement happiness by +5%.',
      category: lang === 'ro' ? 'Siguranță' : 'Safety',
      author: 'PazniculStefan',
      votesUp: 15,
      votesDown: 4,
      status: 'submitted',
    },
  ];

  const [proposals, setProposals] = useState<ProposalItem[]>(initialProposals);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [dcoAgreed, setDcoAgreed] = useState(false);

  if (!isOpen) return null;

  const handleVote = (id: string, up: boolean) => {
    setProposals(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            votesUp: up ? p.votesUp + 1 : p.votesUp,
            votesDown: !up ? p.votesDown + 1 : p.votesDown,
          };
        }
        return p;
      })
    );
  };

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !dcoAgreed) return;

    const newProp: ProposalItem = {
      id: `prop-${Date.now()}`,
      title: newTitle.trim(),
      desc: newDesc.trim(),
      category: lang === 'ro' ? 'Comunitar' : 'Community',
      author: lang === 'ro' ? 'CetateanAnonim' : 'AnonymousCitizen',
      votesUp: 1,
      votesDown: 0,
      status: 'submitted',
    };

    setProposals([newProp, ...proposals]);
    setNewTitle('');
    setNewDesc('');
    setDcoAgreed(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="frontier-panel w-full max-w-3xl max-h-[90vh] flex flex-col border border-amber-600/40 rounded-lg shadow-2xl bg-stone-950 text-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-950/80 border border-amber-600/50 rounded-lg text-amber-400">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-title text-lg font-bold text-amber-200 tracking-wide">
                {tData.workshop.modalTitle}
              </h2>
              <p className="text-xs text-stone-400">
                {tData.workshop.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-800 bg-stone-900/30 px-6 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('proposals')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'proposals'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileCheck className="w-4 h-4" /> {tData.workshop.tabProposals} ({proposals.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <GitPullRequest className="w-4 h-4" /> {tData.workshop.tabProjects}
          </button>
          <button
            onClick={() => setActiveTab('merit')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'merit'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Award className="w-4 h-4" /> {tData.workshop.tabMerit}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'proposals' && (
            <div className="space-y-6">
              {/* Form submit */}
              <form onSubmit={handleCreateProposal} className="p-4 bg-stone-900/40 border border-stone-800 rounded-lg space-y-3">
                <h3 className="font-semibold text-amber-300 text-xs uppercase tracking-wider">
                  {tData.workshop.formTitle}
                </h3>
                <input
                  type="text"
                  placeholder={tData.workshop.titlePlaceholder}
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded px-3 py-2 text-xs focus:border-amber-500 outline-none text-stone-100"
                />
                <textarea
                  placeholder={tData.workshop.descPlaceholder}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-stone-950 border border-stone-700 rounded px-3 py-2 text-xs focus:border-amber-500 outline-none text-stone-100"
                />
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <label className="flex items-center gap-2 text-[11px] text-stone-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dcoAgreed}
                      onChange={e => setDcoAgreed(e.target.checked)}
                      className="rounded border-stone-700 text-amber-500"
                    />
                    <span>{tData.workshop.dcoLabel}</span>
                  </label>
                  <button
                    type="submit"
                    disabled={!dcoAgreed || !newTitle.trim()}
                    className="frontier-button px-4 py-1.5 rounded text-xs font-semibold disabled:opacity-40 text-amber-300"
                  >
                    {tData.workshop.submitBtn}
                  </button>
                </div>
              </form>

              {/* Proposals List */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  {tData.workshop.consultationHeader}
                </h3>
                {proposals.map(p => (
                  <div key={p.id} className="p-4 bg-stone-900/60 border border-stone-800/80 rounded-lg flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-100">{p.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/40 text-amber-300">
                          {p.category}
                        </span>
                        {p.status === 'approved' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/40 text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {tData.workshop.promotedProject}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400">{p.desc}</p>
                      <div className="text-[11px] text-stone-500 pt-1">
                        {tData.workshop.author} <span className="text-stone-300">{p.author}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleVote(p.id, true)}
                        className="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-emerald-400 flex items-center gap-1 text-xs transition"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> {p.votesUp}
                      </button>
                      <button
                        onClick={() => handleVote(p.id, false)}
                        className="px-2.5 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-red-400 flex items-center gap-1 text-xs transition"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" /> {p.votesDown}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/30 border border-amber-700/30 rounded text-xs text-amber-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  {tData.workshop.independenceNotice}
                </span>
              </div>

              <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-100">
                    {lang === 'ro' ? 'STP-PRJ-01: Modernizare Puzzle Apeduct Izometric' : 'STP-PRJ-01: Isometric Aqueduct Puzzle Upgrade'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-950 border border-sky-800/50 text-sky-300">
                    {tData.workshop.inTesting}
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  {lang === 'ro' 
                    ? 'Implementarea conductelor cu racord curbat și debit dinamic conform specificației arhitecturale.'
                    : 'Implementation of curved conduit connectors and dynamic flow per architectural specification.'}
                </p>
                <div className="text-[11px] text-stone-500 flex items-center justify-between pt-2 border-t border-stone-800">
                  <span>{tData.workshop.assigned} <strong className="text-stone-300">dev_comunitar_01</strong></span>
                  <span>{tData.workshop.reviewer} <strong className="text-stone-300">arhitect_independent</strong></span>
                  <span className="text-amber-400 font-semibold">+150 {tData.workshop.pointsAtDelivery}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'merit' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-400">
                {tData.workshop.meritDesc}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400">
                      <th className="py-2">{tData.workshop.thContributor}</th>
                      <th className="py-2">{tData.workshop.thWork}</th>
                      <th className="py-2">{tData.workshop.thPoints}</th>
                      <th className="py-2">{tData.workshop.thWeight}</th>
                      <th className="py-2">{tData.workshop.thDco}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900">
                    <tr>
                      <td className="py-2 font-medium text-stone-200">dev_comunitar_01</td>
                      <td className="py-2 text-stone-400">{lang === 'ro' ? 'Puzzle Apeduct + Teste determinism' : 'Aqueduct Puzzle + Determinism tests'}</td>
                      <td className="py-2 text-amber-300 font-bold">150</td>
                      <td className="py-2 text-emerald-400 font-mono">5.0% ({tData.workshop.maxCap})</td>
                      <td className="py-2 text-stone-400">{tData.workshop.signedDigital}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-stone-200">arhitect_civic_02</td>
                      <td className="py-2 text-stone-400">{lang === 'ro' ? 'Sistem Contestații & Apeluri' : 'Appeals & Contestations System'}</td>
                      <td className="py-2 text-amber-300 font-bold">120</td>
                      <td className="py-2 text-emerald-400 font-mono">5.0% ({tData.workshop.maxCap})</td>
                      <td className="py-2 text-stone-400">{tData.workshop.signedDigital}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-stone-200">designer_lore_03</td>
                      <td className="py-2 text-stone-400">{lang === 'ro' ? 'Ghidul Pionierului 5 Pași' : '5-Step Pioneer Guide'}</td>
                      <td className="py-2 text-amber-300 font-bold">80</td>
                      <td className="py-2 text-emerald-400 font-mono">4.2%</td>
                      <td className="py-2 text-stone-400">{tData.workshop.signedDigital}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-900/40 flex items-center justify-between text-xs text-stone-400">
          <span>{tData.workshop.footerAutonomy}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition font-medium"
          >
            {tData.workshop.closeWorkshop}
          </button>
        </div>

      </div>
    </div>
  );
};
