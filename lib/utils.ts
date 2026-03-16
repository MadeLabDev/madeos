import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	return format(dateObj, "MMM dd, yyyy");
}
