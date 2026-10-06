/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { VirtualNumberProvider, useVirtualNumber } from './context/VirtualNumberContext';
import { ReceivedSmsCard } from './components/ReceivedSmsCard';
import {
  Copy,
  Check,
  Send,
  Sparkles,
  Smartphone,
  Globe,
  RefreshCw,
  ArrowDown,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { COUNTRIES } from './data/countries';

function MainApp() {
  const {
    activeNumber,
    messages,
    createNewNumber,
    simulateIncomingSms,
    copyToClipboard,
    copiedNotification,
    selectedService,
    setSelectedService,
    lang,
    setLang,
  } = useVirtualNumber();

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('PH');
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Quick 1-tap popular countries
  const popularCountries = [
    { code: 'PH', label: 'Philippines', flag: '🇵🇭', dial: '+63' },
    { code: 'PK', label: 'Pakistan', flag: '🇵🇰', dial: '+92' },
    { code: 'US', label: 'United States', flag: '🇺🇸', dial: '+1' },
    { code: 'GB', label: 'United Kingdom', flag: '🇬🇧', dial: '+44' },
    { code: 'AE', label: 'UAE', flag: '🇦🇪', dial: '+971' },
    { code: 'SA', label: 'Saudi Arabia', flag: '🇸🇦', dial: '+966' },
    { code: 'CA', label: 'Canada', flag: '🇨🇦', dial: '+1' },
    { code: 'DE', label: 'Germany', flag: '🇩🇪', dial: '+49' },
  ];

  const services = [
    { id: 'WhatsApp', label: 'WhatsApp', icon: '💬' },
    { id: 'Telegram', label: 'Telegram', icon: '✈️' },
    { id: 'Google', label: 'Google', icon: '🔍' },
    { id: 'TikTok', label: 'TikTok', icon: '🎵' },
    { id: 'Facebook', label: 'Facebook', icon: '👥' },
    { id: 'Instagram', label: 'Instagram', icon: '📸' },
  ];

  // PRIMARY WAZIH ACTION: Create Number & Send Code in 1 Click!
  const handleCreateAndSendCode = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Creates new number AND automatically generates/sends the verification SMS code!
      createNewNumber(selectedCountryCode, 'Mobile SIM', selectedService, true);
      setIsGenerating(false);

      // Smooth scroll to card
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }, 350);
  };

  // Re-send / New Code for current active number
  const handleResendCode = () => {
    simulateIncomingSms({
      senderService: selectedService as any,
    });
  };

  const selectedCountryObj = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];
  const latestMessage = messages[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white pb-16">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-150">
          <Check className="w-5 h-5 text-white" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              CloudNumber
            </span>
            <span className="hidden sm:inline-block text-xs bg-blue-600/20 text-blue-400 font-bold px-2 py-0.5 rounded-md border border-blue-500/30">
              OTP SIM
            </span>
          </div>

          <button
            onClick={() => setLang(lang === 'ur' ? 'en' : 'ur')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'ur' ? 'اردو / Roman' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* BOX 1: WAZIH CREATE PANEL (Country Select + Big Clear Button) */}
        <section className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-6 h-6 text-blue-400" />
              {lang === 'ur'
                ? 'Digital Number Banayein & OTP Code Hasil Karein'
                : 'Create Digital Number & Get Verification Code'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {lang === 'ur'
                ? 'Country chunein aur bada button dabayein, number aur code foran tayar ho jayega'
                : 'Select your country and press the button to immediately generate your number and OTP'}
            </p>
          </div>

          {/* 1. Country Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              {lang === 'ur' ? '1. Mulk (Country) Select Karein:' : '1. Select Country:'}
            </label>

            {/* Quick 1-Tap Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {popularCountries.map(c => {
                const isSelected = selectedCountryCode === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedCountryCode(c.code)}
                    className={`p-2.5 rounded-xl font-medium text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-md scale-[1.02]'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl leading-none">{c.flag}</span>
                    <div className="text-left truncate leading-tight">
                      <p className="truncate">{c.label}</p>
                      <span className={`text-[11px] font-mono ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {c.dial}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* All countries dropdown */}
            <div className="pt-1">
              <select
                value={selectedCountryCode}
                onChange={e => setSelectedCountryCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-medium focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.dialCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Service Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              {lang === 'ur' ? '2. Kis App Ke Liye Number Chahiye:' : '2. Target App / Service:'}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {services.map(s => {
                const isSelected = selectedService.toLowerCase() === s.id.toLowerCase();
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedService(s.id)}
                    className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. THE BIG WAZIH CREATE & SEND BUTTON */}
          <div className="pt-3">
            <button
              type="button"
              onClick={handleCreateAndSendCode}
              disabled={isGenerating}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              <Send className="w-6 h-6 animate-pulse" />
              <span>
                {isGenerating
                  ? (lang === 'ur' ? 'Number & Code Tayar Ho Raha Hai...' : 'Generating Number & Code...')
                  : (lang === 'ur'
                      ? `👉 ${selectedCountryObj.name} Ka Number Banayein Aur Code Send Karein`
                      : `👉 Create ${selectedCountryObj.name} Number & Send Code`)}
              </span>
            </button>
          </div>
        </section>

        {/* Visual Down Arrow indicator */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
          <ArrowDown className="w-4 h-4 animate-bounce" />
          <span>
            {lang === 'ur' ? 'Aapka Digital Number Aur Code Niche Dekhein' : 'Your Digital Number & Code Below'}
          </span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>

        {/* BOX 2: THE EXACT VERIFICATION CARD (MATCHING USER SCREENSHOT) */}
        <div ref={cardRef} className="space-y-4">
          {activeNumber && latestMessage ? (
            <div className="space-y-4">
              {/* Exact Card matching reference image */}
              <ReceivedSmsCard
                message={latestMessage}
                number={activeNumber}
                onGetNewCode={handleResendCode}
              />

              {/* WAZIH ACTION BUTTONS DIRECTLY BELOW CARD */}
              <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Button 1: Copy Code */}
                {latestMessage.otpCode && (
                  <button
                    onClick={() =>
                      copyToClipboard(
                        latestMessage.otpCode!,
                        lang === 'ur' ? 'Code Copy Ho Gaya!' : 'Code Copied!'
                      )
                    }
                    className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Check className="w-5 h-5" />
                    <span>{lang === 'ur' ? 'Code Copy Karein' : 'Copy OTP Code'}</span>
                  </button>
                )}

                {/* Button 2: Resend / New Code */}
                <button
                  onClick={handleResendCode}
                  className="py-3.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{lang === 'ur' ? 'Naya Code Send Karein' : 'Send New Code'}</span>
                </button>
              </div>

              {/* Full copy number button */}
              <div className="max-w-md mx-auto">
                <button
                  onClick={() =>
                    copyToClipboard(
                      activeNumber.formattedNumber,
                      lang === 'ur' ? 'Number Copy Ho Gaya!' : 'Phone Number Copied!'
                    )
                  }
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl text-xs border border-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'ur'
                      ? `Phone Number (${activeNumber.formattedNumber}) Copy Karein`
                      : `Copy Phone Number (${activeNumber.formattedNumber})`}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-md mx-auto">
              <Smartphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-300 font-semibold">
                {lang === 'ur'
                  ? 'Ooper "Number Banayein & Code Send Karein" button dabayein'
                  : 'Click the button above to create number & receive code'}
              </p>
            </div>
          )}
        </div>

        {/* 3-Step Simple Explanation */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 max-w-md mx-auto text-xs text-slate-400 space-y-2">
          <p className="font-bold text-slate-200">
            {lang === 'ur' ? '💡 Asaan Tareeqa:' : '💡 Simple Steps:'}
          </p>
          <p>
            1. <strong>Country select karein</strong> (Philippines, Pakistan, USA, etc.)
          </p>
          <p>
            2. <strong>Bada Blue Button dabayein</strong>: Number banega aur code send ho jayega.
          </p>
          <p>
            3. Card me <strong>Code (431963)</strong> aate hi <strong>"Copy code"</strong> dabayein aur apni app me verify karein!
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 pt-6">
        <p>CloudNumber · Instant Digital Numbers & OTP Verification</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <VirtualNumberProvider>
      <MainApp />
    </VirtualNumberProvider>
  );
}
