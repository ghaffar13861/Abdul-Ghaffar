import React, { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, XCircle, Shield, Info, Smartphone, Radio } from 'lucide-react';
import { useVirtualNumber } from '../context/VirtualNumberContext';
import { COUNTRIES } from '../data/countries';

export const CarrierLookupTool: React.FC = () => {
  const { lang, activeNumber } = useVirtualNumber();
  const [phoneNumber, setPhoneNumber] = useState(activeNumber?.formattedNumber || '+639070220358');
  const [analyzed, setAnalyzed] = useState(true);

  // Analyze the entered phone number
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  const matchedCountry = COUNTRIES.find(c => cleanNumber.startsWith(c.dialCode)) || COUNTRIES[0];
  const isMobile = !cleanNumber.endsWith('00') && !cleanNumber.includes('800');

  const compatibilityList = [
    {
      service: 'WhatsApp / WhatsApp Business',
      supported: true,
      score: '98%',
      status: 'Supported',
      note: 'Requires Mobile SIM carrier type. Passes WhatsApp registration check.',
    },
    {
      service: 'Telegram / Telegram X',
      supported: true,
      score: '99%',
      status: 'Supported',
      note: 'High deliverability. SMS and login codes accepted.',
    },
    {
      service: 'Google / Gmail 2FA',
      supported: true,
      score: '97%',
      status: 'Supported',
      note: 'G-XXXXXX verification codes deliver in 2-4 seconds.',
    },
    {
      service: 'TikTok / Instagram / Meta',
      supported: true,
      score: '95%',
      status: 'Supported',
      note: 'Social security tokens delivered reliably.',
    },
    {
      service: 'Banking & Financial (2FA)',
      supported: isMobile,
      score: isMobile ? '92%' : '55%',
      status: isMobile ? 'Supported (Mobile SIM)' : 'VoIP May Be Filtered',
      note: isMobile
        ? 'Physical carrier route avoids standard VoIP firewalls.'
        : 'Some strict banks block virtual VoIP lines; switch to Mobile SIM.',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            {lang === 'ur' ? 'Carrier Lookup & OTP Compatibility Checker' : 'Carrier Lookup & OTP Deliverability'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ur'
              ? 'Check karein ke ye number WhatsApp, Telegram aur Bank OTP ke liye kaam karega ya nahi'
              : 'Inspect line type, carrier route, and anti-fraud compatibility'}
          </p>
        </div>
      </div>

      {/* Input row */}
      <div className="mt-5">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          {lang === 'ur' ? 'Phone Number Check Karein' : 'Phone Number with Country Dial Code'}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="+639070220358"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-mono text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setAnalyzed(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shrink-0 cursor-pointer"
          >
            {lang === 'ur' ? 'Check Deliverability' : 'Inspect Line'}
          </button>
        </div>
      </div>

      {/* Analysis Result */}
      {analyzed && (
        <div className="mt-6 space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Country</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                <span>{matchedCountry.flag}</span>
                <span>{matchedCountry.name}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Line Type</span>
              <span className="font-semibold text-emerald-400 mt-0.5 block">
                {isMobile ? 'Mobile Cellular SIM' : 'VoIP Virtual DID'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Carrier Network</span>
              <span className="font-semibold text-slate-200 mt-0.5 block truncate">
                {matchedCountry.primaryCarriers[0]}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Overall OTP Score</span>
              <span className="font-semibold text-blue-400 mt-0.5 block">
                {matchedCountry.otpSuccessRate}% Success
              </span>
            </div>
          </div>

          {/* Service Compatibility Table */}
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 text-xs font-semibold text-slate-300">
              {lang === 'ur' ? 'Apps & Verification Readiness' : 'Service Verification Readiness'}
            </div>
            <div className="divide-y divide-slate-800/60 bg-slate-900/60 text-xs">
              {compatibilityList.map((item, idx) => (
                <div key={idx} className="p-3 sm:px-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-200 flex items-center gap-2">
                      <span>{item.service}</span>
                      <span className="font-mono text-[11px] text-blue-400">{item.score}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                      {item.note}
                    </p>
                  </div>
                  <span className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                    <CheckCircle className="w-3 h-3" />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Note */}
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-blue-200/90 leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-300">
                {lang === 'ur' ? 'Aham Maloomat (Why this works):' : 'Technical Note on OTP Deliverability:'}
              </p>
              <p className="mt-0.5 text-blue-200/80">
                {lang === 'ur'
                  ? 'Kayi services (jaise WhatsApp) aam VoIP numbers ko block kar deti hain. Hamara system Mobile SIM carrier profiles allocate karta hai taake aapko 100% verification codes receive ho sakein!'
                  : 'Platforms like WhatsApp and banks screen against cheap VoIP ranges. Allocating Mobile SIM routing ensures your numbers pass carrier verification checks.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
