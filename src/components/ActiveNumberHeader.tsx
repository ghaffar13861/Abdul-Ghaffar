import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, Radio, Plus, Send, Trash2, Shield, RefreshCw } from 'lucide-react';
import { useVirtualNumber } from '../context/VirtualNumberContext';
import { COUNTRIES } from '../data/countries';

interface ActiveNumberHeaderProps {
  onOpenCountryPicker: () => void;
  onOpenSimulator: () => void;
}

export const ActiveNumberHeader: React.FC<ActiveNumberHeaderProps> = ({
  onOpenCountryPicker,
  onOpenSimulator,
}) => {
  const {
    activeNumber,
    copyToClipboard,
    removeNumber,
    selectedService,
    lang,
  } = useVirtualNumber();

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('18:45');

  useEffect(() => {
    if (!activeNumber) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const expires = new Date(activeNumber.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));

      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeNumber]);

  if (!activeNumber) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl mx-auto">
        <Radio className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-200">
          {lang === 'ur' ? 'Koi Digital Number Active Nahi Hai' : 'No Active Digital Number'}
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          {lang === 'ur'
            ? 'Kese bhi country ka number generate karein taake OTP verification ke liye use kar sakein.'
            : 'Select any country to allocate a digital virtual number ready for verification.'}
        </p>
        <button
          onClick={onOpenCountryPicker}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          {lang === 'ur' ? 'New Digital Number Banayein' : 'Allocate Virtual Number'}
        </button>
      </div>
    );
  }

  const country = COUNTRIES.find(c => c.code === activeNumber.countryCode);

  const handleCopy = async () => {
    await copyToClipboard(
      activeNumber.formattedNumber,
      lang === 'ur' ? 'Phone Number Copy Ho Gaya!' : 'Phone Number Copied!'
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl max-w-xl mx-auto backdrop-blur-xs">
      {/* Top status bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-emerald-400">
            {lang === 'ur' ? 'Active & Ready for OTP' : 'Carrier Signal Active'}
          </span>
          <span>·</span>
          <span>{activeNumber.carrier}</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Main Number Display */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="text-base leading-none">{country?.flag || '🌐'}</span>
            <span className="font-medium text-slate-300">{country?.name || activeNumber.countryName}</span>
            <span>·</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium text-slate-300">
              {activeNumber.lineType}
            </span>
            <span>·</span>
            <span className="text-blue-400 font-medium">For {selectedService}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight select-all">
              {activeNumber.formattedNumber}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all focus-visible:outline-2 focus-visible:outline-blue-500"
              title={lang === 'ur' ? 'Number Copy Karein' : 'Copy Number'}
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex sm:flex-col gap-2 shrink-0">
          <button
            onClick={onOpenSimulator}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{lang === 'ur' ? 'Test OTP Bhejein' : 'Test OTP Simulator'}</span>
          </button>

          <button
            onClick={onOpenCountryPicker}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-medium border border-slate-750 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{lang === 'ur' ? 'Dusra Mulk' : 'Change Country'}</span>
          </button>
        </div>
      </div>

      {/* Helper explanation bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px]">
          {lang === 'ur'
            ? '💡 Ye number kisi bhi app me copy-paste karein aur OTP aane par niche check karein'
            : '💡 Enter this number in any verification form and watch for incoming SMS below'}
        </span>
        <button
          onClick={() => removeNumber(activeNumber.id)}
          className="text-slate-500 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
          title="Release number"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{lang === 'ur' ? 'Release' : 'Release'}</span>
        </button>
      </div>
    </div>
  );
};
