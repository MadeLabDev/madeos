"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

export interface InfoModalState {
	open: boolean;
	title: string;
	description?: string;
	content?: React.ReactNode;
	actionLabel?: string;
	onAction?: () => void;
}

interface InfoModalContextType {
	modalState: InfoModalState;
	showInfo: (options: Omit<InfoModalState, "open">) => void;
	closeModal: () => void;
}

const InfoModalContext = createContext<InfoModalContextType | undefined>(undefined);

export function InfoModalProvider({ children }: { children: React.ReactNode }) {
	const [modalState, setModalState] = useState<InfoModalState>({
		open: false,
		title: "",
		description: "",
		actionLabel: "Close",
	});

	const showInfo = useCallback((options: Omit<InfoModalState, "open">) => {
		setModalState({
			open: true,
			...options,
		});
	}, []);

	const closeModal = useCallback(() => {
		setModalState((prev) => ({
			...prev,
			open: false,
		}));
	}, []);

	return <InfoModalContext.Provider value={{ modalState, showInfo, closeModal }}>{children}</InfoModalContext.Provider>;
}

export function useInfoModal() {
	const context = useContext(InfoModalContext);
	if (!context) {
		throw new Error("useInfoModal must be used within InfoModalProvider");
	}
	return context;
}
