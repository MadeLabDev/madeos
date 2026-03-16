"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";

interface BreadcrumbOverride {
	segment: string;
	label: string;
}

interface BreadcrumbContextType {
	overrides: BreadcrumbOverride[];
	setOverride: (segment: string, label: string) => void;
	clearOverrides: () => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
	const [overrides, setOverrides] = useState<BreadcrumbOverride[]>([]);

	const setOverride = useCallback((segment: string, label: string) => {
		setOverrides((prev) => {
			const filtered = prev.filter((o) => o.segment !== segment);
			return [...filtered, { segment, label }];
		});
	}, []);

	const clearOverrides = useCallback(() => {
		setOverrides([]);
	}, []);

	return <BreadcrumbContext.Provider value={{ overrides, setOverride, clearOverrides }}>{children}</BreadcrumbContext.Provider>;
}

export function useBreadcrumb() {
	const context = useContext(BreadcrumbContext);
	if (!context) {
		throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
	}
	return context;
}
