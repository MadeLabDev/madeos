"use client";

import { useEffect, useState } from "react";

import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { DynamicModuleForm } from "@/components/module-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addModuleAction, getAvailableModuleTypesAction } from "@/lib/features/profile/actions";
import type { AddModuleDialogProps, ProfileModuleType, UserProfileModule } from "@/lib/features/profile/types";

export function AddModuleDialog({ open, onOpenChange, profileId, onModuleAdded }: AddModuleDialogProps) {
	const [step, setStep] = useState<"select" | "form">("select");
	const [moduleTypes, setModuleTypes] = useState<ProfileModuleType[]>([]);
	const [isLoadingTypes, setIsLoadingTypes] = useState(false);
	const [selectedModuleType, setSelectedModuleType] = useState<ProfileModuleType | null>(null);
	const [selectedColumn, setSelectedColumn] = useState<string>("1");
	const [isAdding, setIsAdding] = useState(false);

	// Load module types when dialog opens
	useEffect(() => {
		if (open && moduleTypes.length === 0) {
			loadModuleTypes();
		}

		// Reset state when closing
		if (!open) {
			setStep("select");
			setSelectedModuleType(null);
			setSelectedColumn("1");
		}
	}, [open, moduleTypes.length]);

	const loadModuleTypes = async () => {
		setIsLoadingTypes(true);
		try {
			const result = await getAvailableModuleTypesAction();

			if (result.success && result.data) {
				const types = Array.isArray(result.data) ? result.data : [result.data];
				setModuleTypes(types as ProfileModuleType[]);
			} else {
				toast.error(result.message || "Failed to load module types");
			}
		} catch (error) {
			console.error("Error loading module types:", error);
			toast.error("Failed to load module types");
		} finally {
			setIsLoadingTypes(false);
		}
	};

	const handleSelectModuleType = (moduleType: ProfileModuleType) => {
		setSelectedModuleType(moduleType);
		setStep("form");
	};

	const handleBack = () => {
		setStep("select");
		setSelectedModuleType(null);
	};

	const handleSubmitForm = async (formData: Record<string, any>) => {
		if (!selectedModuleType) {
			toast.error("Please select a module type");
			return;
		}

		setIsAdding(true);
		try {
			const result = await addModuleAction(profileId, {
				moduleTypeId: selectedModuleType.id,
				column: parseInt(selectedColumn),
				data: formData,
			});

			if (result.success && result.data) {
				toast.success(`${selectedModuleType.name} added successfully!`);
				onModuleAdded?.(result.data as UserProfileModule);
				onOpenChange(false);
			} else {
				toast.error(result.message || "Failed to add module");
			}
		} catch (error) {
			console.error("Error adding module:", error);
			toast.error("Failed to add module");
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="z-50 max-h-[80vh] max-w-2xl overflow-y-auto">
				{step === "select" ? (
					<>
						<DialogHeader>
							<DialogTitle>Add Module to Profile</DialogTitle>
							<DialogDescription>Select a module type to add to your profile</DialogDescription>
						</DialogHeader>

						{isLoadingTypes ? (
							<div className="flex items-center justify-center py-12">
								<Loader size="md" />
								<span className="text-muted-foreground ml-2">Loading module types...</span>
							</div>
						) : moduleTypes.length === 0 ? (
							<div className="py-12 text-center">
								<p className="text-muted-foreground">No module types available</p>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								{moduleTypes.map((moduleType) => (
									<Card
										key={moduleType.id}
										className="cursor-pointer transition-shadow hover:shadow-lg"
										onClick={() => handleSelectModuleType(moduleType)}>
										<CardHeader>
											<CardTitle className="text-base">{moduleType.name}</CardTitle>
											{moduleType.description && <CardDescription className="line-clamp-2 text-xs">{moduleType.description}</CardDescription>}
										</CardHeader>
										<CardContent>
											<p className="text-muted-foreground text-xs">{(moduleType.fieldSchema as any)?.fields?.length || 0} fields</p>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</>
				) : (
					<>
						<DialogHeader>
							<div className="flex items-center gap-2">
								<button
									onClick={handleBack}
									className="ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
									<ArrowLeft className="h-4 w-4" />
								</button>
								<div className="flex-1">
									<DialogTitle>{selectedModuleType?.name}</DialogTitle>
									<DialogDescription>Fill in the details for your {selectedModuleType?.name?.toLowerCase()}</DialogDescription>
								</div>
							</div>
						</DialogHeader>

						<div className="space-y-4">
							{/* Column Selection */}
							<div className="space-y-2">
								<label className="text-sm font-medium">Select Column</label>
								<Select
									value={selectedColumn}
									onValueChange={setSelectedColumn}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="1">Column 1 (Left)</SelectItem>
										<SelectItem value="2">Column 2 (Right)</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Dynamic Form */}
							{selectedModuleType && (
								<div className="border-t pt-4">
									<DynamicModuleForm
										moduleTypeName={selectedModuleType.name}
										moduleTypeDescription={selectedModuleType.description}
										fields={((selectedModuleType.fieldSchema as any)?.fields || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))}
										onSubmit={handleSubmitForm}
										isLoading={isAdding}
										onCancel={handleBack}
									/>
								</div>
							)}
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
