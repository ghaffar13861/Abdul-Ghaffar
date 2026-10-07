import React, { useState } from 'react';
import { Copy, Check, MoreVertical, Eye, EyeOff, RotateCw } from 'lucide-react';
import { SmsMessage, VirtualNumber } from '../types';
import { COUNTRIES } from '../data/countries';
import { useVirtualNumber } from '../context/VirtualNumberContext';

interface ReceivedSmsCardProps {
  message?: SmsMessage;
  number: VirtualNumber;
  onGetNewCode?: () => void;
}

export const ReceivedSmsCard: React.FC<ReceivedSmsCardProps> = ({ message, number, onGetNewCode }) => {
  const { copyToClipboard, lang } = useVirtualNumber();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [showFullBody, setShowFullBody] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Safe defaults to prevent any crash
  const countryCode = number?.countryCode || 'PH';
  const country = COUNTRIES.find(c => c.code === countryCode);
  const countryFlag = country?.flag || '🇵🇭';
  const countryName = country?.name || number?.countryName || 'Philippines';
  const formattedPhone = number?.formattedNumber || '+639070220358';

  const otpCode = message?.otpCode || '431963';
  const senderService = message?.senderService || 'WhatsApp';
  const timestamp = message?.timestamp || '05.10.2026 · 12:37';
  const bodyText = message?.body || `Your ${senderService} code: ${otpCode}. Do not share this code.`;

  const handleCopyCode = async () => {
    if (otpCode) {
      await copyToClipboard(otpCode, lang === 'ur' ? 'Code Copy Ho Gaya!' : 'Code Copied!');
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyNumber = async () => {
    await copyToClipboard(formattedPhone, lang === 'ur' ? 'Number Copy Ho Gaya!' : 'Number Copied!');
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  // Safe service icon renderer
  const renderServiceIcon = (serviceName: string) => {
    const s = (serviceName || '').toLowerCase();
    if (s.includes('whatsapp')) {
      return (
        <span className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center text-white shrink-0">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.97.529 1.942.812 2.795.812 3.179 0 5.766-2.587 5.767-5.767 0-3.181-2.588-5.768-5.767-5.768zm3.387 8.214c-.143.403-.733.743-1.018.789-.286.046-.612.062-1.849-.448-1.577-.65-2.593-2.257-2.671-2.36-.078-.104-.645-.859-.645-1.637 0-.777.408-1.16.553-1.317.144-.157.315-.196.421-.196.104 0 .209.001.3.006.096.005.225-.036.352.269.13.313.444 1.082.483 1.161.039.078.065.17.013.274-.052.105-.078.17-.156.261-.078.092-.164.205-.235.275-.078.078-.16.163-.069.319.091.157.405.668.868 1.081.597.532 1.101.697 1.258.775.157.078.248.065.34-.039.091-.105.391-.456.495-.613.105-.157.209-.13.352-.078.144.052.913.431 1.07.509.157.078.261.117.299.183.039.065.039.378-.104.781z" />
          </svg>
        </span>
      );
    }
    if (s.includes('telegram')) return <span className="text-lg">✈️</span>;
    if (s.includes('google')) {
      return (
        <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-bold text-xs text-blue-600 shadow-xs border border-slate-200">
          G
        </span>
      );
    }
    if (s.includes('tiktok')) return <span className="text-lg">🎵</span>;
    if (s.includes('facebook')) return <span className="text-lg">👥</span>;
    return <span className="text-lg">💬</span>;
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-900 max-w-md mx-auto w-full transition-all">
      {/* Top Number Header with copy icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-sans select-all">
            {formattedPhone}
          </span>
          <button
            type="button"
            onClick={handleCopyNumber}
            title={lang === 'ur' ? 'Number Copy Karein' : 'Copy phone number'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {copiedNumber ? (
              <Check className="w-5 h-5 text-emerald-600" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowFullBody(!showFullBody);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                {showFullBody ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showFullBody ? 'Hide text' : 'Show full SMS'}
              </button>
              {onGetNewCode && (
                <button
                  type="button"
                  onClick={() => {
                    onGetNewCode();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600 font-medium"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  {lang === 'ur' ? 'Naya OTP Code Lein' : 'Receive New Code'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Blue Subtitle: "SMS received" exactly like photo */}
      <div className="mt-1">
        <p className="text-base sm:text-lg font-bold text-blue-600">
          SMS received
        </p>
      </div>

      {/* Service & Country Row */}
      <div className="mt-4 flex items-center gap-6 text-sm text-slate-800 font-semibold">
        <div className="flex items-center gap-2">
          {renderServiceIcon(senderService)}
          <span>{senderService}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xl leading-none" role="img" aria-label={countryName}>
            {countryFlag}
          </span>
          <span>{countryName}</span>
        </div>
      </div>

      {/* Timestamp row */}
      <div className="mt-5 text-xs text-slate-400 font-sans">
        <span>{timestamp}</span>
      </div>

      {/* The Highlighted Verification Code Box (Exact match from the image) */}
      <div className="mt-2.5 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-blue-400">
        <div className="flex flex-col items-start gap-1">
          {/* Big Bold Code Display */}
          <span className="text-3xl sm:text-4xl font-extrabold tracking-wider text-blue-600 font-sans select-all">
            {otpCode}
          </span>

          {/* Clean "Copy code" Text Link */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="mt-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedCode ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-bold">{lang === 'ur' ? 'Code Copy Ho Gaya!' : 'Copied!'}</span>
              </>
            ) : (
              <span>{lang === 'ur' ? 'Copy code' : 'Copy code'}</span>
            )}
          </button>
        </div>

        {/* Collapsible full text */}
        {showFullBody && (
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 font-mono leading-relaxed bg-slate-50 p-2.5 rounded-lg">
            {bodyText}
          </div>
        )}
      </div>

      {/* Action helpers */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <button
          type="button"
          onClick={() => setShowFullBody(!showFullBody)}
          className="hover:text-slate-800 transition-colors cursor-pointer font-medium"
        >
          {showFullBody ? (lang === 'ur' ? 'SMS Chhupayein' : 'Hide details') : (lang === 'ur' ? 'Pura SMS Parhein' : 'View full message')}
        </button>

        {onGetNewCode && (
          <button
            type="button"
            onClick={onGetNewCode}
            className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{lang === 'ur' ? 'Naya OTP Code Mangwayein' : 'New OTP Code'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
