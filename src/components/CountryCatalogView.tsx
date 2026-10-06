import React, { useState, useMemo } from 'react';
import { Search, Globe, Plus, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { COUNTRIES } from '../data/countries';
import { Country, LineType } from '../types';
import { useVirtualNumber } from '../context/VirtualNumberContext';

interface CountryCatalogViewProps {
  onSelectCountry: (country: Country) => void;
}

export const CountryCatalogView: React.FC<CountryCatalogViewProps> = ({ onSelectCountry }) => {
  const { lang, selectedService, setSelectedService } = useVirtualNumber();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const regions = ['All', 'Asia', 'Europe', 'North America', 'Middle East', 'Latin America', 'Oceania'];

  const services = ['WhatsApp', 'Telegram', 'Google', 'TikTok', 'Instagram', 'Bank', 'Custom'];

  const filtered = useMemo(() => {
    return COUNTRIES.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.nameUrdu && c.nameUrdu.includes(q));

      const matchesRegion = selectedRegion === 'All' || c.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegion]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Intro */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {lang === 'ur' ? 'International Virtual Numbers Catalog' : 'Global Digital Numbers Catalog'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
          {lang === 'ur'
            ? 'Philippines, USA, UK, Pakistan aur 30+ countries me se kisi bhi country ka number select karein.'
            : 'Explore virtual numbers with instant SMS OTP capabilities across 30+ global carrier networks.'}
        </p>
      </div>

      {/* Target Service Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {lang === 'ur' ? 'App / Service:' : 'Select Target App:'}
        </span>
        <div className="flex flex-wrap gap-2">
          {services.map(s => (
            <button
              key={s}
              onClick={() => setSelectedService(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedService === s
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={lang === 'ur' ? 'Search country name, dial code (+63, +1, +44, +92)...' : 'Search country name, code or region...'}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-3 py-2 rounded-xl text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                selectedRegion === r
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Country Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map(country => (
          <div
            key={country.code}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 hover:border-blue-500/60 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none" role="img" aria-label={country.name}>
                    {country.flag}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                      {country.name}
                    </h4>
                    <span className="font-mono text-xs text-blue-400 font-medium">
                      {country.dialCode}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                  {country.otpSuccessRate}% OTP
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span className="text-slate-300 font-medium truncate max-w-[150px]">
                    {country.primaryCarriers[0]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Types:</span>
                  <span className="text-slate-300">
                    {country.supportedLineTypes.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <button
                onClick={() => onSelectCountry(country)}
                className="w-full py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {lang === 'ur' ? `Number Create Karein (${country.dialCode})` : `Allocate ${country.name} Number`}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
