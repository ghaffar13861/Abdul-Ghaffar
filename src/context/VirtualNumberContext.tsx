import React, { createContext, useContext, useState, useEffect } from 'react';
import { VirtualNumber, SmsMessage, Country, LineType, CarrierApiSettings } from '../types';
import { COUNTRIES } from '../data/countries';
import { generateVirtualNumber } from '../utils/numberGenerator';
import { extractOtpCode } from '../utils/otpExtractor';

interface VirtualNumberContextType {
  numbers: VirtualNumber[];
  activeNumber: VirtualNumber | null;
  messages: SmsMessage[];
  selectedService: string;
  lang: 'ur' | 'en';
  soundEnabled: boolean;
  carrierSettings: CarrierApiSettings;
  setActiveNumberId: (id: string) => void;
  setSelectedService: (service: string) => void;
  setLang: (lang: 'ur' | 'en') => void;
  setSoundEnabled: (enabled: boolean) => void;
  createNewNumber: (
    countryCode: string,
    lineType?: LineType,
    service?: string,
    autoSendCode?: boolean
  ) => VirtualNumber;
  removeNumber: (id: string) => void;
  simulateIncomingSms: (options?: {
    senderService?: SmsMessage['senderService'];
    code?: string;
    customBody?: string;
  }) => SmsMessage | null;
  clearMessages: (numberId: string) => void;
  copyToClipboard: (text: string, label?: string) => Promise<boolean>;
  copiedNotification: string | null;
  updateCarrierSettings: (settings: Partial<CarrierApiSettings>) => void;
}

const VirtualNumberContext = createContext<VirtualNumberContextType | undefined>(undefined);

// Initial default number matching user's exact uploaded screenshot
const INITIAL_PHILIPPINES_NUMBER: VirtualNumber = {
  id: 'num_ph_initial',
  countryCode: 'PH',
  countryName: 'Philippines',
  dialCode: '+63',
  rawNumber: '+639070220358',
  formattedNumber: '+639070220358',
  lineType: 'Mobile SIM',
  carrier: 'Smart Telecom PH',
  status: 'Active',
  createdAt: new Date('2026-10-05T12:30:00Z').toISOString(),
  expiresAt: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
  smsCount: 1,
  unreadCount: 0,
};

const INITIAL_MESSAGE: SmsMessage = {
  id: 'msg_ph_initial',
  numberId: 'num_ph_initial',
  targetNumber: '+639070220358',
  sender: 'WhatsApp',
  senderService: 'WhatsApp',
  body: 'Your WhatsApp code: 431-963. You can also tap on this link to verify your phone: v.whatsapp.com/431963. Do not share this code with anyone.',
  otpCode: '431963',
  timestamp: '05.10.2026 · 12:37',
  read: true,
  deliverySeconds: 4,
};

