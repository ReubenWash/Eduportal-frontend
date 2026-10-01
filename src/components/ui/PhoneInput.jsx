import { useState } from 'react';
import { PHONE_COUNTRIES, toE164Phone } from '../../utils/phone';

const digitsOnly = (value) => String(value || '').replace(/\D/g, '');

function countryForValue(value) {
  const digits = digitsOnly(value);
  return PHONE_COUNTRIES
    .filter(country => country.callingCode)
    .filter(country => digits.startsWith(country.callingCode))
    .sort((a, b) => b.callingCode.length - a.callingCode.length)[0]
    || PHONE_COUNTRIES.find(country => country.code === 'OTHER');
}

export default function PhoneInput({
  label = 'Phone Number',
  name = 'phone',
  value = '',
  onChange,
  required = false,
  disabled = false,
  error,
  className = '',
  ...props
}) {
  const [selectedCountry, setSelectedCountry] = useState(() => countryForValue(value));
  const [customCountryName, setCustomCountryName] = useState('');
  const [customCallingCode, setCustomCallingCode] = useState('');
  const digits = digitsOnly(value);
  const currentCountry = countryForValue(value);
  const country = currentCountry.callingCode && digits.startsWith(currentCountry.callingCode)
    ? currentCountry
    : selectedCountry;
  const callingCode = country.callingCode || customCallingCode;
  let nationalNumber = digits;
  if (country.callingCode && digits.startsWith(country.callingCode)) nationalNumber = digits.slice(country.callingCode.length);
  if (!country.callingCode && customCallingCode && digits.startsWith(customCallingCode)) nationalNumber = digits.slice(customCallingCode.length);
  if (!value || (!country.callingCode && digits.startsWith('0'))) nationalNumber = digits.slice(1);

  const updateNationalNumber = (nextValue) => {
    const nextDigits = digitsOnly(nextValue);
    onChange?.({ target: { name, value: callingCode ? toE164Phone(callingCode, nextDigits) : '' } });
  };

  const updateCountry = (event) => {
    const nextCountry = PHONE_COUNTRIES.find(item => item.code === event.target.value) || PHONE_COUNTRIES[0];
    setSelectedCountry(nextCountry);
    onChange?.({ target: { name, value: nextCountry.callingCode ? toE164Phone(nextCountry.callingCode, nationalNumber) : '' } });
  };

  const updateCustomCallingCode = (event) => {
    const nextCode = digitsOnly(event.target.value).slice(0, 3);
    setCustomCallingCode(nextCode);
    onChange?.({ target: { name, value: nextCode ? toE164Phone(nextCode, nationalNumber) : '' } });
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {country.code === 'OTHER' && (
        <div className="mb-2 grid grid-cols-2 gap-2">
          <input
            aria-label={`${label} country name`}
            value={customCountryName}
            onChange={event => setCustomCountryName(event.target.value)}
            placeholder="Country"
            required={required}
            disabled={disabled}
            className="min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            aria-label={`${label} country calling code`}
            type="tel"
            inputMode="numeric"
            value={customCallingCode}
            onChange={updateCustomCallingCode}
            placeholder="Calling code"
            required={required}
            disabled={disabled}
            pattern="[1-9][0-9]{0,2}"
            title="Enter the country calling code without a plus sign."
            className="min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
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
            <option key={item.code} value={item.code}>{item.name}</option>
          ))}
        </select>
        <span className="flex items-center bg-white px-2 text-sm text-gray-600" aria-label="Country calling code">+{callingCode}</span>
        <input
          {...props}
          name={name}
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