/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { VirtualNumberProvider, useVirtualNumber } from './context/VirtualNumberContext';
import { ReceivedSmsCard } from './components/ReceivedSmsCard';
import { VerificationStatusAlert } from './components/VerificationStatusAlert';
import { ProviderSimulatorConsole } from './components/ProviderSimulatorConsole';
import {
  Copy,
  Check,
  Send,
  Sparkles,
  Smartphone,
  Globe,
  RefreshCw,
  ArrowDown,
  Info,
  ShieldCheck,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { COUNTRIES } from './data/countries';

function MainApp() {
  const {
    activeNumber,
    activeMessages,
    createNewNumber,
    simulateIncomingSms,
    copyToClipboard,
    copiedNotification,
    selectedService,
    setSelectedService,
    lang,
    setLang,
    verificationState,
    isRateLimited,
    triggerProviderError,
    resetVerificationState,
  } = useVirtualNumber();

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('PH');
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
    { id: 'Google', label: 'Google / 2-Step', icon: '🔍' },
    { id: 'WhatsApp', label: 'WhatsApp', icon: '💬' },
    { id: 'Telegram', label: 'Telegram', icon: '✈️' },
    { id: 'TikTok', label: 'TikTok', icon: '🎵' },
    { id: 'Facebook', label: 'Facebook', icon: '👥' },
    { id: 'Instagram', label: 'Instagram', icon: '📸' },
  ];

  // PRIMARY ACTION: Instantly create number & deliver code
  const handleGenerateNumberAndCode = () => {
    // If rate-limited on the current number, creating a fresh number resets rate-limiting
    createNewNumber(selectedCountryCode, selectedService);

    setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  // Re-generate code for current active number
  const handleResendCode = () => {
    if (isRateLimited) {
      return;
    }
    simulateIncomingSms();
  };

  const selectedCountryObj = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];
  const currentMessage = activeMessages[0];

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
            <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
              Active Online
            </span>
            {verificationState === 'verified' && (
              <span className="text-xs bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                <Check className="w-3.5 h-3.5" /> Verified
              </span>
            )}
            {isRateLimited && (
              <span className="text-xs bg-rose-600 text-white font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Lock className="w-3 h-3" /> Rate Limited
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setLang(lang === 'ur' ? 'en' : 'ur')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'ur' ? 'English' : 'Urdu / اردو'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Verification Status Alert banner (Appears when Google rate limits or throws errors) */}
        <VerificationStatusAlert
          onSelectAnotherNumber={() => {
            handleGenerateNumberAndCode();
          }}
          onRequestNewCode={handleResendCode}
        />

        {/* BOX 1: WAZIH NUMBER & CODE GENERATOR */}
        <section className="bg-slate-900 border-2 border-slate-750 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <span>Digital Number & OTP Verification</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select country and target service to generate a virtual number and test verification responses.
            </p>
          </div>

          {/* 1. Country Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Choose Country:
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
                        ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-lg scale-[1.02]'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl leading-none">{c.flag}</span>
                    <div className="text-left truncate leading-tight">
                      <p className="truncate font-semibold">{c.label}</p>
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
                className="w-full bg-slate-950 border border-slate-750 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-semibold focus:outline-hidden focus:border-blue-500 cursor-pointer"
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
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Target Verification Provider:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {services.map(s => {
                const isSelected = selectedService.toLowerCase() === s.id.toLowerCase();
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedService(s.id)}
                    className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md scale-105'
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

          {/* 3. GENERATE BUTTON */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerateNumberAndCode}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Send className="w-6 h-6 animate-pulse" />
              <span>
                Create {selectedCountryObj.name} Number & Get Code
              </span>
            </button>
          </div>
        </section>

        {/* Visual Down Arrow indicator */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
          <ArrowDown className="w-4 h-4 animate-bounce" />
          <span>Active Number & Verification Inbox</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>

        {/* BOX 2: THE EXACT VERIFICATION CARD (FROM USER SCREENSHOT) */}
        <div ref={cardRef} className="space-y-4">
          <ReceivedSmsCard
            message={currentMessage}
            number={activeNumber}
            onGetNewCode={handleResendCode}
          />

          {/* ACTION BUTTONS DIRECTLY BELOW CARD */}
          <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Button 1: Copy Code */}
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  currentMessage?.otpCode || '431963',
                  'Code Copied!'
                )
              }
              className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>Copy OTP Code</span>
            </button>

            {/* Button 2: Resend / New Code (disabled during rate limit cooldown) */}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isRateLimited}
              className={`py-3.5 px-4 font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isRateLimited
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isRateLimited ? 'Cooldown Active' : 'Send New Code'}</span>
            </button>
          </div>

          {/* Full copy number button */}
          <div className="max-w-md mx-auto">
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  activeNumber.formattedNumber,
                  'Phone Number Copied!'
                )
              }
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold rounded-xl text-xs border border-slate-750 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Copy className="w-4 h-4 text-blue-400" />
              <span>
                Copy Phone Number ({activeNumber.formattedNumber})
              </span>
            </button>
          </div>
        </div>

        {/* BOX 3: PROVIDER SIMULATOR CONSOLE & ERROR STATES TESTER */}
        <ProviderSimulatorConsole />

        {/* COMPLIANCE & TRANSPARENCY NOTICE */}
        <section className="bg-slate-900/90 border-2 border-slate-800 rounded-2xl p-5 max-w-md mx-auto text-xs text-slate-300 space-y-2 shadow-xl">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>Verification Provider Standards & Integrity</span>
          </div>

          <p className="leading-relaxed text-slate-300">
            CloudNumber strictly adheres to provider verification standards. When Google or YouTube 2-Step Verification flags excessive attempts or rate limits a number, CloudNumber transparently surfaces the provider error response and enforces the required retry cooldown rather than manipulating or falsifying verification outcomes.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 pt-6">
        <p>CloudNumber · Compliant Digital Verification System</p>
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
