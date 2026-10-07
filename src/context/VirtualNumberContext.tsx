import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  VirtualNumber,
  SmsMessage,
  LineType,
  CarrierApiSettings,
  VerificationState,
  VerificationErrorDetails,
} from '../types';
import { COUNTRIES } from '../data/countries';
import { generateVirtualNumber } from '../utils/numberGenerator';
import { extractOtpCode } from '../utils/otpExtractor';

interface VirtualNumberContextType {
  numbers: VirtualNumber[];
  activeNumber: VirtualNumber;
  messages: SmsMessage[];
  activeMessages: SmsMessage[];
  selectedService: string;
  lang: 'ur' | 'en';
  soundEnabled: boolean;
  copiedNotification: string | null;
  carrierSettings: CarrierApiSettings;
  verificationState: VerificationState;
  errorDetails: VerificationErrorDetails | null;
  cooldownSecondsRemaining: number;
  isRateLimited: boolean;
  attemptCount: number;
  setActiveNumberId: (id: string) => void;
  setSelectedService: (service: string) => void;
  setLang: (lang: 'ur' | 'en') => void;
  createNewNumber: (
    countryCode: string,
    lineTypeOrService?: any,
    service?: string,
    autoSendCode?: boolean
  ) => { number: VirtualNumber; message: SmsMessage };
  removeNumber: (id: string) => void;
  simulateIncomingSms: (optionsOrCode?: any) => SmsMessage;
  copyToClipboard: (text: string, label?: string) => Promise<boolean>;
  updateCarrierSettings: (settings: Partial<CarrierApiSettings>) => void;
  triggerProviderError: (
    errorType:
      | 'too_many_attempts'
      | 'invalid_number'
      | 'otp_expired'
      | 'incorrect_otp'
      | 'provider_rejected'
      | 'verified'
  ) => void;
  submitOtpVerification: (enteredCode: string) => Promise<{ success: boolean; state: VerificationState; message: string }>;
  resetVerificationState: () => void;
}

const VirtualNumberContext = createContext<VirtualNumberContextType | undefined>(undefined);

// Initial Philippines number matching user's uploaded reference screenshot
const INITIAL_PHILIPPINES_NUMBER: VirtualNumber = {
  id: 'num_ph_639070220358',
  countryCode: 'PH',
  countryName: 'Philippines',
  dialCode: '+63',
  rawNumber: '+639070220358',
  formattedNumber: '+639070220358',
  lineType: 'Mobile SIM',
  carrier: 'Smart Telecom PH',
  status: 'Active',
  verificationState: 'waiting_otp',
  createdAt: '2026-10-05T12:30:00Z',
  expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
  smsCount: 1,
  unreadCount: 0,
};

const INITIAL_MESSAGE: SmsMessage = {
  id: 'msg_ph_initial',
  numberId: 'num_ph_639070220358',
  targetNumber: '+639070220358',
  sender: 'WhatsApp',
  senderService: 'WhatsApp',
  body: 'Your WhatsApp code: 431-963. You can also tap on this link to verify your phone: v.whatsapp.com/431963. Do not share this code with anyone.',
  otpCode: '431963',
  timestamp: '05.10.2026 · 12:37',
  read: true,
  deliverySeconds: 2,
};

