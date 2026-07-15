import * as bcrypt from 'bcrypt';

export const hash = async (text: string) => {
  return bcrypt.hash(text, 10);
};

export const compareHash = async (plainText: string, hashedString: string) => {
  return await bcrypt.compare(plainText, hashedString);
};

export const formatINR = (amount: number): string => {
  return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
};
