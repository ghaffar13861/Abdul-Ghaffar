import React, { useState } from 'react';
import { X, Key, Check, Globe, Code2, Link2, ExternalLink } from 'lucide-react';
import { useVirtualNumber } from '../context/VirtualNumberContext';

interface RealCarrierSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RealCarrierSettingsModal: React.FC<RealCarrierSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { carrierSettings, updateCarrierSettings, lang, copyToClipboard } = useVirtualNumber();

  const [provider, setProvider] = useState(carrierSettings.provider);
  const [accountSid, setAccountSid] = useState(carrierSettings.accountSid || '');
  const [authToken, setAuthToken] = useState(carrierSettings.authToken || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const webhookEndpoint = `${window.location.origin}/api/sms/webhook`;

  const handleSave = () => {
    updateCarrierSettings({
      provider,
      accountSid,
      authToken,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" />
              {lang === 'ur' ? 'Telecom Carrier & Webhook API Settings' : 'Carrier API & Webhook Settings'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'ur'
                ? 'Real Twilio account ya custom webhook connect karein'
                : 'Connect live Twilio or Telnyx accounts for real rented cellular numbers'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {lang === 'ur' ? 'Provider Mode' : 'SMS Provider Integration'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProvider('simulator')}
                className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                  provider === 'simulator'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Instant Simulator
              </button>
              <button
                type="button"
                onClick={() => setProvider('twilio')}
                className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                  provider === 'twilio'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                🔴 Twilio API
              </button>
              <button
                type="button"
                onClick={() => setProvider('custom_webhook')}
                className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                  provider === 'custom_webhook'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                🔗 Custom Webhook
              </button>
            </div>
          </div>

          {provider === 'twilio' && (
            <div className="space-y-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Twilio Account SID</label>
                <input
                  type="text"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={accountSid}
                  onChange={e => setAccountSid(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Twilio Auth Token</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••"
                  value={authToken}
                  onChange={e => setAuthToken(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Webhook URL Endpoint */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {lang === 'ur' ? 'Incoming SMS Webhook URL' : 'Live Incoming Webhook Endpoint'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={webhookEndpoint}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(webhookEndpoint, 'Webhook URL Copied!')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl shrink-0"
              >
                Copy
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {lang === 'ur'
                ? 'Apne VoIP provider ke webhook me ye URL dalein taake jab bhi real SMS aye to direct yahan show ho.'
                : 'Configure this webhook URL on your telecom dashboard to ingest external SMS messages.'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-1.5"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Configuration</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
