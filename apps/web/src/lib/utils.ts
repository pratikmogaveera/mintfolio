import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(amount: number): string {
  return inrFormatter.format(amount);
}

export function maskValue(value: string, isPrivate: boolean): string {
  return isPrivate ? '.....' : value;
}

export function calculatePercentage(value: number | string, total: number | string): string {
  const t = Number(total);
  if (!t) return '0.00';
  return ((Number(value) / t) * 100).toFixed(2);
}