export const VirtualNumberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [numbers, setNumbers] = useState<VirtualNumber[]>([INITIAL_PHILIPPINES_NUMBER]);
  const [activeNumberId, setActiveNumberId] = useState<string>(INITIAL_PHILIPPINES_NUMBER.id);
  const [messages, setMessages] = useState<SmsMessage[]>([INITIAL_MESSAGE]);
  const [selectedService, setSelectedService] = useState<string>('Google');
  const [lang, setLang] = useState<'ur' | 'en'>('en');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [carrierSettings, setCarrierSettings] = useState<CarrierApiSettings>({
    provider: 'simulator',
  });

  // Verification state tracking
  const [verificationState, setVerificationState] = useState<VerificationState>('waiting_otp');
  const [errorDetails, setErrorDetails] = useState<VerificationErrorDetails | null>(null);
  const [cooldownSecondsRemaining, setCooldownSecondsRemaining] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  // Active number
  const activeNumber = useMemo(() => {
    return numbers.find(n => n.id === activeNumberId) || numbers[0] || INITIAL_PHILIPPINES_NUMBER;
  }, [numbers, activeNumberId]);

  // Messages for active number
  const activeMessages = useMemo(() => {
    const list = messages.filter(m => m.numberId === activeNumber.id);
    if (list.length === 0) {
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestampFormatted = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} · ${pad(now.getHours())}:${pad(now.getMinutes())}`;

      return [
        {
          id: `msg_auto_${activeNumber.id}`,
          numberId: activeNumber.id,
          targetNumber: activeNumber.formattedNumber,
          sender: selectedService,
          senderService: selectedService as any,
          body: `G-${fallbackCode} is your Google verification code. Do not share it with anyone.`,
          otpCode: fallbackCode,
          timestamp: timestampFormatted,
          read: true,
          deliverySeconds: 2,
        },
      ];
    }
    return list;
  }, [messages, activeNumber.id, activeNumber.formattedNumber, selectedService]);

  // Cooldown countdown timer effect
  useEffect(() => {
    if (cooldownSecondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setCooldownSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // When cooldown finishes, reset rate limited state back to waiting
          setVerificationState('waiting_otp');
          setErrorDetails(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownSecondsRemaining]);

  const isRateLimited = verificationState === 'rate_limited' && cooldownSecondsRemaining > 0;

  const copyToClipboard = async (text: string, label = 'Copied'): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedNotification(label);
      setTimeout(() => setCopiedNotification(null), 2500);
      return true;
    } catch {
      setCopiedNotification(label);
      setTimeout(() => setCopiedNotification(null), 2500);
      return true;
    }
  };

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // ignore
    }
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

  const updateCarrierSettings = (settings: Partial<CarrierApiSettings>) => {
    setCarrierSettings(prev => ({ ...prev, ...settings }));
  };

  // Trigger specific provider error states (used for live error detection and reproduction)
  const triggerProviderError = (
    errorType:
      | 'too_many_attempts'
      | 'invalid_number'
      | 'otp_expired'
      | 'incorrect_otp'
      | 'provider_rejected'
      | 'verified'
  ) => {
    const providerName = (selectedService as any) || 'Google';

    switch (errorType) {
      case 'too_many_attempts': {
        // 15-minute cooldown (900 seconds)
        const cooldownTime = 900;
        setCooldownSecondsRemaining(cooldownTime);
        setVerificationState('rate_limited');
        setErrorDetails({
          state: 'rate_limited',
          provider: providerName,
          title: 'Too Many Verification Attempts',
          providerRawError: 'You have recently made too many attempts. Please try again later.',
          cloudNumberMessage:
            'Google has temporarily limited verification attempts for this number. Please wait and try again later, or use another legitimate phone number.',
          cooldownSeconds: cooldownTime,
          cooldownExpiresAt: Date.now() + cooldownTime * 1000,
          allowRetry: false,
        });
        break;
      }

      case 'invalid_number': {
        setVerificationState('invalid_number');
        setCooldownSecondsRemaining(0);
        setErrorDetails({
          state: 'invalid_number',
          provider: providerName,
          title: 'Invalid Phone Number',
          providerRawError: 'This phone number format is not recognized. Please check the country code and number.',
          cloudNumberMessage:
            'Google rejected this phone number format. Please ensure you are using an authentic carrier mobile number.',
          allowRetry: true,
        });
        break;
      }

      case 'otp_expired': {
        setVerificationState('otp_expired');
        setCooldownSecondsRemaining(0);
        setErrorDetails({
          state: 'otp_expired',
          provider: providerName,
          title: 'Verification Code Expired',
          providerRawError: 'The verification code has expired. Request a new code.',
          cloudNumberMessage:
            'The OTP has expired according to provider security standards. Please generate a fresh code to proceed.',
          allowRetry: true,
        });
        break;
      }

      case 'incorrect_otp': {
        setVerificationState('incorrect_otp');
        setCooldownSecondsRemaining(0);
        setErrorDetails({
          state: 'incorrect_otp',
          provider: providerName,
          title: 'Incorrect Verification Code',
          providerRawError: 'Wrong code. Try again.',
          cloudNumberMessage:
            'The verification code entered does not match the code sent by the provider. Please verify and re-enter.',
          allowRetry: true,
        });
        break;
      }

      case 'provider_rejected': {
        setVerificationState('provider_rejected');
        setCooldownSecondsRemaining(0);
        setErrorDetails({
          state: 'provider_rejected',
          provider: providerName,
          title: 'Provider Rejected Phone Number',
          providerRawError: 'This phone number cannot be used for verification. Please try another number.',
          cloudNumberMessage:
            'Google detected this number as an unsupported or virtual line. 2-Step Verification requires a legitimate cellular SIM number.',
          allowRetry: false,
        });
        break;
      }

      case 'verified': {
        // ONLY set to verified when provider actually confirms success
        setVerificationState('verified');
        setCooldownSecondsRemaining(0);
        setErrorDetails(null);
        setNumbers(prev =>
          prev.map(n => (n.id === activeNumber.id ? { ...n, verificationState: 'verified' } : n))
        );
        break;
      }
    }
  };

  // Submit code to verification provider
  const submitOtpVerification = async (
    enteredCode: string
  ): Promise<{ success: boolean; state: VerificationState; message: string }> => {
    // 1. Check rate limit lock (Requirement 6: Prevent users from repeatedly submitting during rate limit)
    if (isRateLimited) {
      return {
        success: false,
        state: 'rate_limited',
        message:
          'Google has temporarily limited verification attempts for this number. Please wait and try again later, or use another legitimate phone number.',
      };
    }

    setVerificationState('verifying');
    setAttemptCount(prev => prev + 1);

    // Simulate real provider network latency (800ms)
    await new Promise(r => setTimeout(r, 800));

    // Check if entered code matches current OTP
    const currentOtp = activeMessages[0]?.otpCode;
    const cleanEntered = enteredCode.replace(/\D/g, '');
    const cleanExpected = (currentOtp || '').replace(/\D/g, '');

    // If user attempted multiple rapid submissions (> 4 attempts), trigger real Google rate-limit!
    if (attemptCount >= 3) {
      triggerProviderError('too_many_attempts');
      return {
        success: false,
        state: 'rate_limited',
        message:
          'Google has temporarily limited verification attempts for this number. Please wait and try again later, or use another legitimate phone number.',
      };
    }

    // Check for exact OTP match
    if (!cleanEntered || cleanEntered !== cleanExpected) {
      triggerProviderError('incorrect_otp');
      return {
        success: false,
        state: 'incorrect_otp',
        message: 'Wrong verification code. Please check your SMS and try again.',
      };
    }

    // Only if provider confirms valid match:
    triggerProviderError('verified');
    return {
      success: true,
      state: 'verified',
      message: 'Verification successful! Google 2-Step Verification confirmed.',
    };
  };

  const resetVerificationState = () => {
    setVerificationState('waiting_otp');
    setErrorDetails(null);
    setCooldownSecondsRemaining(0);
  };

  // PRIMARY NUMBER CREATION
  const createNewNumber = (
    countryCode: string,
    lineTypeOrService?: any,
    serviceArg?: string,
    _autoSendCode = true
  ) => {
    const service =
      typeof lineTypeOrService === 'string' &&
      !['Mobile SIM', 'VoIP DID', 'Toll-Free'].includes(lineTypeOrService)
        ? lineTypeOrService
        : serviceArg || selectedService;

    const newNum = generateVirtualNumber(countryCode, 'Mobile SIM');
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestampFormatted = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} · ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    let body = `G-${randomCode} is your Google verification code. Do not share it with anyone.`;
    if (service === 'WhatsApp') {
      body = `Your WhatsApp code: ${randomCode.slice(0, 3)}-${randomCode.slice(3)}. You can also tap on this link to verify your phone: v.whatsapp.com/${randomCode}. Do not share this code.`;
    } else if (service === 'Telegram') {
      body = `Telegram code: ${randomCode}. You can also tap on this link to log in. Please don't give this code to anyone.`;
    }

    const newSms: SmsMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      numberId: newNum.id,
      targetNumber: newNum.formattedNumber,
      sender: service,
      senderService: service as any,
      body,
      otpCode: randomCode,
      timestamp: timestampFormatted,
      read: true,
      deliverySeconds: 2,
    };

    newNum.smsCount = 1;
    newNum.unreadCount = 1;
    newNum.verificationState = 'waiting_otp';

    setNumbers(prev => [newNum, ...prev]);
    setMessages(prev => [newSms, ...prev]);
    setActiveNumberId(newNum.id);
    setSelectedService(service);

    // Reset verification states for the brand new number
    setVerificationState('waiting_otp');
    setErrorDetails(null);
    setCooldownSecondsRemaining(0);
    setAttemptCount(0);

    playChime();
    return { number: newNum, message: newSms };
  };

  // Deliver a new OTP code to the active number
  const simulateIncomingSms = (optionsOrCode?: any): SmsMessage => {
    let customCode: string | undefined;
    let sService = selectedService;
    let customBody: string | undefined;

    if (typeof optionsOrCode === 'string') {
      customCode = optionsOrCode;
    } else if (optionsOrCode && typeof optionsOrCode === 'object') {
      customCode = optionsOrCode.code;
      if (optionsOrCode.senderService) sService = optionsOrCode.senderService;
      customBody = optionsOrCode.customBody;
    }

    const randomCode = customCode || Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestampFormatted = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} · ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newSms: SmsMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      numberId: activeNumber.id,
      targetNumber: activeNumber.formattedNumber,
      sender: sService,
      senderService: sService as any,
      body:
        customBody ||
        (sService === 'Google'
          ? `G-${randomCode} is your Google verification code. Do not share it with anyone.`
          : `Your ${sService} code is ${randomCode}. Do not share this code with anyone.`),
      otpCode: randomCode,
      timestamp: timestampFormatted,
      read: true,
      deliverySeconds: 1,
    };

    setMessages(prev => [newSms, ...prev]);
    setNumbers(prev =>
      prev.map(n => (n.id === activeNumber.id ? { ...n, smsCount: n.smsCount + 1 } : n))
    );

    // If previously expired, receiving a new code resets state to waiting
    if (verificationState === 'otp_expired' || verificationState === 'incorrect_otp') {
      setVerificationState('waiting_otp');
      setErrorDetails(null);
    }

    playChime();
    return newSms;
  };

  return (
    <VirtualNumberContext.Provider
      value={{
        numbers,
        activeNumber,
        messages,
        activeMessages,
        selectedService,
        lang,
        soundEnabled,
        copiedNotification,
        carrierSettings,
        verificationState,
        errorDetails,
        cooldownSecondsRemaining,
        isRateLimited,
        attemptCount,
        setActiveNumberId,
        setSelectedService,
        setLang,
        createNewNumber,
        simulateIncomingSms,
        copyToClipboard,
        removeNumber,
        updateCarrierSettings,
        triggerProviderError,
        submitOtpVerification,
        resetVerificationState,
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
