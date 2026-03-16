"use client";

import { useInfoModal } from "@/lib/contexts/info-modal-context";

import { InfoModal } from "./info-modal";

export function GlobalInfoModal() {
	const { modalState, closeModal } = useInfoModal();

	return (
		<InfoModal
			open={modalState.open}
			onOpenChange={closeModal}
			title={modalState.title}
			description={modalState.description}
			content={modalState.content}
			actionLabel={modalState.actionLabel}
			onAction={modalState.onAction}
		/>
	);
}
