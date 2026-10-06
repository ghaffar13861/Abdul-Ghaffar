import { COUNTRIES } from '../data/countries';
import { Country, LineType, VirtualNumber } from '../types';

export function generateRandomDigits(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

export function generateVirtualNumber(
  countryCode: string,
  lineType: LineType = 'Mobile SIM',
  customCarrier?: string
): VirtualNumber {
  const country: Country = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];

  const prefix = country.samplePrefixes[Math.floor(Math.random() * country.samplePrefixes.length)];
  const remainingDigitsCount = country.numberLength - prefix.length;
  const suffix = generateRandomDigits(Math.max(remainingDigitsCount, 4));

  const localNumber = `${prefix}${suffix}`;
  const rawNumber = `${country.dialCode}${localNumber}`;

  // Formatted representations
  let formattedNumber = rawNumber;
  if (country.code === 'PH') {
    // Exactly matches screenshot: +639070220358
    formattedNumber = `+63${localNumber}`;
  } else if (country.code === 'US' || country.code === 'CA') {
    formattedNumber = `${country.dialCode} (${prefix}) ${suffix.slice(0, 3)}-${suffix.slice(3)}`;
  } else if (country.code === 'GB') {
    formattedNumber = `${country.dialCode} ${prefix} ${suffix.slice(0, 3)} ${suffix.slice(3)}`;
  } else if (country.code === 'PK') {
    formattedNumber = `${country.dialCode} ${prefix} ${suffix}`;
  }

  const carrier =
    customCarrier ||
    country.primaryCarriers[Math.floor(Math.random() * country.primaryCarriers.length)];

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 20 * 60 * 1000); // 20 minutes activation window

  return {
    id: `num_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    countryCode: country.code,
    countryName: country.name,
    dialCode: country.dialCode,
    rawNumber,
    formattedNumber,
    lineType,
    carrier,
    status: 'Active',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    smsCount: 0,
    unreadCount: 0,
  };
}
