import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import esbuild from 'esbuild';
import { isValidE164Phone, normalizePhoneForApi, toE164Phone } from '../src/utils/phone.js';

const changedModules = [
  'src/components/ui/PhoneInput.jsx',
  'src/pages/guardians/Guardians.jsx',
  'src/pages/staff/Staff.jsx',
  'src/pages/settings/Settings.jsx',
  'src/pages/students/Students.jsx',
  'src/pages/superadmin/AdminSchools.jsx',
  'src/api/authApi.js',
];

test('phone input normalizes national and international values to E.164', () => {
  assert.equal(toE164Phone('233', '024 000 0000'), '+233240000000');
  assert.equal(normalizePhoneForApi('0240000000'), '+233240000000');
  assert.equal(normalizePhoneForApi('00447911123456'), '+447911123456');
  assert.equal(isValidE164Phone('+233240000000'), true);
  assert.equal(isValidE164Phone('0240000000'), false);
});

test('all changed phone entry modules parse successfully', () => {
  for (const file of changedModules) {
    const loader = file.endsWith('.jsx') ? 'jsx' : 'js';
    assert.doesNotThrow(() => esbuild.transformSync(fs.readFileSync(file, 'utf8'), { loader }), file);
  }
});
