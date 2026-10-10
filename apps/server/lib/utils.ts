import * as bcrypt from 'bcrypt';

// Auth
export const COOKIE_MAX_AGE_SHORT = 24 * 60 * 60 * 1000; // 1 day in milliseconds
export const COOKIE_MAX_AGE_LONG = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// JWT
export const JWT_EXPIRY_SHORT = '1d';
export const JWT_EXPIRY_LONG = '30d';

// Cache
export const SCHEME_CACHE_TTL = 86400; // 24 hours in seconds
export const NAV_CACHE_TTL = Math.floor(23.5 * 60 * 60); // 23.5 hours in seconds

// Search
export const SEARCH_RESULT_LIMIT = 20;

export const hash = async (text: string) => {
  return bcrypt.hash(text, 10);
};

export const compareHash = async (plainText: string, hashedString: string) => {
  return await bcrypt.compare(plainText, hashedString);
};

export const formatINR = (amount: number): string => {
  return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
};
