"use client";

import { useEffect } from "react";

import { useBreadcrumb } from "@/lib/contexts/breadcrumb-context";

interface SetBreadcrumbProps {
	segment: string;
	label: string;
}

/**
 * Component to override breadcrumb label for a specific segment
 * Use this in pages to show dynamic names (e.g., user name instead of ID)
 */
export function SetBreadcrumb({ segment, label }: SetBreadcrumbProps) {
	const { setOverride } = useBreadcrumb();

	useEffect(() => {
		setOverride(segment, label);
	}, [segment, label, setOverride]);

	return null;
}
