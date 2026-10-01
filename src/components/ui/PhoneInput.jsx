import { useState } from 'react';
import { PHONE_COUNTRIES, toE164Phone } from '../../utils/phone';

const digitsOnly = (value) => String(value || '').replace(/\D/g, '');

function countryForValue(value) {
  const digits = digitsOnly(value);
  return PHONE_COUNTRIES
    .filter(country => digits.startsWith(country.callingCode))
    .sort((a, b) => b.callingCode.length - a.callingCode.length)[0]
    || PHONE_COUNTRIES[0];
}

export default function PhoneInput({
  label = 'Phone Number',
  value = '',
  onChange,
  required = false,
  disabled = false,
  error,
  className = '',
  ...props
}) {
  const [selectedCountry, setSelectedCountry] = useState(() => countryForValue(value));
  const digits = digitsOnly(value);
  const currentCountry = countryForValue(value);
  const country = digits.startsWith(currentCountry.callingCode) ? currentCountry : selectedCountry;
  let nationalNumber = digits;
  if (digits.startsWith(country.callingCode)) nationalNumber = digits.slice(country.callingCode.length);
  if (!value || (!digits.startsWith(country.callingCode) && digits.startsWith('0'))) nationalNumber = digits.slice(1);

  const updateNationalNumber = (nextValue) => {
    const nextDigits = digitsOnly(nextValue);
    onChange?.({ target: { value: toE164Phone(country.callingCode, nextDigits) } });
  };

  const updateCountry = (event) => {
    const nextCountry = PHONE_COUNTRIES.find(item => item.code === event.target.value) || PHONE_COUNTRIES[0];
    setSelectedCountry(nextCountry);
    onChange?.({ target: { value: toE164Phone(nextCountry.callingCode, nationalNumber) } });
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={`flex w-full overflow-hidden rounded-lg border ${error ? 'border-red-400' : 'border-gray-300'} focus-within:ring-2 focus-within:ring-indigo-500/30`}>
        <select
          aria-label={`${label} country`}
          value={country.code}
          onChange={updateCountry}
          disabled={disabled}
          className="max-w-[58%] border-0 border-r border-gray-200 bg-gray-50 px-2 py-2.5 text-sm text-gray-900 focus:outline-none"
        >
          {PHONE_COUNTRIES.map(item => (
            <option key={item.code} value={item.code}>{item.name} (+{item.callingCode})</option>
          ))}
        </select>
        <span className="flex items-center bg-white px-2 text-sm text-gray-600" aria-label="Country calling code">+{country.callingCode}</span>
        <input
          {...props}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={nationalNumber}
          onChange={event => updateNationalNumber(event.target.value)}
          required={required}
          disabled={disabled}
          pattern="[0-9]{6,14}"
          title="Enter a valid national number without the country calling code."
          placeholder="National number"
          className="min-w-0 flex-1 border-0 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:bg-gray-50"
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}