import React from 'react';
import { Plus, Globe, Sparkles } from 'lucide-react';
import { useVirtualNumber } from '../context/VirtualNumberContext';

interface HeaderProps {
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateModal }) => {
  const { lang, setLang } = useVirtualNumber();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          onClick={e => e.preventDefault()}
          className="text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span>CloudNumber</span>
        </a>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-300">
          <span className="text-white font-semibold">
            {lang === 'ur' ? 'Digital Numbers & OTP' : 'Digital Numbers & OTP'}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-400 text-xs flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {lang === 'ur' ? 'SMS Ready' : 'Live Carrier Online'}
          </span>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Language Switch */}
          <button
            onClick={() => setLang(lang === 'ur' ? 'en' : 'ur')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            title="Language"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'ur' ? 'اردو / Roman' : 'English'}</span>
          </button>

          {/* Create Button */}
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ur' ? '+ Naya Number' : '+ New Number'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
