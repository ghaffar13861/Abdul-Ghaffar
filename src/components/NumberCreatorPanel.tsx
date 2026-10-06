import React, { useState } from 'react';
import { Sparkles, Globe, ArrowRight, Smartphone, Check, ChevronDown } from 'lucide-react';
import { COUNTRIES } from '../data/countries';
import { Country } from '../types';
import { useVirtualNumber } from '../context/VirtualNumberContext';

interface NumberCreatorPanelProps {
  onNumberCreated?: () => void;
}

export const NumberCreatorPanel: React.FC<NumberCreatorPanelProps> = ({ onNumberCreated }) => {
  const { createNewNumber, selectedService, setSelectedService, lang } = useVirtualNumber();

  // Top popular countries ready with 1 tap
  const popularCountryCodes = ['PH', 'US', 'GB', 'PK', 'AE', 'CA', 'SA', 'DE', 'TR'];
  const popularCountries = COUNTRIES.filter(c => popularCountryCodes.includes(c.code));

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('PH');
  const [showAllCountries, setShowAllCountries] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const services = [
    { id: 'WhatsApp', label: 'WhatsApp', icon: '💬', color: 'hover:border-emerald-500' },
    { id: 'Telegram', label: 'Telegram', icon: '✈️', color: 'hover:border-sky-500' },
    { id: 'Google', label: 'Google', icon: '🔍', color: 'hover:border-amber-500' },
    { id: 'TikTok', label: 'TikTok', icon: '🎵', color: 'hover:border-pink-500' },
    { id: 'Facebook', label: 'Facebook', icon: '👥', color: 'hover:border-blue-500' },
    { id: 'Instagram', label: 'Instagram', icon: '📸', color: 'hover:border-rose-500' },
    { id: 'Any App', label: 'Any App', icon: '🌐', color: 'hover:border-slate-500' },
  ];

  const handleCreate = () => {
    createNewNumber(selectedCountryCode, 'Mobile SIM', selectedService);
    if (onNumberCreated) {
      onNumberCreated();
    }
  };

  const filteredAllCountries = COUNTRIES.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery) ||
      (c.nameUrdu && c.nameUrdu.includes(searchQuery))
  );

  const selectedCountry = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl max-w-xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          {lang === 'ur' ? 'Naya Digital Number Banayein' : 'Create New Digital Number'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {lang === 'ur'
            ? 'Country aur app select karein aur aik click me digital number hasil karein'
            : 'Select country and application to get a fresh virtual verification number'}
        </p>
      </div>

      {/* Step 1: Choose Country */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <span>{lang === 'ur' ? '1. Country Select Karein' : '1. Select Country'}</span>
          <button
            type="button"
            onClick={() => setShowAllCountries(!showAllCountries)}
            className="text-blue-400 hover:text-blue-300 normal-case font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>{showAllCountries ? (lang === 'ur' ? 'Mukhtasar List' : 'Show Popular') : (lang === 'ur' ? 'Tamam Mulk Dekhein (30+)' : 'View All Countries (30+)')}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllCountries ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Quick Country Buttons */}
        {!showAllCountries ? (
          <div className="grid grid-cols-3 gap-2">
            {popularCountries.map(c => {
              const isSelected = selectedCountryCode === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedCountryCode(c.code)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl leading-none">{c.flag}</span>
                  <div className="truncate">
                    <p className="text-xs font-semibold truncate leading-tight">{c.name}</p>
                    <p className={`text-[11px] font-mono leading-tight ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {c.dialCode}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <input
              type="text"
              placeholder={lang === 'ur' ? 'Mulk talash karein...' : 'Search country name or code...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {filteredAllCountries.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setSelectedCountryCode(c.code);
                    setShowAllCountries(false);
                  }}
                  className={`w-full p-2 rounded-lg flex items-center justify-between text-xs cursor-pointer ${
                    selectedCountryCode === c.code
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-850 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.flag}</span>
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <span className="font-mono text-slate-400">{c.dialCode}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Choose Service */}
      <div className="space-y-2.5">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {lang === 'ur' ? '2. Verification Service (Kis App Ke Liye Chahiye)' : '2. Target Service / App'}
        </label>
        <div className="flex flex-wrap gap-2">
          {services.map(s => {
            const isSelected = selectedService.toLowerCase() === s.id.toLowerCase();
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedService(s.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Big Create Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleCreate}
          className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer"
        >
          <Smartphone className="w-5 h-5" />
          <span>
            {lang === 'ur'
              ? `${selectedCountry.name} (${selectedCountry.dialCode}) Ka Naya Number Banayein`
              : `Create ${selectedCountry.name} (${selectedCountry.dialCode}) Number`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
