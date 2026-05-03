import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Locale } from '@/lib/i18n'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// Shared Formatting Utilities
// ============================================================

/** Format a number as USD currency (e.g. 1234.5 → "1,234.50") */
export function formatBalance(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format a date string as locale-aware relative time (e.g. "5 хв тому", "3h ago") */
export function timeAgo(dateStr: string, locale: Locale = 'en'): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (seconds < 5) return locale === 'uk' ? 'Щойно' : 'Just now';
  if (seconds < 60) return locale === 'uk' ? `${seconds}с тому` : `${seconds}s ago`;
  if (minutes < 60) return locale === 'uk' ? `${minutes} хв тому` : `${minutes}m ago`;
  if (hours < 24) return locale === 'uk' ? `${hours} год тому` : `${hours}h ago`;
  return locale === 'uk' ? `${days} дн тому` : `${days}d ago`;
}

/** Format a date string as time (e.g. "14:32:05") */
export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
