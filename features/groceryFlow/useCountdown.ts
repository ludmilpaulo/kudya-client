import { useEffect, useState } from 'react';

export type Countdown = { days: number; hours: number; minutes: number; seconds: number; expired: boolean };

export function useCountdown(endAt: string | null | undefined): Countdown | null {
  const end = endAt ? new Date(endAt).getTime() : Number.NaN;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!Number.isFinite(end)) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [end]);

  if (!Number.isFinite(end)) return null;
  const diff = Math.max(0, end - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
    expired: diff === 0,
  };
}
