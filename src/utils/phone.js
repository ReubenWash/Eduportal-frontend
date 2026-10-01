export const PHONE_COUNTRIES = [
  { code: 'GH', name: 'Ghana', callingCode: '233' },
  { code: 'NG', name: 'Nigeria', callingCode: '234' },
  { code: 'CI', name: "Cote d'Ivoire", callingCode: '225' },
  { code: 'TG', name: 'Togo', callingCode: '228' },
  { code: 'BJ', name: 'Benin', callingCode: '229' },
  { code: 'BF', name: 'Burkina Faso', callingCode: '226' },
  { code: 'ML', name: 'Mali', callingCode: '223' },
  { code: 'SN', name: 'Senegal', callingCode: '221' },
  { code: 'GM', name: 'Gambia', callingCode: '220' },
  { code: 'SL', name: 'Sierra Leone', callingCode: '232' },
  { code: 'LR', name: 'Liberia', callingCode: '231' },
  { code: 'ZA', name: 'South Africa', callingCode: '27' },
  { code: 'KE', name: 'Kenya', callingCode: '254' },
  { code: 'UG', name: 'Uganda', callingCode: '256' },
  { code: 'TZ', name: 'Tanzania', callingCode: '255' },
  { code: 'RW', name: 'Rwanda', callingCode: '250' },
  { code: 'US', name: 'United States', callingCode: '1' },
  { code: 'CA', name: 'Canada', callingCode: '1' },
  { code: 'GB', name: 'United Kingdom', callingCode: '44' },
  { code: 'IE', name: 'Ireland', callingCode: '353' },
  { code: 'FR', name: 'France', callingCode: '33' },
  { code: 'DE', name: 'Germany', callingCode: '49' },
  { code: 'IT', name: 'Italy', callingCode: '39' },
  { code: 'ES', name: 'Spain', callingCode: '34' },
  { code: 'NL', name: 'Netherlands', callingCode: '31' },
  { code: 'BE', name: 'Belgium', callingCode: '32' },
  { code: 'PT', name: 'Portugal', callingCode: '351' },
  { code: 'CH', name: 'Switzerland', callingCode: '41' },
  { code: 'AU', name: 'Australia', callingCode: '61' },
  { code: 'NZ', name: 'New Zealand', callingCode: '64' },
  { code: 'IN', name: 'India', callingCode: '91' },
  { code: 'PK', name: 'Pakistan', callingCode: '92' },
  { code: 'BD', name: 'Bangladesh', callingCode: '880' },
  { code: 'AE', name: 'United Arab Emirates', callingCode: '971' },
  { code: 'SA', name: 'Saudi Arabia', callingCode: '966' },
  { code: 'EG', name: 'Egypt', callingCode: '20' },
  { code: 'MA', name: 'Morocco', callingCode: '212' },
  { code: 'BR', name: 'Brazil', callingCode: '55' },
  { code: 'MX', name: 'Mexico', callingCode: '52' },
  { code: 'JP', name: 'Japan', callingCode: '81' },
  { code: 'CN', name: 'China', callingCode: '86' },
];

export const isValidE164Phone = (value) => /^\+[1-9]\d{7,14}$/.test(String(value || ''));

export const normalizePhoneForApi = (value, defaultCallingCode = '233') => {
  const raw = String(value || '').trim();
  if (isValidE164Phone(raw)) return raw;
  let digits = raw.replace(/\D/g, '');
  if (raw.startsWith('00')) {
    const international = `+${digits.slice(2)}`;
    return isValidE164Phone(international) ? international : '';
  }
  else if (digits.startsWith('0')) digits = digits.slice(1);
  else if (digits.startsWith(defaultCallingCode)) return `+${digits}`;
  const normalized = `+${defaultCallingCode}${digits}`;
  return isValidE164Phone(normalized) ? normalized : '';
};

export const toE164Phone = (countryCode, nationalNumber) => {
  let digits = String(nationalNumber || '').replace(/\D/g, '');
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits ? `+${countryCode}${digits}` : '';
};