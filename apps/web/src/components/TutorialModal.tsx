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
import { useLanguage } from '../i18n/LanguageContext.js';

interface TutorialModalProps {
  onClose: () => void;
  onStart?: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  onClose,
  onStart
}) => {
  const { tData } = useLanguage();
  const [step, setStep] = useState<number>(0);

  const steps = [
    {
      title: tData.tutorial.step1Title,
      badge: tData.tutorial.step1Badge,
      icon: <MapPin className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="space-y-2 text-stone-300 leading-relaxed">
          <p>{tData.tutorial.step1P1}</p>
          <p>{tData.tutorial.step1P2}</p>
          <div className="bg-amber-950/40 p-2.5 rounded border border-amber-700/30 text-amber-200 text-xs mt-2">
            {tData.tutorial.step1Tip}
          </div>
        </div>
      )
    },
    {
      title: tData.tutorial.step2Title,
      badge: tData.tutorial.step2Badge,
      icon: <Hammer className="w-8 h-8 text-orange-400" />,
      content: (
        <div className="space-y-2 text-stone-300 leading-relaxed">
          <p>{tData.tutorial.step2P1}</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>{tData.tutorial.step2House}</li>
            <li>{tData.tutorial.step2Farm}</li>
            <li>{tData.tutorial.step2Well}</li>
            <li>{tData.tutorial.step2Barn}</li>
          </ul>
          <div className="bg-stone-950 p-2.5 rounded border border-stone-800 text-xs">
            {tData.tutorial.step2Tip}
          </div>
        </div>
      )
    },
    {
      title: tData.tutorial.step3Title,
      badge: tData.tutorial.step3Badge,
      icon: <Droplets className="w-8 h-8 text-sky-400" />,
      content: (
        <div className="space-y-2 text-stone-300 leading-relaxed">
          <p>{tData.tutorial.step3P1}</p>
          <p>{tData.tutorial.step3P2}</p>
          <div className="bg-sky-950/60 p-2.5 rounded border border-sky-600/40 text-sky-200 text-xs font-semibold">
            {tData.tutorial.step3Reward}
          </div>
        </div>
      )
    },
    {
      title: tData.tutorial.step4Title,
      badge: tData.tutorial.step4Badge,
      icon: <Coins className="w-8 h-8 text-yellow-400" />,
      content: (
        <div className="space-y-2 text-stone-300 leading-relaxed">
          <p>{tData.tutorial.step4P1}</p>
          <p>{tData.tutorial.step4P2}</p>
          <p>{tData.tutorial.step4P3}</p>
        </div>
      )
    },
    {
      title: tData.tutorial.step5Title,
      badge: tData.tutorial.step5Badge,
      icon: <Landmark className="w-8 h-8 text-amber-300" />,
      content: (
        <div className="space-y-2 text-stone-300 leading-relaxed">
          <p>{tData.tutorial.step5P1}</p>
          <p>{tData.tutorial.step5P2}</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>{tData.tutorial.step5Chamber1}</li>
            <li>{tData.tutorial.step5Chamber2}</li>
          </ul>
          <div className="bg-emerald-950/50 p-2.5 rounded border border-emerald-600/40 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>{tData.tutorial.step5Disclaimer}</span>
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
              {tData.tutorial.modalTitle}
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
                <ArrowLeft className="w-3.5 h-3.5" /> {tData.tutorial.prev}
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="frontier-button px-4 py-1.5 rounded font-bold text-amber-300 flex items-center gap-1"
              >
                {tData.tutorial.next} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => { onStart?.(); onClose(); }}
                className="frontier-button px-5 py-1.5 rounded font-bold bg-amber-600 text-stone-900 border-amber-300 flex items-center gap-1.5 shadow-lg"
              >
                <CheckCircle className="w-4 h-4" /> {tData.tutorial.start}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
