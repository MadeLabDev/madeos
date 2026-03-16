"use client";

import { useCallback, useState } from "react";

export interface MediaPickerImagesConfig {
	isOpen: boolean;
	selectedMediaUrls: string[];
	onSelect: (urls: string[]) => void;
	onClose: () => void;
	open: (selectedUrls?: string[]) => void;
	title?: string;
	description?: string;
	allowMultiple?: boolean;
}

export function useMediaPickerImages(
	onSelectCallback?: (urls: string[]) => void,
	config?: {
		title?: string;
		description?: string;
		allowMultiple?: boolean;
	},
): MediaPickerImagesConfig {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedMediaUrls, setSelectedMediaUrls] = useState<string[]>([]);

	const open = useCallback((selectedUrls?: string[]) => {
		if (selectedUrls && selectedUrls.length > 0) {
			setSelectedMediaUrls(selectedUrls);
		} else {
			setSelectedMediaUrls([]);
		}
		setIsOpen(true);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
		setSelectedMediaUrls([]);
	}, []);

	const handleSelect = useCallback(
		(urls: string[]) => {
			setSelectedMediaUrls(urls);
			if (onSelectCallback) {
				onSelectCallback(urls);
			}
			close();
		},
		[onSelectCallback, close],
	);

	return {
		isOpen,
		selectedMediaUrls,
		onSelect: handleSelect,
		onClose: close,
		open,
		title: config?.title,
		description: config?.description,
		allowMultiple: config?.allowMultiple ?? true,
	};
}
