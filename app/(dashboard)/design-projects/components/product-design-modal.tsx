"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { ProductDesignForm } from "./product-design-form";

interface ProductDesignModalProps {
	designProjectId: string;
	children?: React.ReactNode;
	onSuccess?: () => void;
}

export function ProductDesignModal({ designProjectId, children, onSuccess }: ProductDesignModalProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Create Design
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create Product Design</DialogTitle>
				</DialogHeader>
				<ProductDesignForm
					designProjectId={designProjectId}
					hideButtons={true}
					hideHeader={true}
					onSuccess={() => {
						setOpen(false);
						onSuccess?.();
					}}
				/>
				<div className="mt-6 flex justify-end gap-3">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button
						form="product-design-form"
						type="submit">
						Create Design
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
