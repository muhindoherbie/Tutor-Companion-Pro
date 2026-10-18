import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PlaceholderScreenProps {
  icon: LucideIcon;
  title: string;
  phase: string;
  description: string;
  action?: React.ReactNode;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  icon: Icon,
  title,
  phase,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center px-4 py-12">
      <div className="w-16 h-16 rounded-2xl bg-[#00696f]/10 text-[#00696f] flex items-center justify-center mb-5 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
      <div className="mt-2.5">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#d2ecee] text-[#004d52]">
          {phase}
        </span>
      </div>
      <p className="mt-4 text-slate-600 text-sm leading-relaxed max-w-md">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
