"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { DesignBriefForm } from "./design-brief-form";

interface DesignBriefModalProps {
	designProjectId: string;
	children?: React.ReactNode;
}

export function DesignBriefModal({ designProjectId, children }: DesignBriefModalProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Create Brief
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create Design Brief</DialogTitle>
				</DialogHeader>
				<DesignBriefForm
					designProjectId={designProjectId}
					hideButtons={true}
					hideHeader={true}
				/>
				<div className="mt-6 flex justify-end gap-3">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button
						form="design-brief-form"
						type="submit">
						Create Brief
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
