export type LineType = 'Mobile SIM' | 'VoIP DID' | 'Toll-Free';

export interface Country {
  code: string; // ISO 2-letter (e.g., 'US', 'GB', 'PK')
  name: string;
  nameUrdu?: string;
  dialCode: string; // e.g., '+1', '+44', '+92'
  flag: string; // Emoji flag or code
  region: 'North America' | 'Europe' | 'Asia' | 'Middle East' | 'Latin America' | 'Oceania' | 'Africa';
  samplePrefixes: string[];
  numberLength: number;
  primaryCarriers: string[];
  supportedLineTypes: LineType[];
  otpSuccessRate: number; // e.g. 98%
  popularServices: string[];
}

export type VerificationState =
  | 'idle'
  | 'waiting_otp'
  | 'verifying'
  | 'rate_limited'
  | 'invalid_number'
  | 'otp_expired'
  | 'incorrect_otp'
  | 'provider_rejected'
  | 'verified';

export interface VerificationErrorDetails {
  state: VerificationState;
  provider: 'Google' | 'WhatsApp' | 'Telegram' | 'TikTok' | 'Facebook' | 'Instagram' | 'Other';
  title: string;
  providerRawError: string;
  cloudNumberMessage: string;
  cooldownSeconds?: number;
  cooldownExpiresAt?: number;
  allowRetry: boolean;
}

export interface VirtualNumber {
  id: string;
  countryCode: string;
  countryName: string;
  dialCode: string;
  rawNumber: string;
  formattedNumber: string;
  lineType: LineType;
  carrier: string;
  status: 'Active' | 'Cooling' | 'Offline';
  createdAt: string;
  expiresAt: string;
  smsCount: number;
  unreadCount: number;
  verificationState?: VerificationState;
  isFavorite?: boolean;
}

export interface SmsMessage {
  id: string;
  numberId: string;
  targetNumber: string;
  sender: string;
  senderService: 'WhatsApp' | 'Telegram' | 'Google' | 'TikTok' | 'Instagram' | 'Microsoft' | 'Amazon' | 'Discord' | 'Bank' | 'Custom';
  body: string;
  otpCode?: string;
  timestamp: string;
  read: boolean;
  deliverySeconds: number;
}

export interface CarrierLookup {
  inputNumber: string;
  isValid: boolean;
  country: string;
  dialCode: string;
  carrierName: string;
  lineType: LineType;
  smsDeliverability: 'High' | 'Medium' | 'Low' | 'Restricted';
  voipRiskLevel: 'Low' | 'Medium' | 'High';
  serviceCompatibility: {
    service: string;
    compatible: boolean;
    note: string;
  }[];
}

export interface CarrierApiSettings {
  provider: 'simulator' | 'twilio' | 'telnyx' | 'custom_webhook';
  accountSid?: string;
  authToken?: string;
  apiKey?: string;
  webhookUrl?: string;
}
