import crypto from 'crypto';

interface RobokassaConfig {
  merchantLogin: string;
  password1: string;
  password2: string;
  isTest: boolean;
}

export const robokassaConfig: RobokassaConfig = {
  merchantLogin: process.env.ROBOKASSA_LOGIN || 'Minenkov-2',
  password1: process.env.ROBOKASSA_PASSWORD1 || 'Eld5Xljk2GBN4D6TJo3N',
  password2: process.env.ROBOKASSA_PASSWORD2 || 'gWtiI5Li9nqojQcc1f60',
  isTest: process.env.ROBOKASSA_TEST_MODE !== 'false', // Default to true
};

export function checkRobokassaSignature(
  outSum: string,
  invId: string,
  signatureValue: string,
  shpParams: Record<string, string> = {}
): boolean {
  const { password2 } = robokassaConfig;

  // Сортировка shp_ параметров по алфавиту
  const sortedShpKeys = Object.keys(shpParams).sort();
  const shpString = sortedShpKeys
    .map(key => `${key}=${shpParams[key]}`)
    .join(':');

  // Формирование строки для подписи
  // OutSum:InvId:Password2[:Shp_...]
  let signatureString = `${outSum}:${invId}:${password2}`;
  if (shpString) {
    signatureString += `:${shpString}`;
  }

  const mySignature = crypto
    .createHash('md5')
    .update(signatureString)
    .digest('hex')
    .toUpperCase();

  return mySignature === signatureValue.toUpperCase();
}