export const VirtualNumberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [numbers, setNumbers] = useState<VirtualNumber[]>(() => {
    const saved = localStorage.getItem('cloudnumber_numbers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [INITIAL_PHILIPPINES_NUMBER];
  });

  const [activeNumberId, setActiveNumberId] = useState<string>(() => {
    return numbers[0]?.id || INITIAL_PHILIPPINES_NUMBER.id;
  });

  const [messages, setMessages] = useState<SmsMessage[]>(() => {
    const saved = localStorage.getItem('cloudnumber_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [INITIAL_MESSAGE];
  });

  const [selectedService, setSelectedService] = useState<string>('WhatsApp');
  const [lang, setLang] = useState<'ur' | 'en'>('ur');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [carrierSettings, setCarrierSettings] = useState<CarrierApiSettings>({
    provider: 'simulator',
  });

  useEffect(() => {
    localStorage.setItem('cloudnumber_numbers', JSON.stringify(numbers));
  }, [numbers]);

  useEffect(() => {
    localStorage.setItem('cloudnumber_messages', JSON.stringify(messages));
  }, [messages]);

  const activeNumber = numbers.find(n => n.id === activeNumberId) || numbers[0] || null;

  // Sound chime
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext not allowed before user interaction
    }
  };

  const copyToClipboard = async (text: string, label = 'Copied'): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedNotification(label);
      setTimeout(() => setCopiedNotification(null), 2500);
      return true;
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedNotification(label);
      setTimeout(() => setCopiedNotification(null), 2500);
      return true;
    }
  };

  const createNewNumber = (
    countryCode: string,
    lineType: LineType = 'Mobile SIM',
    service = selectedService,
    autoSendCode = true
  ) => {
    const newNum = generateVirtualNumber(countryCode, lineType);
    setNumbers(prev => [newNum, ...prev]);
    setActiveNumberId(newNum.id);
    setSelectedService(service);

    if (autoSendCode) {
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestampFormatted = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} · ${pad(now.getHours())}:${pad(now.getMinutes())}`;

      let smsBody = `Your ${service} code: ${randomCode.slice(0, 3)}-${randomCode.slice(3)}. You can also tap on this link to verify your phone: v.${service.toLowerCase()}.com/${randomCode}. Do not share this code with anyone.`;
      if (service === 'Google') {
        smsBody = `G-${randomCode} is your Google verification code. Do not share it with anyone.`;
      } else if (service === 'Telegram') {
        smsBody = `Telegram code: ${randomCode}. You can also tap on this link to log in. Please don't give this code to anyone.`;
      }

      const initialSms: SmsMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        numberId: newNum.id,
        targetNumber: newNum.formattedNumber,
        sender: service,
        senderService: service as any,
        body: smsBody,
        otpCode: randomCode,
        timestamp: timestampFormatted,
        read: true,
        deliverySeconds: 2,
      };

      setMessages(prev => [initialSms, ...prev]);
      newNum.smsCount = 1;
      newNum.unreadCount = 1;

      setTimeout(() => {
        playChime();
      }, 200);
    }

    return newNum;
  };

  const removeNumber = (id: string) => {
    setNumbers(prev => prev.filter(n => n.id !== id));
    setMessages(prev => prev.filter(m => m.numberId !== id));
    if (activeNumberId === id) {
      const remaining = numbers.filter(n => n.id !== id);
      if (remaining.length > 0) {
        setActiveNumberId(remaining[0].id);
      }
    }
  };

  const clearMessages = (numberId: string) => {
    setMessages(prev => prev.filter(m => m.numberId !== numberId));
    setNumbers(prev =>
      prev.map(n => (n.id === numberId ? { ...n, smsCount: 0, unreadCount: 0 } : n))
    );
  };

  const updateCarrierSettings = (settings: Partial<CarrierApiSettings>) => {
    setCarrierSettings(prev => ({ ...prev, ...settings }));
  };

  const simulateIncomingSms = (options?: {
    senderService?: SmsMessage['senderService'];
    code?: string;
    customBody?: string;
  }): SmsMessage | null => {
    if (!activeNumber) return null;

    const sService = options?.senderService || (selectedService as SmsMessage['senderService']) || 'WhatsApp';
    const randomCode = options?.code || Math.floor(100000 + Math.random() * 900000).toString();

    let smsBody = options?.customBody;
    if (!smsBody) {
      if (sService === 'WhatsApp') {
        smsBody = `Your WhatsApp code: ${randomCode.slice(0, 3)}-${randomCode.slice(3)}. You can also tap on this link to verify your phone: v.whatsapp.com/${randomCode}. Do not share this code.`;
      } else if (sService === 'Telegram') {
        smsBody = `Telegram code: ${randomCode}. You can also tap on this link to log in. Please don't give this code to anyone.`;
      } else if (sService === 'Google') {
        smsBody = `G-${randomCode} is your Google verification code. Do not share it with anyone.`;
      } else if (sService === 'TikTok') {
        smsBody = `[TikTok] ${randomCode} is your verification code. Valid for 5 minutes.`;
      } else if (sService === 'Instagram') {
        smsBody = `${randomCode} is your Instagram code. Don't share it.`;
      } else {
        smsBody = `Your verification code is ${randomCode}. Valid for 10 minutes.`;
      }
    }

    const code = extractOtpCode(smsBody) || randomCode;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestampFormatted = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} · ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newMsg: SmsMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      numberId: activeNumber.id,
      targetNumber: activeNumber.formattedNumber,
      sender: sService,
      senderService: sService,
      body: smsBody,
      otpCode: code,
      timestamp: timestampFormatted,
      read: true,
      deliverySeconds: Math.floor(2 + Math.random() * 5),
    };

    setMessages(prev => [newMsg, ...prev]);
    setNumbers(prev =>
      prev.map(n =>
        n.id === activeNumber.id
          ? { ...n, smsCount: n.smsCount + 1, unreadCount: n.unreadCount + 1 }
          : n
      )
    );

    playChime();
    return newMsg;
  };

  return (
    <VirtualNumberContext.Provider
      value={{
        numbers,
        activeNumber,
        messages: messages.filter(m => (activeNumber ? m.numberId === activeNumber.id : true)),
        selectedService,
        lang,
        soundEnabled,
        carrierSettings,
        setActiveNumberId,
        setSelectedService,
        setLang,
        setSoundEnabled,
        createNewNumber,
        removeNumber,
        simulateIncomingSms,
        clearMessages,
        copyToClipboard,
        copiedNotification,
        updateCarrierSettings,
      }}
    >
      {children}
    </VirtualNumberContext.Provider>
  );
};

export const useVirtualNumber = () => {
  const context = useContext(VirtualNumberContext);
  if (!context) {
    throw new Error('useVirtualNumber must be used within a VirtualNumberProvider');
  }
  return context;
};
