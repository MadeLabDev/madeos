"use client";

import { useCallback, useState } from "react";

export interface MediaPickerModalConfig {
	isOpen: boolean;
	selectedMediaUrl: string | null;
	onSelect: (urls: string | string[]) => void;
	onClose: () => void;
	open: (selectedUrl?: string) => void;
	title?: string;
	description?: string;
}

export function useMediaPickerModal(
	onSelectCallback?: (urls: string | string[]) => void,
	config?: {
		title?: string;
		description?: string;
	},
): MediaPickerModalConfig {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);

	const open = useCallback((selectedUrl?: string) => {
		if (selectedUrl) {
			setSelectedMediaUrl(selectedUrl);
		}
		setIsOpen(true);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
		setSelectedMediaUrl(null);
	}, []);

	const handleSelect = useCallback(
		(urls: string | string[]) => {
			if (onSelectCallback) {
				onSelectCallback(urls);
			}
			close();
		},
		[onSelectCallback, close],
	);

	return {
		isOpen,
		selectedMediaUrl,
		onSelect: handleSelect,
		onClose: close,
		open,
		title: config?.title,
		description: config?.description,
	};
}
