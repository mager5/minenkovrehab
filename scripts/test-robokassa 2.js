const crypto = require('crypto');
const http = require('http');

// Config
const PASSWORD2 = 'gWtiI5Li9nqojQcc1f60';
const URL = 'http://localhost:3000/api/robokassa/result';
const EMAIL = 'mager50705@gmail.com'; // Use the real email to test delivery
const OUT_SUM = '1000.00';
const INV_ID = Date.now().toString(); // Unique ID

// Calculate Signature
// OutSum:InvId:Password2[:Shp_...]
// We will add Shp_Email to simulate custom param
const shpParams = {
  Shp_Email: EMAIL,
};

// Sort keys alphabetically
const sortedShpKeys = Object.keys(shpParams).sort();
const shpString = sortedShpKeys
  .map(key => `${key}=${shpParams[key]}`)
  .join(':');

const signatureString = `${OUT_SUM}:${INV_ID}:${PASSWORD2}:${shpString}`;
const signatureValue = crypto
  .createHash('md5')
  .update(signatureString)
  .digest('hex')
  .toUpperCase();

console.log('--- TEST DATA ---');
console.log(`OutSum: ${OUT_SUM}`);
console.log(`InvId: ${INV_ID}`);
console.log(`Email: ${EMAIL}`);
console.log(`Signature: ${signatureValue}`);
console.log(`Shp_Email: ${EMAIL}`);
console.log('-----------------');

// Prepare form data
const formData = new FormData();
formData.append('OutSum', OUT_SUM);
formData.append('InvId', INV_ID);
formData.append('SignatureValue', signatureValue);
formData.append('Shp_Email', EMAIL);
// formData.append('Email', EMAIL); // Optional standard field

// Send request using fetch (Node 18+)
async function sendRequest() {
  try {
    console.log(`Sending POST to ${URL}...`);
    const response = await fetch(URL, {
      method: 'POST',
      body: formData,
    });

    const text = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${text}`);
  } catch (error) {
    console.error('Error sending request:', error);
  }
}

sendRequest();
