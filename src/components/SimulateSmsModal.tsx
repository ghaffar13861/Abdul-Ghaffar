import React, { useState } from 'react';
import { X, Send, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';
import { useVirtualNumber } from '../context/VirtualNumberContext';
import { SmsMessage } from '../types';

interface SimulateSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulateSmsModal: React.FC<SimulateSmsModalProps> = ({ isOpen, onClose }) => {
  const { activeNumber, simulateIncomingSms, selectedService, lang } = useVirtualNumber();

  const [service, setService] = useState<SmsMessage['senderService']>(
    (selectedService as SmsMessage['senderService']) || 'WhatsApp'
  );
  const [customOtp, setCustomOtp] = useState<string>('');
  const [customBody, setCustomBody] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !activeNumber) return null;

  const quickTemplates = [
    {
      service: 'WhatsApp' as const,
      label: 'WhatsApp Code',
      defaultBody: 'Your WhatsApp code: {OTP}. You can also tap on this link to verify your phone: v.whatsapp.com/{OTP}. Do not share this code.',
    },
    {
      service: 'Telegram' as const,
      label: 'Telegram Code',
      defaultBody: 'Telegram code: {OTP}. You can also tap on this link to log in. Please don\'t give this code to anyone.',
    },
    {
      service: 'Google' as const,
      label: 'Google 2FA',
      defaultBody: 'G-{OTP} is your Google verification code. Do not share it with anyone.',
    },
    {
      service: 'TikTok' as const,
      label: 'TikTok OTP',
      defaultBody: '[TikTok] {OTP} is your verification code. Valid for 5 minutes.',
    },
    {
      service: 'Bank' as const,
      label: 'Secure Bank OTP',
      defaultBody: 'Your bank authorization OTP is {OTP}. Valid for 10 minutes. Do not disclose to anyone.',
    },
  ];

  const handleSend = () => {
    setIsSending(true);
    const code = customOtp.trim() || Math.floor(100000 + Math.random() * 900000).toString();
    const template = quickTemplates.find(t => t.service === service);
    const body = customBody.trim() || template?.defaultBody.replace(/\{OTP\}/g, code);

    setTimeout(() => {
      simulateIncomingSms({
        senderService: service,
        code,
        customBody: body,
      });
      setIsSending(false);
      onClose();
    }, 400);
  };

  const generateRandomOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCustomOtp(code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-400" />
              {lang === 'ur' ? 'SMS / OTP Simulator' : 'Test Incoming SMS / OTP'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: <span className="font-mono text-slate-200">{activeNumber.formattedNumber}</span> ({activeNumber.countryName})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Quick Select Service */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {lang === 'ur' ? 'Sender Service Select Karein' : 'Select Sender Platform'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickTemplates.map(t => (
                <button
                  key={t.service}
                  type="button"
                  onClick={() => {
                    setService(t.service);
                    setCustomBody('');
                  }}
                  className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    service === t.service
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-xs'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* OTP Code Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {lang === 'ur' ? 'Verification OTP Code' : 'OTP Code (4 - 6 Digits)'}
              </label>
              <button
                type="button"
                onClick={generateRandomOtp}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                {lang === 'ur' ? 'Random Code' : 'Randomize'}
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. 431963"
              value={customOtp}
              onChange={e => setCustomOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-blue-400 placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Custom Message preview / edit */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {lang === 'ur' ? 'Custom SMS Body (Optional)' : 'Custom SMS Body (Optional)'}
            </label>
            <textarea
              rows={2}
              placeholder={lang === 'ur' ? 'Khali chor dein to default verification text bhejega...' : 'Leave empty for realistic default verification template...'}
              value={customBody}
              onChange={e => setCustomBody(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-hidden focus:border-blue-500 resize-none"
            />
          </div>

          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">
              {lang === 'ur' ? 'Ye kaisay kaam karta hai?' : 'How this works:'}
            </span>{' '}
            {lang === 'ur'
              ? 'Jab aap kisi app (jaise WhatsApp) me ye digital number enter kareinge, to real telecom API se SMS aane par ye card pop-up hoga jaise aapki reference photo me hai!'
              : 'When you request an OTP in real life, telecom webhooks deliver this message to your inbox with instant 1-click code copying.'}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            {lang === 'ur' ? 'Cancel' : 'Cancel'}
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {isSending
              ? (lang === 'ur' ? 'Bhej rahe hain...' : 'Delivering...')
              : (lang === 'ur' ? 'SMS Code Receive Karein' : 'Trigger Incoming SMS')}
          </button>
        </div>
      </div>
    </div>
  );
};
