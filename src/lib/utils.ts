import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Hàm merge các class name vào nhau
 * @param inputs - Các class name cần merge
 * @returns Class name đã merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
