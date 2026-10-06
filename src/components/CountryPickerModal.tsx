import React, { useState, useMemo } from 'react';
import { X, Search, Globe, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { COUNTRIES } from '../data/countries';
import { Country, LineType } from '../types';
import { useVirtualNumber } from '../context/VirtualNumberContext';

interface CountryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CountryPickerModal: React.FC<CountryPickerModalProps> = ({ isOpen, onClose }) => {
  const { createNewNumber, selectedService, setSelectedService, lang } = useVirtualNumber();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedLineType, setSelectedLineType] = useState<LineType>('Mobile SIM');

  const regions = ['All', 'Asia', 'Europe', 'North America', 'Middle East', 'Latin America', 'Oceania'];

  const services = [
    { id: 'WhatsApp', label: 'WhatsApp', icon: '💬', color: 'text-emerald-400' },
    { id: 'Telegram', label: 'Telegram', icon: '✈️', color: 'text-sky-400' },
    { id: 'Google', label: 'Google / Gmail', icon: '🔍', color: 'text-amber-400' },
    { id: 'TikTok', label: 'TikTok', icon: '🎵', color: 'text-pink-400' },
    { id: 'Instagram', label: 'Instagram', icon: '📸', color: 'text-rose-400' },
    { id: 'Bank', label: 'Banking / 2FA', icon: '🏦', color: 'text-indigo-400' },
    { id: 'Custom', label: 'Any Other Service', icon: '🌐', color: 'text-slate-300' },
  ];

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(country => {
      const matchesSearch =
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.dialCode.includes(searchQuery) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (country.nameUrdu && country.nameUrdu.includes(searchQuery));

      const matchesRegion = selectedRegion === 'All' || country.region === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegion]);

  if (!isOpen) return null;

  const handleSelectCountry = (country: Country) => {
    createNewNumber(country.code, selectedLineType, selectedService);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              {lang === 'ur' ? 'Country Select Karein (Digital Number)' : 'Select Country for Digital Number'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'ur'
                ? 'Kese bhi mulk ka number banayein aur WhatsApp, Google ya OTP ke liye use karein'
                : 'Instantly allocate a virtual number for SMS & OTP activation in 30+ countries'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Service Picker */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            {lang === 'ur' ? '1. Kese Service Ke Liye Number Chahiye?' : '1. Target Verification Service'}
          </div>
          <div className="flex flex-wrap gap-2">
            {services.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedService(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  selectedService === s.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Line Type Selector */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {lang === 'ur' ? 'Line Type:' : 'Carrier Line Type:'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedLineType('Mobile SIM')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedLineType === 'Mobile SIM'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📱 Mobile SIM (Best for WhatsApp)
              </button>
              <button
                onClick={() => setSelectedLineType('VoIP DID')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedLineType === 'VoIP DID'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ☁️ VoIP DID (Standard)
              </button>
            </div>
          </div>
        </div>

        {/* Search & Region Filter */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'ur' ? 'Country ka naam ya code talash karein (e.g. Philippines, +1, Pakistan)...' : 'Search country name, dial code, or region...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              autoFocus
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {regions.map(reg => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
                  selectedRegion === reg
                    ? 'bg-slate-700 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Countries Grid/List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredCountries.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              {lang === 'ur' ? 'Koi country nahi mila' : 'No country found matching query'}
            </div>
          ) : (
            filteredCountries.map(c => (
              <div
                key={c.code}
                onClick={() => handleSelectCountry(c)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-850/60 hover:bg-slate-800 border border-slate-800/80 hover:border-blue-500/50 transition-all cursor-pointer group text-left"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl leading-none" role="img" aria-label={c.name}>
                    {c.flag}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors text-sm">
                        {c.name}
                      </span>
                      {c.nameUrdu && lang === 'ur' && (
                        <span className="text-xs text-slate-400 font-sans">{c.nameUrdu}</span>
                      )}
                      <span className="font-mono text-xs text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {c.dialCode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{c.primaryCarriers[0]}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-medium">
                        {c.otpSuccessRate}% OTP Delivery
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 font-medium group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {lang === 'ur' ? 'Number Banayein' : 'Get Number'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {lang === 'ur' ? 'Har number 20 minutes ke liye active rehta hai' : 'Each digital number stays active for 20 minutes to receive OTPs'}
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            {filteredCountries.length} countries ready
          </span>
        </div>
      </div>
    </div>
  );
};
