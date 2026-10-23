import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  MapPin, 
  Hammer, 
  Droplets, 
  Coins, 
  Landmark, 
  ShieldCheck 
} from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
  onOpenPuzzle?: () => void;
  onOpenGovernance?: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  onClose,
  onOpenPuzzle,
  onOpenGovernance
}) => {
  const [step, setStep] = useState<number>(0);

  const steps = [
    {
      title: '1. Bun venit în STUPUL — Avanpostul de Frontieră',
      badge: 'Începutul Civilizației',
      icon: <MapPin className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="space-y-2 text-stone-300 leading-relaxed">
          <p>
            Ai preluat conducerea unei mici așezări de pionieri pe malul unui râu sălbatic. Comunitatea inițială numără <strong>100 de cetățeni simulați</strong>.
          </p>
          <p>
            Orașul evoluează pe 4 trepte istorice: de la <em>Avanpost de Frontieră</em>, la <em>Așezare Vestul Sălbatic</em>, <em>Târg în Creștere</em> și în final <em>Civilizație Prosperă</em>.
          </p>
          <div className="bg-amber-950/40 p-2.5 rounded border border-amber-700/30 text-amber-200 text-xs mt-2">
            💡 <strong>Sfat:</strong> Folosește rotița mouse-ului sau butoanele <strong>+ / -</strong> pentru a mări harta și trage cu mouse-ul pentru a naviga pe cele 16x16 parcele.
          </div>
        </div>
      )
    },
    {
      title: '2. Construcția și Nevoile Cetățenilor',
      badge: 'Economie & Resurse',
      icon: <Hammer className="w-8 h-8 text-orange-400" />,
      content: (
        <div className="space-y-2 text-stone-300 leading-relaxed">
          <p>
            Populația are 5 nevoi fundamentale: <strong>Hrană</strong>, <strong>Adăpost</strong>, <strong>Apă</strong>, <strong>Siguranță</strong> și <strong>Educație</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Casele de Lemn:</strong> Oferă adăpost pentru 25 de oameni per nivel.</li>
            <li><strong>Fermele Comunitare:</strong> Produc grâu și alimente pentru a preveni foametea.</li>
            <li><strong>Puțurile de Apă:</strong> Asigură aprovizionarea cu apă potabilă a parcelelor învecinate.</li>
            <li><strong>Atelierele & Hambarele:</strong> Generează materiale de construcție și extind depozitele.</li>
          </ul>
          <div className="bg-stone-950 p-2.5 rounded border border-stone-800 text-xs">
            Alege orice clădire din <strong>Bara de Jos</strong> și fă clic pe o parcelă liberă pentru a construi!
          </div>
        </div>
      )
    },
    {
      title: '3. Infrastructura & Mini-Puzzle-ul Apeductului',
      badge: 'Utilități Vitale',
      icon: <Droplets className="w-8 h-8 text-sky-400" />,
      content: (
        <div className="space-y-2 text-stone-300 leading-relaxed">
          <p>
            Apa este resursa vitală a oricărei civilizații. În joc ai la dispoziție un <strong>puzzle interactiv 4x4 de apeduct</strong>.
          </p>
          <p>
            Apasă pe butonul albastru <strong>Apeduct</strong> din bara de sus, rotește segmentele de conductă până când apa curge de la izvor la bazinul orașului.
          </p>
          <div className="bg-sky-950/60 p-2.5 rounded border border-sky-600/40 text-sky-200 text-xs font-semibold">
            🎉 Recompensă la conectare: +50 Credite Virtuale, +30 Materiale și un bonus permanent de +30% producție la toate fermele!
          </div>
        </div>
      )
    },
    {
      title: '4. Muncă și Moneda Virtuală (V-Credits)',
      badge: 'Activitate Civică',
      icon: <Coins className="w-8 h-8 text-yellow-400" />,
      content: (
        <div className="space-y-2 text-stone-300 leading-relaxed">
          <p>
            În STUPUL nu există bani reali sau token-uri speculative. Moneda este <strong>100% virtuală (V-Credits)</strong>, câștigată exclusiv prin merite și muncă în joc.
          </p>
          <p>
            Deschide meniul <strong>Muncă</strong> din bara de sus pentru a efectua activități economice (tăiat lemne, agricultură, carieră de piatră, serviciu public la primărie).
          </p>
          <p>
            Cu creditele adunate poți cumpăra parcele neocupate și le poți dezvolta în cartiere moderne!
          </p>
        </div>
      )
    },
    {
      title: '5. Guvernanță Democratică — Invarianta GENESIS',
      badge: '1 Om = 1 Vot',
      icon: <Landmark className="w-8 h-8 text-amber-300" />,
      content: (
        <div className="space-y-2 text-stone-300 leading-relaxed">
          <p>
            Principiul fondator suprem: <strong>Nimeni nu poate cumpăra putere politică</strong>. Averea în joc, parcelele deținute sau cota de acțiuni în firma comercială oferă <strong>exact 0 voturi în plus</strong>.
          </p>
          <p>
            Sistemul este <strong>Bicameral</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Camera Cetățenilor:</strong> 1 om = 1 vot egal pentru politicile și viața orașului.</li>
            <li><strong>Camera Contributorilor:</strong> Vot bazat pe reputație din lucrări verificate, cu plafon strict de 5% și decay la 45/90 de zile.</li>
          </ul>
          <div className="bg-emerald-950/50 p-2.5 rounded border border-emerald-600/40 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>Totul rulează 100% offline în mod oaspete, fără cont obligatoriu și fără urmărire de date!</span>
          </div>
        </div>
      )
    }
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="frontier-panel w-full max-w-xl rounded-xl shadow-2xl flex flex-col overflow-hidden border border-amber-600/50 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/40 bg-stone-950/80">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="font-title text-base font-bold text-amber-200">
              Ghidul Pionierului STUPUL
            </span>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-100 p-1.5 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
            <div className="p-2.5 bg-stone-950 rounded-xl border border-amber-800/40 shadow-inner">
              {current.icon}
            </div>
            <div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 border border-amber-600/40 text-amber-300 font-semibold uppercase tracking-wider">
                {current.badge}
              </span>
              <h3 className="font-title text-base font-bold text-stone-100 mt-1">
                {current.title}
              </h3>
            </div>
          </div>

          <div className="pt-1 text-sm">
            {current.content}
          </div>
        </div>

        {/* Progress Dots & Navigation */}
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-950/70 flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  step === i ? 'bg-amber-400 w-5' : 'bg-stone-700 hover:bg-stone-500'
                }`}
                title={`Pasul ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="frontier-button px-3 py-1.5 rounded font-semibold text-stone-300 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Înapoi
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="frontier-button px-4 py-1.5 rounded font-bold text-amber-300 flex items-center gap-1"
              >
                Următorul <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="frontier-button px-5 py-1.5 rounded font-bold bg-amber-600 text-stone-900 border-amber-300 flex items-center gap-1.5 shadow-lg"
              >
                <CheckCircle className="w-4 h-4" /> Începe Jocul!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
