import React from 'react';
import { Smartphone, Shield, Zap, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useVirtualNumber } from '../context/VirtualNumberContext';

interface HowItWorksGuideProps {
  onGetNumber: () => void;
}

export const HowItWorksGuide: React.FC<HowItWorksGuideProps> = ({ onGetNumber }) => {
  const { lang } = useVirtualNumber();

  const steps = [
    {
      num: '01',
      titleEn: 'Choose Country & Service',
      titleUr: '1. Mulk Aur App Select Karein',
      descEn: 'Pick from 30+ countries (Philippines, USA, UK, Pakistan, etc.) and select WhatsApp, Telegram, or Google.',
      descUr: 'Philippines, USA, UK, Pakistan ya kisi bhi mulk ka intikhab karein aur app choose karein.',
    },
    {
      num: '02',
      titleEn: 'Enter Number in App',
      titleUr: '2. Number App Me Enter Karein',
      descEn: 'Copy your allocated formatted number (e.g. +639070220358) and enter it into the app registration field.',
      descUr: 'Apna digital number copy karein aur WhatsApp ya kisi bhi verification form me daalein.',
    },
    {
      num: '03',
      titleEn: 'Receive OTP & 1-Click Copy',
      titleUr: '3. OTP Receive Karein Aur Copy Karein',
      descEn: 'The SMS arrives in real-time. The code is highlighted instantly for easy 1-click copying.',
      descUr: 'SMS aate hi bada OTP code show hoga (jaise screenshot me 431963), bas Copy Code dabayein!',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-xl">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {lang === 'ur'
            ? 'Digital Number Aur OTP Verification Kaisay Kaam Karta Hai?'
            : 'How Digital Numbers & OTP Verification Work'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          {lang === 'ur'
            ? 'Yeh platform kisi bhi mulk ka digital number generate karta hai aur real-time SMS webhook ke zariye OTP verification code deliver karta hai.'
            : 'Generate virtual phone numbers for testing, development, and account verification across international carriers.'}
        </p>
      </div>

      {/* 3 Step Process */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {steps.map(step => (
          <div
            key={step.num}
            className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between"
          >
            <div>
              <span className="text-2xl font-black text-blue-500 font-mono block mb-2">
                {step.num}
              </span>
              <h4 className="text-sm font-semibold text-slate-200 mb-1.5">
                {lang === 'ur' ? step.titleUr : step.titleEn}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'ur' ? step.descUr : step.descEn}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Frequently Asked Technical Questions */}
      <div className="space-y-3 pt-6 border-t border-slate-800">
        <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          {lang === 'ur' ? 'Aham Sawalat & Jawab' : 'Frequently Asked Questions'}
        </h4>

        <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/70 text-xs">
          <p className="font-semibold text-slate-200">
            {lang === 'ur'
              ? 'Q: Kya WhatsApp aur Google par ye numbers 100% kaam karte hain?'
              : 'Q: Do these numbers work for WhatsApp, Telegram, and Google?'}
          </p>
          <p className="text-slate-400 mt-1 leading-relaxed">
            {lang === 'ur'
              ? 'Ji haan! WhatsApp aur banking apps real Mobile SIM routes mangti hain. Is app me har number authentic country mobile prefix ke sath allocate hota hai, taake standard VoIP blocks na lagein.'
              : 'Yes! While standard free VoIP numbers are frequently blocked, our numbers use Mobile cellular SIM routing specifications to maximize verification success rates.'}
          </p>
        </div>

        <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/70 text-xs">
          <p className="font-semibold text-slate-200">
            {lang === 'ur'
              ? 'Q: Agar mere paas real Twilio ya Telnyx account ho to kya connect ho sakta hai?'
              : 'Q: Can I connect my real Twilio or Telnyx telecom account?'}
          </p>
          <p className="text-slate-400 mt-1 leading-relaxed">
            {lang === 'ur'
              ? 'Bilkul! "API & Setup" tab me aap apna Twilio SID aur Auth Token daal kar real SMS bhi directly receive kar sakte hain.'
              : 'Yes! Use the "API & Setup" tab to configure your Twilio or Telnyx credentials or point your live incoming SMS webhooks directly to this dashboard.'}
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onGetNumber}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg transition-all"
        >
          <span>{lang === 'ur' ? 'Abhi Digital Number Hasil Karein' : 'Get Digital Number Now'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
