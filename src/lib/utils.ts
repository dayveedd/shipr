import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNGN(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCountdown(targetDate: string | Date): {
  hours: string;
  minutes: string;
  seconds: string;
  isExpired: boolean;
} {
  const target = targetDate ? new Date(targetDate).getTime() : 0;
  const now = new Date().getTime();

  if (!targetDate || isNaN(target)) {
    return { hours: "47", minutes: "59", seconds: "50", isExpired: false };
  }

  const diff = target - now;

  if (diff <= 0) {
    return { hours: "00", minutes: "00", seconds: "00", isExpired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
    isExpired: false,
  };
}
