const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const { generateResultSignature } = require('./utils/signature');

const password = 'synthetic-only-password';
const invoice = '991234';
const md5 = text => crypto.createHash('md5').update(text).digest('hex').toUpperCase();

for (const amount of ['123', '123.00', '123.450000', '0.010000']) {
  test(`ResultURL preserves ${amount} exactly`, () => {
    assert.equal(generateResultSignature(amount, invoice, password), md5(`${amount}:${invoice}:${password}`));
  });
}

test('ResultURL retains sorted custom parameters', () => {
  assert.equal(generateResultSignature('123.450000', invoice, password, {shp_z: 'z', shp_a: 'a'}),
    md5(`123.450000:${invoice}:${password}:shp_a=a:shp_z=z`));
});

test('changed amount, invoice and password cannot match', () => {
  const valid = generateResultSignature('123.450000', invoice, password);
  assert.notEqual(valid, generateResultSignature('123.450001', invoice, password));
  assert.notEqual(valid, generateResultSignature('123.450000', '991235', password));
  assert.notEqual(valid, generateResultSignature('123.450000', invoice, 'different-synthetic-password'));
});

test('both production ResultURL handlers pass the original amount string', () => {
  const source = fs.readFileSync(require.resolve('./routes/robokassa'), 'utf8');
  assert.match(source, /generateResultSignature\(\s*OutSum,\s*InvId,/);
  assert.match(source, /generateResultSignature\(OutSum, InvId, password2\)/);
});
